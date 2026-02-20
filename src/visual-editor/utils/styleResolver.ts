// =====================================================
// VISUAL EDITOR – STYLE RESOLVER
// Löst responsive Styles auf und konvertiert zu CSSProperties
// =====================================================

import type { StyleProperties, ElementStyles, VEViewport, SizeValueOrAuto, GlobalStyles, NamedStyle, PseudoState, PseudoStateStyles, SizeValue } from '../types/styles';
import type { ColorValue } from '../../types/theme';
import { sizeValueToCSS } from './sizeValue';
import { ALL_FONTS } from '../../data/fonts';

import type { VEElement } from '../types/elements';
import type { FontTokenMap, TypographyTokenMap, TypographyToken, ResponsiveStringValue } from '../types/typographyTokens';

// ===== COLOR RESOLVER (austauschbar) =====

/**
 * Standard-Farbauflösung: custom → hex, tokenRef → CSS Variable.
 * Kann durch setColorResolver() ersetzt werden, um das aktive Theme zu nutzen.
 */
let _colorResolver: (cv: ColorValue | undefined | null) => string | undefined = (cv) => {
  if (!cv) return undefined;
  if (cv.kind === 'custom') return cv.hex;
  if (cv.kind === 'tokenRef') return `var(--${cv.ref.replace(/\./g, '-')})`;
  return undefined;
};

/**
 * Setzt einen Custom Color Resolver (z.B. mit Theme-Daten).
 * Wird vom VEThemeBridge gesetzt.
 */
export function setColorResolver(resolver: (cv: ColorValue | undefined | null) => string | undefined) {
  _colorResolver = resolver;
}

function resolveColor(cv: ColorValue | undefined | null): string | undefined {
  return _colorResolver(cv);
}

// ===== GLOBAL STYLES REGISTRY =====

/**
 * Module-level reference to global styles, set by the EditorProvider.
 * This allows resolveStyles() to be class-aware without changing every renderer.
 */
let _globalStyles: GlobalStyles = {};

/**
 * Set the current global styles for class resolution.
 * Called by the EditorProvider whenever globalStyles change.
 */
export function setGlobalStyles(gs: GlobalStyles) {
  _globalStyles = gs;
}

export function getGlobalStyles(): GlobalStyles {
  return _globalStyles;
}

// ===== TYPOGRAPHY TOKEN REGISTRIES =====

let _fontTokens: FontTokenMap = {};
let _typographyTokens: TypographyTokenMap = {};

export function setFontTokens(ft: FontTokenMap) {
  _fontTokens = ft;
}

export function getFontTokens(): FontTokenMap {
  return _fontTokens;
}

export function setTypographyTokens(tt: TypographyTokenMap) {
  _typographyTokens = tt;
}

export function getTypographyTokens(): TypographyTokenMap {
  return _typographyTokens;
}

// ===== TYPOGRAPHY TOKEN RESOLUTION =====

/**
 * Parse a CSS string value (e.g. '1.5rem', '24px', '1.1') into a SizeValue.
 * Falls back to a plain number (for lineHeight like '1.5') or px.
 */
function parseCssStringToSizeValue(val: string): SizeValue | number | undefined {
  if (!val || val === '0') return undefined;
  const match = val.match(/^(-?[\d.]+)(px|%|em|rem|vw|vh)?$/);
  if (match) {
    const num = parseFloat(match[1]);
    const unit = match[2] as SizeValue['unit'] | undefined;
    if (!unit) return num; // pure number (lineHeight)
    return { value: num, unit };
  }
  return undefined;
}

/**
 * Get the responsive value for a given viewport from a ResponsiveStringValue.
 */
function getResponsiveString(rsv: ResponsiveStringValue, viewport: VEViewport): string {
  if (viewport === 'mobile' && rsv.mobile) return rsv.mobile;
  if (viewport === 'tablet' && rsv.tablet) return rsv.tablet;
  return rsv.desktop;
}

/**
 * Resolve a TypographyToken into StyleProperties for a given viewport.
 * Level 1 (FontToken fontFamily) + Level 2 (TypographyToken properties).
 */
