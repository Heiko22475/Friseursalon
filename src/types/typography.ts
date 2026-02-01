// =====================================================
// TYPOGRAPHY SYSTEM TYPES
// Type definitions for the Typography System
// =====================================================

// ===== RESPONSIVE SIZE =====

export interface ResponsiveSize {
  desktop: string;
  tablet: string;
  mobile: string;
}

// ===== FONT FAMILY =====

export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';

export interface FontFamily {
  id: string;
  name: string;
  category: FontCategory;
  weights: number[];
  hasItalics: boolean;
  fallback: string;       // CSS fallback stack
  preview: string;        // Preview text sample
  cssUrl?: string;        // URL to CSS file (for local fonts)
}

// ===== TYPOGRAPHY STYLE =====

export interface TypographyStyle {
  fontFamily: string;           // Font-Family ID
  fontSize: ResponsiveSize;
  fontWeight: number;
  lineHeight: ResponsiveSize;
  letterSpacing: string;        // e.g., '-0.02em', '0.05em', '0'
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

// ===== TYPOGRAPHY CONFIG =====

export interface TypographyConfig {
  // Font selection
  headingFont: string;          // Font-Family ID for headings
  bodyFont: string;             // Font-Family ID for body text
  accentFont?: string;          // Optional: Accent font (e.g., for quotes)

  // Headings (H1-H6)
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  h5: TypographyStyle;
  h6: TypographyStyle;

  // Body text
  body: TypographyStyle;
  bodyLarge: TypographyStyle;
  bodySmall: TypographyStyle;

