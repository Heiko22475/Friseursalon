// =====================================================
// TOKEN RESOLVER
// Resolves color tokens to actual hex values with cycle detection
// =====================================================

import {
  ColorValue,
  ThemeTokens,
  SemanticTokens,
  Palette,
  AccentConfig,
  TextMapping,
  ValidationError,
  ThemeValidation,
  CSSVariables,
} from '../types/theme';
import { generateAccent, autoTextColor, normalizeHex } from './color-utils';

// ===== TOKEN PARSING =====

/**
 * Parses a token reference string
 * Examples:
 * - "palette.primary1.base" -> { type: 'palette', primary: 1, accent: null }
 * - "palette.primary2.accents.accent1" -> { type: 'palette', primary: 2, accent: 1 }
 * - "semantic.link" -> { type: 'semantic', field: 'link' }
 */
function parseTokenRef(ref: string): 
  | { type: 'palette'; primary: number; accent: number | null }
  | { type: 'semantic'; field: string }
  | null {
  
  // Palette token: palette.primary{N}.base or palette.primary{N}.accents.accent{M}
  const paletteMatch = ref.match(/^palette\.primary(\d)\.(?:base|accents\.accent(\d))$/);
  if (paletteMatch) {
    return {
      type: 'palette',
      primary: parseInt(paletteMatch[1]),
      accent: paletteMatch[2] ? parseInt(paletteMatch[2]) : null,
    };
  }
  
  // Semantic token: semantic.{field}
  const semanticMatch = ref.match(/^semantic\.(.+)$/);
  if (semanticMatch) {
    return {
      type: 'semantic',
      field: semanticMatch[1],
    };
  }
  
  return null;
}

/**
 * Converts database field names to token field names
 * Examples: link_hover -> linkHover, page_bg -> pageBg
 */