export function resolveTypographyToken(
  token: TypographyToken,
  fontTokens: FontTokenMap,
  viewport: VEViewport,
  pseudo?: 'hover',
): Partial<StyleProperties> {
  // Level 1: fontFamily from the FontToken → resolve ID to font NAME
  const ftEntry = fontTokens[token.fontToken];
  const fontId = ftEntry?.fontFamily ?? token.fontToken;
  // Convert font ID (e.g. 'playfair-display') to font name (e.g. 'Playfair Display')
  // so that stylesToCSS can match it against ALL_FONTS by name.
  const fontObj = ALL_FONTS.find(f => f.id === fontId);
  const fontFamily = fontObj?.name ?? fontId;

  const base: Partial<StyleProperties> = {
    fontFamily,
    fontWeight: token.fontWeight,
    textTransform: token.textTransform,
  };

  // fontSize
  const fs = parseCssStringToSizeValue(getResponsiveString(token.fontSize, viewport));
  if (fs !== undefined) {
    base.fontSize = typeof fs === 'number' ? { value: fs, unit: 'rem' } : fs;
  }

  // lineHeight
  const lh = parseCssStringToSizeValue(getResponsiveString(token.lineHeight, viewport));
  if (lh !== undefined) {
    base.lineHeight = lh;
  }

  // letterSpacing
  if (token.letterSpacing && token.letterSpacing !== '0') {
    const ls = parseCssStringToSizeValue(token.letterSpacing);
    if (ls !== undefined) {
      base.letterSpacing = typeof ls === 'number' ? { value: ls, unit: 'em' } : ls;
    }
  }

  // color
  if (token.color) {
    base.color = token.color;
  }

  // Hover overlay
  if (pseudo === 'hover' && token.hover) {
    if (token.hover.color) base.color = token.hover.color;
    if (token.hover.textDecoration) base.textDecoration = token.hover.textDecoration;
    if (token.hover.fontWeight) base.fontWeight = token.hover.fontWeight;
    if (token.hover.letterSpacing) {
      const hls = parseCssStringToSizeValue(token.hover.letterSpacing);
      if (hls !== undefined) {
        base.letterSpacing = typeof hls === 'number' ? { value: hls, unit: 'em' } : hls;
      }
    }
  }

  return base;
}

/**
 * Konvertiert eine SizeValueOrAuto oder Zahl zu CSS
 */
function resolveSizeOrNumber(val: SizeValueOrAuto | number | undefined): string | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'number') return `${val}`;
  return sizeValueToCSS(val);
}

/**
 * Merged Desktop-Styles mit Viewport-Overrides.
 * Desktop ist führend, Tablet/Mobile überschreiben nur gesetzte Properties.
 */
export function mergeStyles(
  styles: ElementStyles | undefined,
  viewport: VEViewport
): Partial<StyleProperties> {
  if (!styles) return {};

  const base = styles.desktop || {};
  if (viewport === 'desktop') return base;

  const override = styles[viewport] || {};
  return { ...base, ...override };
}

/**
 * Konvertiert StyleProperties zu React.CSSProperties
 */