  // Special elements
  caption: TypographyStyle;
  button: TypographyStyle;
}

// ===== TYPOGRAPHY PRESET =====

export interface TypographyPreset {
  id: string;
  name: string;
  description: string;
  config: TypographyConfig;
}

// ===== DEFAULTS =====

export const DEFAULT_RESPONSIVE_SIZE: ResponsiveSize = {
  desktop: '1rem',
  tablet: '1rem',
  mobile: '1rem',
};

export const createDefaultTypographyStyle = (
  fontSize: { desktop: string; tablet: string; mobile: string },
  fontWeight: number = 400,
  lineHeight: { desktop: string; tablet: string; mobile: string } = { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
  letterSpacing: string = '0'
): TypographyStyle => ({
  fontFamily: 'inter',
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textTransform: 'none',
});

export const createDefaultTypographyConfig = (): TypographyConfig => ({
  headingFont: 'inter',
  bodyFont: 'inter',
  accentFont: undefined,

  h1: createDefaultTypographyStyle(
    { desktop: '3rem', tablet: '2.5rem', mobile: '2rem' },
    700,
    { desktop: '1.1', tablet: '1.15', mobile: '1.2' },
    '-0.02em'
  ),
  h2: createDefaultTypographyStyle(
    { desktop: '2.25rem', tablet: '2rem', mobile: '1.75rem' },
    600,
    { desktop: '1.2', tablet: '1.25', mobile: '1.3' },
    '-0.01em'
  ),
  h3: createDefaultTypographyStyle(
    { desktop: '1.875rem', tablet: '1.625rem', mobile: '1.5rem' },
    600,
    { desktop: '1.25', tablet: '1.3', mobile: '1.35' },
    '-0.01em'
  ),
  h4: createDefaultTypographyStyle(
    { desktop: '1.5rem', tablet: '1.375rem', mobile: '1.25rem' },
    600,
    { desktop: '1.3', tablet: '1.35', mobile: '1.4' },
    '0'
  ),
  h5: createDefaultTypographyStyle(
    { desktop: '1.25rem', tablet: '1.125rem', mobile: '1.125rem' },
    600,
    { desktop: '1.4', tablet: '1.4', mobile: '1.45' },
    '0'
  ),
  h6: createDefaultTypographyStyle(
    { desktop: '1rem', tablet: '1rem', mobile: '1rem' },
    600,
    { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
    '0'
  ),

  body: createDefaultTypographyStyle(
    { desktop: '1rem', tablet: '0.9375rem', mobile: '0.9375rem' },
    400,
    { desktop: '1.6', tablet: '1.6', mobile: '1.6' },
    '0'
  ),
  bodyLarge: createDefaultTypographyStyle(
    { desktop: '1.125rem', tablet: '1rem', mobile: '1rem' },
    400,
    { desktop: '1.6', tablet: '1.6', mobile: '1.6' },
    '0'
  ),
  bodySmall: createDefaultTypographyStyle(
    { desktop: '0.875rem', tablet: '0.875rem', mobile: '0.875rem' },
    400,
    { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
    '0'
  ),

  caption: createDefaultTypographyStyle(
    { desktop: '0.75rem', tablet: '0.75rem', mobile: '0.75rem' },
    400,
    { desktop: '1.4', tablet: '1.4', mobile: '1.4' },
    '0.02em'
  ),
  button: createDefaultTypographyStyle(
    { desktop: '0.875rem', tablet: '0.875rem', mobile: '0.875rem' },
    500,
    { desktop: '1', tablet: '1', mobile: '1' },
    '0.02em'
  ),
});

// ===== CSS GENERATION =====

export const generateTypographyCSSVariables = (
  config: TypographyConfig,
  fonts: FontFamily[]
): string => {
  const getFont = (id: string) => fonts.find(f => f.id === id);
  const headingFont = getFont(config.headingFont);
  const bodyFont = getFont(config.bodyFont);
  const accentFont = config.accentFont ? getFont(config.accentFont) : null;

  const headingStack = headingFont ? `'${headingFont.name}', ${headingFont.fallback}` : 'system-ui, sans-serif';
  const bodyStack = bodyFont ? `'${bodyFont.name}', ${bodyFont.fallback}` : 'system-ui, sans-serif';
  const accentStack = accentFont ? `'${accentFont.name}', ${accentFont.fallback}` : headingStack;

  return `
:root {
  /* Font Families */
  --font-heading: ${headingStack};
  --font-body: ${bodyStack};
  --font-accent: ${accentStack};

  /* H1 */
  --h1-size-desktop: ${config.h1.fontSize.desktop};
  --h1-size-tablet: ${config.h1.fontSize.tablet};
  --h1-size-mobile: ${config.h1.fontSize.mobile};
  --h1-weight: ${config.h1.fontWeight};
  --h1-line-height-desktop: ${config.h1.lineHeight.desktop};
  --h1-line-height-tablet: ${config.h1.lineHeight.tablet};
  --h1-line-height-mobile: ${config.h1.lineHeight.mobile};
  --h1-letter-spacing: ${config.h1.letterSpacing};
  --h1-transform: ${config.h1.textTransform || 'none'};

  /* H2 */
  --h2-size-desktop: ${config.h2.fontSize.desktop};
  --h2-size-tablet: ${config.h2.fontSize.tablet};
  --h2-size-mobile: ${config.h2.fontSize.mobile};
  --h2-weight: ${config.h2.fontWeight};
  --h2-line-height-desktop: ${config.h2.lineHeight.desktop};
  --h2-line-height-tablet: ${config.h2.lineHeight.tablet};
  --h2-line-height-mobile: ${config.h2.lineHeight.mobile};
  --h2-letter-spacing: ${config.h2.letterSpacing};
  --h2-transform: ${config.h2.textTransform || 'none'};

  /* H3 */
  --h3-size-desktop: ${config.h3.fontSize.desktop};
  --h3-size-tablet: ${config.h3.fontSize.tablet};
  --h3-size-mobile: ${config.h3.fontSize.mobile};
  --h3-weight: ${config.h3.fontWeight};
  --h3-line-height-desktop: ${config.h3.lineHeight.desktop};
  --h3-line-height-tablet: ${config.h3.lineHeight.tablet};
  --h3-line-height-mobile: ${config.h3.lineHeight.mobile};
  --h3-letter-spacing: ${config.h3.letterSpacing};
  --h3-transform: ${config.h3.textTransform || 'none'};

  /* H4 */
  --h4-size-desktop: ${config.h4.fontSize.desktop};
  --h4-size-tablet: ${config.h4.fontSize.tablet};
  --h4-size-mobile: ${config.h4.fontSize.mobile};
  --h4-weight: ${config.h4.fontWeight};
  --h4-line-height-desktop: ${config.h4.lineHeight.desktop};
  --h4-line-height-tablet: ${config.h4.lineHeight.tablet};
  --h4-line-height-mobile: ${config.h4.lineHeight.mobile};
  --h4-letter-spacing: ${config.h4.letterSpacing};
  --h4-transform: ${config.h4.textTransform || 'none'};

  /* H5 */
  --h5-size-desktop: ${config.h5.fontSize.desktop};
  --h5-size-tablet: ${config.h5.fontSize.tablet};
  --h5-size-mobile: ${config.h5.fontSize.mobile};
  --h5-weight: ${config.h5.fontWeight};
  --h5-line-height-desktop: ${config.h5.lineHeight.desktop};
  --h5-line-height-tablet: ${config.h5.lineHeight.tablet};
  --h5-line-height-mobile: ${config.h5.lineHeight.mobile};
  --h5-letter-spacing: ${config.h5.letterSpacing};
  --h5-transform: ${config.h5.textTransform || 'none'};

  /* H6 */
  --h6-size-desktop: ${config.h6.fontSize.desktop};
  --h6-size-tablet: ${config.h6.fontSize.tablet};
  --h6-size-mobile: ${config.h6.fontSize.mobile};
  --h6-weight: ${config.h6.fontWeight};
  --h6-line-height-desktop: ${config.h6.lineHeight.desktop};
  --h6-line-height-tablet: ${config.h6.lineHeight.tablet};
  --h6-line-height-mobile: ${config.h6.lineHeight.mobile};
  --h6-letter-spacing: ${config.h6.letterSpacing};
  --h6-transform: ${config.h6.textTransform || 'none'};

  /* Body */
  --body-size-desktop: ${config.body.fontSize.desktop};
  --body-size-tablet: ${config.body.fontSize.tablet};
  --body-size-mobile: ${config.body.fontSize.mobile};
  --body-weight: ${config.body.fontWeight};
  --body-line-height-desktop: ${config.body.lineHeight.desktop};
  --body-line-height-tablet: ${config.body.lineHeight.tablet};
  --body-line-height-mobile: ${config.body.lineHeight.mobile};
  --body-letter-spacing: ${config.body.letterSpacing};

  /* Body Large */
  --body-large-size-desktop: ${config.bodyLarge.fontSize.desktop};
  --body-large-size-tablet: ${config.bodyLarge.fontSize.tablet};
  --body-large-size-mobile: ${config.bodyLarge.fontSize.mobile};
  --body-large-weight: ${config.bodyLarge.fontWeight};
  --body-large-line-height-desktop: ${config.bodyLarge.lineHeight.desktop};
  --body-large-line-height-tablet: ${config.bodyLarge.lineHeight.tablet};
  --body-large-line-height-mobile: ${config.bodyLarge.lineHeight.mobile};
  --body-large-letter-spacing: ${config.bodyLarge.letterSpacing};

  /* Body Small */
  --body-small-size-desktop: ${config.bodySmall.fontSize.desktop};
  --body-small-size-tablet: ${config.bodySmall.fontSize.tablet};
  --body-small-size-mobile: ${config.bodySmall.fontSize.mobile};
  --body-small-weight: ${config.bodySmall.fontWeight};
  --body-small-line-height-desktop: ${config.bodySmall.lineHeight.desktop};
  --body-small-line-height-tablet: ${config.bodySmall.lineHeight.tablet};
  --body-small-line-height-mobile: ${config.bodySmall.lineHeight.mobile};
  --body-small-letter-spacing: ${config.bodySmall.letterSpacing};

  /* Caption */
  --caption-size-desktop: ${config.caption.fontSize.desktop};
  --caption-size-tablet: ${config.caption.fontSize.tablet};
  --caption-size-mobile: ${config.caption.fontSize.mobile};
  --caption-weight: ${config.caption.fontWeight};
  --caption-line-height-desktop: ${config.caption.lineHeight.desktop};
  --caption-line-height-tablet: ${config.caption.lineHeight.tablet};
  --caption-line-height-mobile: ${config.caption.lineHeight.mobile};
  --caption-letter-spacing: ${config.caption.letterSpacing};

  /* Button */
  --button-size-desktop: ${config.button.fontSize.desktop};
  --button-size-tablet: ${config.button.fontSize.tablet};
  --button-size-mobile: ${config.button.fontSize.mobile};
  --button-weight: ${config.button.fontWeight};
  --button-line-height-desktop: ${config.button.lineHeight.desktop};
  --button-line-height-tablet: ${config.button.lineHeight.tablet};
  --button-line-height-mobile: ${config.button.lineHeight.mobile};
  --button-letter-spacing: ${config.button.letterSpacing};
}
`.trim();
};
