// =====================================================
// VISUAL EDITOR – STYLE TYPES
// CSS-ähnliches Style-System mit Responsive Breakpoints
// =====================================================

import type { ColorValue } from '../../types/theme';

// ===== SIZE VALUE (mit Unit-Switch) =====

export interface SizeValue {
  value: number;
  unit: 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh';
}

export type SizeValueOrAuto = SizeValue | 'auto';

// ===== STYLE PROPERTIES =====

export interface StyleProperties {
  // Layout
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'inline-flex' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: SizeValueOrAuto;
  order?: number;
  gap?: SizeValue;
  rowGap?: SizeValue;
  columnGap?: SizeValue;

  // Grid (Parent)
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridAutoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  gridAutoColumns?: string;
  gridAutoRows?: string;
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  alignContent?: 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly';

  // Grid (Child)
  gridColumn?: string;
  gridRow?: string;
  justifySelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch';

  // Size
  width?: SizeValueOrAuto;
  height?: SizeValueOrAuto;
  minWidth?: SizeValueOrAuto;
  maxWidth?: SizeValueOrAuto;
  minHeight?: SizeValueOrAuto;
  maxHeight?: SizeValueOrAuto;

  // Spacing
  marginTop?: SizeValueOrAuto;
  marginRight?: SizeValueOrAuto;
  marginBottom?: SizeValueOrAuto;
  marginLeft?: SizeValueOrAuto;
  paddingTop?: SizeValue;
  paddingRight?: SizeValue;
  paddingBottom?: SizeValue;
  paddingLeft?: SizeValue;

  // Typography
  fontFamily?: string;
  fontSize?: SizeValue;
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  lineHeight?: SizeValue | number;
  letterSpacing?: SizeValue;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: ColorValue;
  fontStyle?: 'normal' | 'italic';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line';

  // Background
  backgroundColor?: ColorValue;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto' | string;
  backgroundPosition?: string;
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';

  // Border
  borderWidth?: SizeValue;
  borderTopWidth?: SizeValue;
  borderRightWidth?: SizeValue;
  borderBottomWidth?: SizeValue;
  borderLeftWidth?: SizeValue;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderColor?: ColorValue;
  borderRadius?: SizeValue;
  borderTopLeftRadius?: SizeValue;
  borderTopRightRadius?: SizeValue;
  borderBottomLeftRadius?: SizeValue;
  borderBottomRightRadius?: SizeValue;

  // Shadow
  boxShadow?: string;

  // Position
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: SizeValueOrAuto;
  right?: SizeValueOrAuto;
  bottom?: SizeValueOrAuto;
  left?: SizeValueOrAuto;
  zIndex?: number;

  // Visibility
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';

  // Object (Images)
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;

  // Transform
  transform?: string;
  transformOrigin?: string;

  // Aspect Ratio
  aspectRatio?: string;

  // Background Gradient (compiled to backgroundImage CSS)
  backgroundGradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    stops: { color: string; position: number }[];
  };

  // Cursor
  cursor?: 'pointer' | 'default' | 'text' | 'move' | 'not-allowed';
}

// ===== PSEUDO-STATES =====

/** Supported pseudo-states for interactive elements */
export type PseudoState = 'hover' | 'focus' | 'active';

/** Per-viewport style overrides for a pseudo-state */
export interface PseudoStateStyles {
  desktop: Partial<StyleProperties>;
  tablet?: Partial<StyleProperties>;
  mobile?: Partial<StyleProperties>;
}

// ===== RESPONSIVE STYLES =====

export interface ElementStyles {
  desktop: Partial<StyleProperties>;
  tablet?: Partial<StyleProperties>;
  mobile?: Partial<StyleProperties>;

  /** Pseudo-state style overrides (hover, focus, active) */
  pseudoStyles?: Partial<Record<PseudoState, PseudoStateStyles>>;
}

// ===== VIEWPORT =====

export type VEViewport = 'desktop' | 'tablet' | 'mobile';

// ===== NAMED STYLES (Class System) =====

/**
 * A named style class definition.
 * Stored in `content.styles` in the v2 JSON.
 * Supports responsive breakpoints and pseudo-states,
 * plus single `_extends` inheritance.
 */
export interface NamedStyle {
  /** Base (desktop) style properties */
  desktop: Partial<StyleProperties>;
  /** Tablet overrides */
  tablet?: Partial<StyleProperties>;
  /** Mobile overrides */
  mobile?: Partial<StyleProperties>;
  /** Pseudo-state overrides (hover, focus, active) */
  pseudoStyles?: Partial<Record<PseudoState, PseudoStateStyles>>;
  /** Single-parent class inheritance */
  _extends?: string;
  /** Reference to a TypographyToken key (Level 2 → Level 3 link) */
  _typo?: string;
}

/**
 * Map of class name → style definition.
 * This is the editor-side representation of `content.styles`.
 */
export type GlobalStyles = Record<string, NamedStyle>;

// ===== DEFAULTS =====

export const DEFAULT_SIZE_VALUE: SizeValue = { value: 0, unit: 'px' };

export function sv(value: number, unit: SizeValue['unit'] = 'px'): SizeValue {
  return { value, unit };
}