export function stylesToCSS(props: Partial<StyleProperties>): React.CSSProperties {
  const css: React.CSSProperties = {};

  // Layout
  if (props.display) css.display = props.display;
  if (props.flexDirection) css.flexDirection = props.flexDirection;
  if (props.flexWrap) css.flexWrap = props.flexWrap;
  if (props.justifyContent) css.justifyContent = props.justifyContent;
  if (props.alignItems) css.alignItems = props.alignItems;
  if (props.alignSelf) css.alignSelf = props.alignSelf;
  if (props.flexGrow !== undefined) css.flexGrow = props.flexGrow;
  if (props.flexShrink !== undefined) css.flexShrink = props.flexShrink;
  if (props.flexBasis !== undefined) css.flexBasis = resolveSizeOrNumber(props.flexBasis);
  if (props.order !== undefined) css.order = props.order;
  if (props.gap) css.gap = sizeValueToCSS(props.gap);
  if (props.rowGap) css.rowGap = sizeValueToCSS(props.rowGap);
  if (props.columnGap) css.columnGap = sizeValueToCSS(props.columnGap);

  // Grid
  if (props.gridTemplateColumns) css.gridTemplateColumns = props.gridTemplateColumns;
  if (props.gridTemplateRows) css.gridTemplateRows = props.gridTemplateRows;
  if (props.gridAutoFlow) css.gridAutoFlow = props.gridAutoFlow;
  if (props.gridAutoColumns) css.gridAutoColumns = props.gridAutoColumns;
  if (props.gridAutoRows) css.gridAutoRows = props.gridAutoRows;
  if (props.justifyItems) css.justifyItems = props.justifyItems;
  if (props.alignContent) css.alignContent = props.alignContent;
  if (props.gridColumn) css.gridColumn = props.gridColumn;
  if (props.gridRow) css.gridRow = props.gridRow;
  if (props.justifySelf) css.justifySelf = props.justifySelf;

  // Size
  if (props.width !== undefined) css.width = resolveSizeOrNumber(props.width);
  if (props.height !== undefined) css.height = resolveSizeOrNumber(props.height);
  if (props.minWidth !== undefined) css.minWidth = resolveSizeOrNumber(props.minWidth);
  if (props.maxWidth !== undefined) css.maxWidth = resolveSizeOrNumber(props.maxWidth);
  if (props.minHeight !== undefined) css.minHeight = resolveSizeOrNumber(props.minHeight);
  if (props.maxHeight !== undefined) css.maxHeight = resolveSizeOrNumber(props.maxHeight);

  // Spacing
  if (props.marginTop !== undefined) css.marginTop = resolveSizeOrNumber(props.marginTop);
  if (props.marginRight !== undefined) css.marginRight = resolveSizeOrNumber(props.marginRight);
  if (props.marginBottom !== undefined) css.marginBottom = resolveSizeOrNumber(props.marginBottom);
  if (props.marginLeft !== undefined) css.marginLeft = resolveSizeOrNumber(props.marginLeft);
  if (props.paddingTop !== undefined) css.paddingTop = sizeValueToCSS(props.paddingTop);
  if (props.paddingRight !== undefined) css.paddingRight = sizeValueToCSS(props.paddingRight);
  if (props.paddingBottom !== undefined) css.paddingBottom = sizeValueToCSS(props.paddingBottom);
  if (props.paddingLeft !== undefined) css.paddingLeft = sizeValueToCSS(props.paddingLeft);

  // Typography
  if (props.fontFamily) {
    // Look up the font in our library to get the correct fallback
    // Try matching by name first, then by ID as fallback
    const fontEntry = ALL_FONTS.find(f => f.name === props.fontFamily)
                   || ALL_FONTS.find(f => f.id === props.fontFamily);
    if (fontEntry) {
      css.fontFamily = `"${fontEntry.name}", ${fontEntry.fallback}`;
    } else {
      css.fontFamily = props.fontFamily;
    }
  }
  if (props.fontSize) css.fontSize = sizeValueToCSS(props.fontSize);
  if (props.fontWeight !== undefined) css.fontWeight = props.fontWeight;
  if (props.lineHeight !== undefined) css.lineHeight = resolveSizeOrNumber(props.lineHeight);
  if (props.letterSpacing) css.letterSpacing = sizeValueToCSS(props.letterSpacing);
  if (props.textAlign) css.textAlign = props.textAlign;
  if (props.color) css.color = resolveColor(props.color);
  if (props.fontStyle) css.fontStyle = props.fontStyle;
  if (props.textTransform) css.textTransform = props.textTransform;
  if (props.textDecoration) css.textDecoration = props.textDecoration;
  if (props.whiteSpace) css.whiteSpace = props.whiteSpace;

  // Background
  if (props.backgroundColor) css.backgroundColor = resolveColor(props.backgroundColor);
  if (props.backgroundImage) css.backgroundImage = `url(${props.backgroundImage})`;
  if (props.backgroundSize) css.backgroundSize = props.backgroundSize;
  if (props.backgroundPosition) css.backgroundPosition = props.backgroundPosition;
  if (props.backgroundRepeat) css.backgroundRepeat = props.backgroundRepeat;

  // Border
  if (props.borderWidth) css.borderWidth = sizeValueToCSS(props.borderWidth);
  if (props.borderTopWidth) css.borderTopWidth = sizeValueToCSS(props.borderTopWidth);
  if (props.borderRightWidth) css.borderRightWidth = sizeValueToCSS(props.borderRightWidth);
  if (props.borderBottomWidth) css.borderBottomWidth = sizeValueToCSS(props.borderBottomWidth);
  if (props.borderLeftWidth) css.borderLeftWidth = sizeValueToCSS(props.borderLeftWidth);
  if (props.borderStyle) css.borderStyle = props.borderStyle;
  if (props.borderColor) css.borderColor = resolveColor(props.borderColor);
  if (props.borderRadius) css.borderRadius = sizeValueToCSS(props.borderRadius);
  if (props.borderTopLeftRadius) css.borderTopLeftRadius = sizeValueToCSS(props.borderTopLeftRadius);
  if (props.borderTopRightRadius) css.borderTopRightRadius = sizeValueToCSS(props.borderTopRightRadius);
  if (props.borderBottomLeftRadius) css.borderBottomLeftRadius = sizeValueToCSS(props.borderBottomLeftRadius);
  if (props.borderBottomRightRadius) css.borderBottomRightRadius = sizeValueToCSS(props.borderBottomRightRadius);

  // Shadow
  if (props.boxShadow) css.boxShadow = props.boxShadow;

  // Position
  if (props.position) css.position = props.position;
  if (props.top !== undefined) css.top = resolveSizeOrNumber(props.top);
  if (props.right !== undefined) css.right = resolveSizeOrNumber(props.right);
  if (props.bottom !== undefined) css.bottom = resolveSizeOrNumber(props.bottom);
  if (props.left !== undefined) css.left = resolveSizeOrNumber(props.left);
  if (props.zIndex !== undefined) css.zIndex = props.zIndex;

  // Visibility
  if (props.opacity !== undefined) css.opacity = props.opacity;
  if (props.overflow) css.overflow = props.overflow;
  if (props.overflowX) css.overflowX = props.overflowX;
  if (props.overflowY) css.overflowY = props.overflowY;

  // Object
  if (props.objectFit) css.objectFit = props.objectFit;
  if (props.objectPosition) css.objectPosition = props.objectPosition;

  // Transform
  if (props.transform) css.transform = props.transform;
  if (props.transformOrigin) css.transformOrigin = props.transformOrigin;

  // Aspect Ratio
  if (props.aspectRatio) (css as any).aspectRatio = props.aspectRatio;

  // Background Gradient (overrides backgroundImage if set)
  if (props.backgroundGradient) {
    const g = props.backgroundGradient;
    const stops = g.stops.map(s => `${s.color} ${s.position}%`).join(', ');
    if (g.type === 'linear') {
      css.backgroundImage = `linear-gradient(${g.angle ?? 180}deg, ${stops})`;
    } else {
      css.backgroundImage = `radial-gradient(circle, ${stops})`;
    }
  }

  // Cursor
  if (props.cursor) css.cursor = props.cursor;

  return css;
}

