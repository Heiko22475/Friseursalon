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
  gap?: SizeValue;
  rowGap?: SizeValue;
  columnGap?: SizeValue;

  // Grid
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;

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
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';

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
  position?: 'static' | 'relative' | 'absolute';
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

  // Cursor
  cursor?: 'pointer' | 'default' | 'text' | 'move' | 'not-allowed';
}

// ===== RESPONSIVE STYLES =====

export interface ElementStyles {
  desktop: Partial<StyleProperties>;
  tablet?: Partial<StyleProperties>;
  mobile?: Partial<StyleProperties>;
}

// ===== VIEWPORT =====

export type VEViewport = 'desktop' | 'tablet' | 'mobile';

// ===== DEFAULTS =====

export const DEFAULT_SIZE_VALUE: SizeValue = { value: 0, unit: 'px' };

export function sv(value: number, unit: SizeValue['unit'] = 'px'): SizeValue {
  return { value, unit };
}