function dbFieldToTokenField(dbField: string): string {
  return dbField.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts token field names to database field names
 * Examples: linkHover -> link_hover, pageBg -> page_bg
 */
function tokenFieldToDbField(tokenField: string): string {
  return tokenField.replace(/[A-Z]/g, letter => '_' + letter.toLowerCase());
}

// ===== ACCENT RESOLUTION =====

/**
 * Generates accent color from palette primary color
 */
function resolveAccent(
  palette: Palette,
  primaryNumber: number,
  accentNumber: number,
  accentConfigs: AccentConfig[]
): string | null {
  // Get base color
  const primaryKey = `primary${primaryNumber}` as keyof Palette;
  const baseColor = palette[primaryKey];
  
  if (typeof baseColor !== 'string') {
    return null;
  }
  
  // Find accent config
  const config = accentConfigs.find(
    c => c.primary_number === primaryNumber && c.accent_number === accentNumber
  );
  
  if (!config) {
    return null;
  }
  
  // Generate accent
  return generateAccent(baseColor, {
    hue_shift: config.hue_shift,
    saturation_shift: config.saturation_shift,
    lightness_shift: config.lightness_shift,
  });
}

// ===== COLOR VALUE RESOLUTION =====

/**
 * Resolves a ColorValue to a hex string
 * @param colorValue - The color value to resolve
 * @param theme - Theme tokens containing palette and semantic tokens
 * @param visited - Set of visited tokens for cycle detection
 * @returns Resolved hex color or null if resolution fails
 */
export function resolveColor(
  colorValue: ColorValue,
  theme: ThemeTokens,
  visited: Set<string> = new Set()
): string | null {
  // Direct custom hex
  if (colorValue.kind === 'custom') {
    try {
      return normalizeHex(colorValue.hex);
    } catch {
      return null;
    }
  }
  
  // Token reference
  const ref = colorValue.ref;
  
  // Cycle detection
  if (visited.has(ref)) {
    console.warn(`Cycle detected: ${Array.from(visited).join(' -> ')} -> ${ref}`);
    return null;
  }
  
  visited.add(ref);
  
  // Parse token reference
  const parsed = parseTokenRef(ref);
  if (!parsed) {
    console.warn(`Invalid token reference: ${ref}`);
    return null;
  }
  
  // Resolve palette token
  if (parsed.type === 'palette') {
    if (parsed.accent === null) {
      // Base color
      const primaryKey = `primary${parsed.primary}` as keyof Palette;
      const color = theme.palette[primaryKey];
      return typeof color === 'string' ? normalizeHex(color) : null;
    } else {
      // Accent color
      return resolveAccent(
        theme.palette,
        parsed.primary,
        parsed.accent,
        theme.accent_configs
      );
    }
  }
  
  // Resolve semantic token
  if (parsed.type === 'semantic') {
    const dbField = tokenFieldToDbField(parsed.field);
    const semanticValue = theme.semantic_tokens[dbField as keyof SemanticTokens];
    
    if (!semanticValue || typeof semanticValue === 'string' || semanticValue instanceof Date) {
      return null;
    }
    
    // Recursively resolve
    return resolveColor(semanticValue as ColorValue, theme, visited);
  }
  
  return null;
}

// ===== TEXT COLOR RESOLUTION =====

/**
 * Resolves text color for a background token
 * Uses text_mappings table to determine if auto or custom
 */
export function resolveTextColor(
  bgToken: string,
  theme: ThemeTokens
): string | null {
  // Find text mapping
  const mapping = theme.text_mappings.find(m => m.token === bgToken);
  
  // Resolve background color first
  const bgColor = resolveColor(
    { kind: 'tokenRef', ref: bgToken },
    theme
  );
  
  if (!bgColor) {
    return null;
  }
  
  // Use custom hex if specified
  if (mapping && mapping.mode === 'custom' && mapping.custom_hex) {
    try {
      return normalizeHex(mapping.custom_hex);
    } catch {
      // Fall back to auto if custom hex is invalid
    }
  }
  
  // Auto mode (default)
  return autoTextColor(bgColor);
}

// ===== BATCH RESOLUTION =====

/**
 * Resolves all semantic tokens to hex values
 */
export function resolveSemanticTokens(theme: ThemeTokens): Record<string, string | null> {
  const resolved: Record<string, string | null> = {};
  
  const semanticFields = [
    'link', 'link_hover', 'focus_ring',
    'page_bg', 'content_bg', 'card_bg',
    'heading_text', 'body_text', 'muted_text',
    'border', 'border_light',
    'button_primary_bg', 'button_primary_text',
    'button_secondary_bg', 'button_secondary_text',
    'success', 'warning', 'error', 'info',
  ];
  
  for (const field of semanticFields) {
    const value = theme.semantic_tokens[field as keyof SemanticTokens];
    if (value && typeof value !== 'string' && !(value instanceof Date)) {
      const tokenName = dbFieldToTokenField(field);
      resolved[tokenName] = resolveColor(value as ColorValue, theme);
    }
  }
  
  return resolved;
}

/**
 * Resolves all palette tokens (base + accents) to hex values
 */
export function resolvePaletteTokens(theme: ThemeTokens): Record<string, string | null> {
  const resolved: Record<string, string | null> = {};
  
  // Base colors
  for (let i = 1; i <= 5; i++) {
    const primaryKey = `primary${i}` as keyof Palette;
    const color = theme.palette[primaryKey];
    if (typeof color === 'string') {
      resolved[`primary${i}Base`] = normalizeHex(color);
      
      // Accents
      for (let j = 1; j <= 3; j++) {
        const accentColor = resolveAccent(
          theme.palette,
          i,
          j,
          theme.accent_configs
        );
        resolved[`primary${i}Accent${j}`] = accentColor;
      }
    }
  }
  
  return resolved;
}

// ===== CSS VARIABLE GENERATION =====

/**
 * Generates CSS variables for the theme
 * Format: --color-{category}-{name}: #RRGGBB
 */
export function generateCSSVariables(theme: ThemeTokens): CSSVariables {
  const variables: CSSVariables = {};
  
  // Palette variables
  const paletteTokens = resolvePaletteTokens(theme);
  for (const [key, value] of Object.entries(paletteTokens)) {
    if (value) {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      variables[`--color-palette-${cssKey}`] = value;
    }
  }
  
  // Semantic variables
  const semanticTokens = resolveSemanticTokens(theme);
  for (const [key, value] of Object.entries(semanticTokens)) {
    if (value) {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      variables[`--color-${cssKey}`] = value;
    }
  }
  
  // Text color variables
  const textTokens = [
    'page_bg', 'content_bg', 'card_bg',
    'button_primary_bg', 'button_secondary_bg',
  ];
  
  for (const token of textTokens) {
    const tokenName = `semantic.${dbFieldToTokenField(token)}`;
    const textColor = resolveTextColor(tokenName, theme);
    if (textColor) {
      const cssKey = token.replace(/_bg$/, '_text').replace(/_/g, '-');
      variables[`--color-${cssKey}-auto`] = textColor;
    }
  }
  
  return variables;
}

/**
 * Injects CSS variables into the document
 */
export function injectCSSVariables(variables: CSSVariables): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(variables)) {
    root.style.setProperty(key, value);
  }
}