/**
 * Kombiniert: mergeStyles + stylesToCSS in einem Schritt.
 * If an element (or classNames) is provided, class-aware resolution is used.
 */
export function resolveStyles(
  styles: ElementStyles | undefined,
  viewport: VEViewport,
  element?: VEElement,
): React.CSSProperties {
  if (element?.classNames && element.classNames.length > 0) {
    return stylesToCSS(mergeStylesWithClasses(element.classNames, styles, _globalStyles, viewport));
  }
  return stylesToCSS(mergeStyles(styles, viewport));
}

// =====================================================
// CLASS-AWARE STYLE RESOLUTION
// =====================================================

/**
 * Resolve a named style, following the _extends chain and _typo token layer.
 * Returns the merged NamedStyle with all parents + typography token applied.
 *
 * Resolution order (low → high priority):
 *  1. Typography Token base (from _typo)
 *  2. Parent class (from _extends, recursive)
 *  3. This class's own properties
 */
function resolveNamedStyleChain(
  name: string,
  globalStyles: GlobalStyles,
  visited = new Set<string>()
): NamedStyle {
  if (visited.has(name)) return { desktop: {} }; // circular
  visited.add(name);
  const def = globalStyles[name];
  if (!def) return { desktop: {} };

  // Start with typography token as the lowest-priority base
  let base: NamedStyle = { desktop: {} };

  if (def._typo) {
    const token = _typographyTokens[def._typo];
    if (token) {
      const tokenDesktop = resolveTypographyToken(token, _fontTokens, 'desktop');
      const tokenTablet = resolveTypographyToken(token, _fontTokens, 'tablet');
      const tokenMobile = resolveTypographyToken(token, _fontTokens, 'mobile');

      base = {
        desktop: tokenDesktop,
        tablet: tokenTablet,
        mobile: tokenMobile,
      };

      // Token hover → pseudoStyles.hover base
      if (token.hover) {
        const tokenHoverDesktop = resolveTypographyToken(token, _fontTokens, 'desktop', 'hover');
        base.pseudoStyles = {
          hover: { desktop: tokenHoverDesktop },
        };
      }
    }
  }

  // Apply _extends parent on top of token base
  if (def._extends) {
    const parentResolved = resolveNamedStyleChain(def._extends, globalStyles, visited);
    base = {
      desktop: { ...base.desktop, ...parentResolved.desktop },
      tablet: (base.tablet || parentResolved.tablet)
        ? { ...(base.tablet || {}), ...(parentResolved.tablet || {}) }
        : undefined,
      mobile: (base.mobile || parentResolved.mobile)
        ? { ...(base.mobile || {}), ...(parentResolved.mobile || {}) }
        : undefined,
      pseudoStyles: mergePseudoStyles(base.pseudoStyles, parentResolved.pseudoStyles),
    };
  }

  // Apply this class's own properties on top (highest priority before inline)
  return {
    desktop: { ...base.desktop, ...def.desktop },
    tablet: (base.tablet || def.tablet)
      ? { ...(base.tablet || {}), ...(def.tablet || {}) }
      : undefined,
    mobile: (base.mobile || def.mobile)
      ? { ...(base.mobile || {}), ...(def.mobile || {}) }
      : undefined,
    pseudoStyles: mergePseudoStyles(base.pseudoStyles, def.pseudoStyles),
  };
}

