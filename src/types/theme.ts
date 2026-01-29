// =====================================================
// THEME SYSTEM TYPES
// Type definitions for the Design Token System
// =====================================================

// ===== COLOR VALUES =====

export type ColorValue = 
  | { kind: 'tokenRef'; ref: string }  // z.B. "palette.primary1.base" oder "semantic.link"
  | { kind: 'custom'; hex: string };   // z.B. "#FF5733"

// ===== PALETTE =====

export interface Palette {
  id: string;
  name: string;
  description?: string;
  primary1: string;  // HEX: #RRGGBB
  primary2: string;
  primary3: string;
  primary4: string;
  primary5: string;
  is_preset: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AccentColors {
  accent1: string;  // Hell (für Hintergründe)
  accent2: string;  // Dunkel (für Hover-States)
  accent3: string;  // Muted (für Borders)
}

export interface AccentConfig {
  id: string;
  palette_id: string;
  primary_number: 1 | 2 | 3 | 4 | 5;
  accent_number: 1 | 2 | 3;
  hue_shift: number;        // -360 to 360
  saturation_shift: number; // -100 to 100
  lightness_shift: number;  // -100 to 100
  created_at: Date;
  updated_at: Date;
}

// ===== SEMANTIC TOKENS =====

export interface SemanticTokens {
  id: string;
  theme_id: string;
  
  // Navigation & Interaction
  link: ColorValue;
  link_hover: ColorValue;
  focus_ring: ColorValue;
  
  // Backgrounds
  page_bg: ColorValue;
  content_bg: ColorValue;
  card_bg: ColorValue;
  
  // Text
  heading_text: ColorValue;
  body_text: ColorValue;
  muted_text: ColorValue;
  
  // Borders
  border: ColorValue;
  border_light: ColorValue;
  
  // Buttons
  button_primary_bg: ColorValue;
  button_primary_text: ColorValue;
  button_secondary_bg: ColorValue;
  button_secondary_text: ColorValue;
  
  // States
  success: ColorValue;
  warning: ColorValue;
  error: ColorValue;
  info: ColorValue;
  
  created_at: Date;
  updated_at: Date;
}

// ===== TEXT MAPPING =====

export interface TextMapping {
  id: string;
  theme_id: string;
  token: string;           // z.B. "palette.primary1.base"
  mode: 'auto' | 'custom';
  custom_hex?: string;     // nur wenn mode='custom'
  created_at: Date;
  updated_at: Date;
}

// ===== THEME =====

export interface Theme {
  id: string;
  name: string;
  palette_id: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ThemeTokens {
  id: string;
  name: string;
  palette: Palette;
  semantic_tokens: SemanticTokens;
  text_mappings: TextMapping[];
  accent_configs: AccentConfig[];
  is_active: boolean;
}

// ===== TOKEN REFERENCES =====

export type PaletteTokenRef = 
  | `palette.primary${1 | 2 | 3 | 4 | 5}.base`
  | `palette.primary${1 | 2 | 3 | 4 | 5}.accents.accent${1 | 2 | 3}`;

export type SemanticTokenRef = 
  | 'semantic.link'
  | 'semantic.linkHover'
  | 'semantic.focusRing'
  | 'semantic.pageBg'
  | 'semantic.contentBg'
  | 'semantic.cardBg'
  | 'semantic.headingText'
  | 'semantic.bodyText'
  | 'semantic.mutedText'
  | 'semantic.border'
  | 'semantic.borderLight'
  | 'semantic.buttonPrimaryBg'
  | 'semantic.buttonPrimaryText'
  | 'semantic.buttonSecondaryBg'
  | 'semantic.buttonSecondaryText'
  | 'semantic.success'
  | 'semantic.warning'
  | 'semantic.error'
  | 'semantic.info';

export type TokenRef = PaletteTokenRef | SemanticTokenRef;

// ===== CONTRAST & ACCESSIBILITY =====

export type ContrastLevel = 'AAA' | 'AA' | 'FAIL';

export interface ContrastResult {
  ratio: number;
  level: ContrastLevel;
  passes: boolean;
}

// ===== CSS VARIABLES =====

export type CSSVariables = Record<string, string>;

// ===== VALIDATION =====

export interface ValidationError {
  token: string;
  error: string;
}

export interface ThemeValidation {
  valid: boolean;
  errors: ValidationError[];
  cycles: string[][] | null;
}

// ===== PALETTE PRESET FOR UI =====

export interface PalettePreset {
  id: string;
  name: string;
  colors: [string, string, string, string, string];  // 5 primary colors
}

// ===== COLOR PICKER SOURCE =====

export type ColorPickerSource = 'semantic' | 'palette' | 'custom';

export interface ColorPickerState {
  source: ColorPickerSource;
  value: ColorValue;
}