/**
 * Removes all theme CSS variables from the document
 */
export function removeCSSVariables(): void {
  const root = document.documentElement;
  const styles = root.style;
  
  // Remove all --color-* variables
  for (let i = styles.length - 1; i >= 0; i--) {
    const prop = styles[i];
    if (prop.startsWith('--color-')) {
      root.style.removeProperty(prop);
    }
  }
}

// ===== CYCLE DETECTION =====

/**
 * Detects cycles in token references
 * @returns Array of token paths that form cycles, or null if no cycles
 */
export function detectCycles(theme: ThemeTokens): string[][] | null {
  const cycles: string[][] = [];
  
  const semanticFields = [
    'link', 'link_hover', 'focus_ring',
    'page_bg', 'content_bg', 'card_bg',
    'heading_text', 'body_text', 'muted_text',
    'border', 'border_light',
    'button_primary_bg', 'button_primary_text',
    'button_secondary_bg', 'button_secondary_text',
    'success', 'warning', 'error', 'info',
  ];
  
  for (const field of semanticFields) {
    const value = theme.semantic_tokens[field as keyof SemanticTokens];
    if (value && typeof value !== 'string' && !(value instanceof Date)) {
      const visited = new Set<string>();
      const tokenName = `semantic.${dbFieldToTokenField(field)}`;
      
      // Try to resolve, will fail if cycle exists
      const resolved = resolveColor(value as ColorValue, theme, visited);
      
      if (!resolved && visited.size > 0) {
        // Potential cycle
        cycles.push([tokenName, ...Array.from(visited)]);
      }
    }
  }
  
  return cycles.length > 0 ? cycles : null;
}

// ===== VALIDATION =====

/**
 * Validates a theme for errors and cycles
 */
export function validateTheme(theme: ThemeTokens): ThemeValidation {
  const errors: ValidationError[] = [];
  
  // Check for cycles
  const cycles = detectCycles(theme);
  
  // Validate palette colors
  for (let i = 1; i <= 5; i++) {
    const primaryKey = `primary${i}` as keyof Palette;
    const color = theme.palette[primaryKey];
    if (typeof color !== 'string') {
      errors.push({
        token: `palette.primary${i}`,
        error: 'Missing primary color',
      });
    } else {
      try {
        normalizeHex(color);
      } catch (e) {
        errors.push({
          token: `palette.primary${i}`,
          error: `Invalid hex color: ${color}`,
        });
      }
    }
  }
  
  // Validate semantic tokens can resolve
  const semanticFields = [
    'link', 'link_hover', 'focus_ring',
    'page_bg', 'content_bg', 'card_bg',
    'heading_text', 'body_text', 'muted_text',
    'border', 'border_light',
    'button_primary_bg', 'button_primary_text',
    'button_secondary_bg', 'button_secondary_text',
    'success', 'warning', 'error', 'info',
  ];
  
  for (const field of semanticFields) {
    const value = theme.semantic_tokens[field as keyof SemanticTokens];
    if (!value || typeof value === 'string' || value instanceof Date) {
      errors.push({
        token: `semantic.${dbFieldToTokenField(field)}`,
        error: 'Missing semantic token value',
      });
      continue;
    }
    
    const resolved = resolveColor(value as ColorValue, theme);
    if (!resolved) {
      errors.push({
        token: `semantic.${dbFieldToTokenField(field)}`,
        error: 'Cannot resolve token to hex color',
      });
    }
  }
  
  return {
    valid: errors.length === 0 && cycles === null,
    errors,
    cycles,
  };
}

// ===== EXPORTS =====

export const TOKEN_RESOLVER = {
  resolve: resolveColor,
  resolveText: resolveTextColor,
  resolveSemantic: resolveSemanticTokens,
  resolvePalette: resolvePaletteTokens,
  generateCSS: generateCSSVariables,
  injectCSS: injectCSSVariables,
  removeCSS: removeCSSVariables,
  detectCycles,
  validate: validateTheme,
  parseRef: parseTokenRef,
} as const;