function mergePseudoStyles(
  parent?: Partial<Record<PseudoState, PseudoStateStyles>>,
  child?: Partial<Record<PseudoState, PseudoStateStyles>>,
): Partial<Record<PseudoState, PseudoStateStyles>> | undefined {
  if (!parent && !child) return undefined;
  const result: Partial<Record<PseudoState, PseudoStateStyles>> = {};
  const allKeys = new Set([
    ...Object.keys(parent || {}),
    ...Object.keys(child || {}),
  ]) as Set<PseudoState>;
  for (const key of allKeys) {
    const p = parent?.[key];
    const c = child?.[key];
    if (!p && !c) continue;
    result[key] = {
      desktop: { ...(p?.desktop || {}), ...(c?.desktop || {}) },
      tablet: (p?.tablet || c?.tablet)
        ? { ...(p?.tablet || {}), ...(c?.tablet || {}) }
        : undefined,
      mobile: (p?.mobile || c?.mobile)
        ? { ...(p?.mobile || {}), ...(c?.mobile || {}) }
        : undefined,
    };
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Merge class styles (from classNames) + inline element styles.
 * Classes are applied left-to-right, then inline overrides on top.
 * Returns a computed ElementStyles that includes all sources.
 */
export function resolveElementStylesWithClasses(
  classNames: string[] | undefined,
  inlineStyles: ElementStyles | undefined,
  globalStyles: GlobalStyles,
): ElementStyles {
  // Start with empty
  let desktop: Partial<StyleProperties> = {};
  let tablet: Partial<StyleProperties> = {};
  let mobile: Partial<StyleProperties> = {};
  let pseudoStyles: Partial<Record<PseudoState, PseudoStateStyles>> | undefined;

  // Apply classes left-to-right
  if (classNames) {
    for (const cn of classNames) {
      const resolved = resolveNamedStyleChain(cn, globalStyles);
      desktop = { ...desktop, ...resolved.desktop };
      if (resolved.tablet) tablet = { ...tablet, ...resolved.tablet };
      if (resolved.mobile) mobile = { ...mobile, ...resolved.mobile };
      if (resolved.pseudoStyles) {
        pseudoStyles = mergePseudoStyles(pseudoStyles, resolved.pseudoStyles);
      }
    }
  }

  // Apply inline overrides on top
  if (inlineStyles) {
    desktop = { ...desktop, ...(inlineStyles.desktop || {}) };
    if (inlineStyles.tablet) tablet = { ...tablet, ...inlineStyles.tablet };
    if (inlineStyles.mobile) mobile = { ...mobile, ...inlineStyles.mobile };
    if (inlineStyles.pseudoStyles) {
      pseudoStyles = mergePseudoStyles(pseudoStyles, inlineStyles.pseudoStyles);
    }
  }

  const result: ElementStyles = { desktop };
  if (Object.keys(tablet).length > 0) result.tablet = tablet;
  if (Object.keys(mobile).length > 0) result.mobile = mobile;
  if (pseudoStyles) result.pseudoStyles = pseudoStyles;

  return result;
}

/**
 * Convenience: resolve classes + inline + viewport in one call.
 * Returns the flattened StyleProperties for the given viewport.
 */
export function mergeStylesWithClasses(
  classNames: string[] | undefined,
  inlineStyles: ElementStyles | undefined,
  globalStyles: GlobalStyles,
  viewport: VEViewport,
): Partial<StyleProperties> {
  const resolved = resolveElementStylesWithClasses(classNames, inlineStyles, globalStyles);
  return mergeStyles(resolved, viewport);
}
