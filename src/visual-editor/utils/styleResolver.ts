// =====================================================
// VISUAL EDITOR – STYLE RESOLVER
// Löst responsive Styles auf und konvertiert zu CSSProperties
// =====================================================

import type { StyleProperties, ElementStyles, VEViewport, SizeValueOrAuto } from '../types/styles';
import type { ColorValue } from '../../types/theme';
import { sizeValueToCSS } from './sizeValue';
import { ALL_FONTS } from '../../data/fonts';

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
    const fontEntry = ALL_FONTS.find(f => f.name === props.fontFamily);
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
 * Kombiniert: mergeStyles + stylesToCSS in einem Schritt
 */
export function resolveStyles(
  styles: ElementStyles | undefined,
  viewport: VEViewport
): React.CSSProperties {
  return stylesToCSS(mergeStyles(styles, viewport));
}
