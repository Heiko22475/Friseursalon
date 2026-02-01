// =====================================================
// FONT LIBRARY
// Predefined fonts for the Typography System
// All fonts are from Google Fonts (Open Font License)
// =====================================================

import { FontFamily, TypographyPreset, createDefaultTypographyConfig } from '../types/typography';

// ===== SANS-SERIF FONTS =====

export const SANS_SERIF_FONTS: FontFamily[] = [
  {
    id: 'inter',
    name: 'Inter',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700],
    hasItalics: true,
    fallback: 'system-ui, -apple-system, sans-serif',
    preview: 'Modern und neutral für alle Anwendungen',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    hasItalics: true,
    fallback: 'system-ui, sans-serif',
    preview: 'Geometrisch und freundlich',
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    hasItalics: true,
    fallback: 'system-ui, sans-serif',
    preview: 'Klassisch und gut lesbar',
  },
  {
    id: 'nunito',
    name: 'Nunito',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    hasItalics: true,
    fallback: 'system-ui, sans-serif',
    preview: 'Weich und einladend',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    hasItalics: true,
    fallback: 'system-ui, sans-serif',
    preview: 'Elegant und modern',
  },
  {
    id: 'lato',
    name: 'Lato',
    category: 'sans-serif',
    weights: [300, 400, 700, 900],
    hasItalics: true,
    fallback: 'system-ui, sans-serif',
    preview: 'Warm und professionell',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    category: 'sans-serif',
    weights: [300, 400, 500, 700, 900],
    hasItalics: true,
    fallback: 'system-ui, sans-serif',
    preview: 'Klar und mechanisch',
  },
  {
    id: 'work-sans',
    name: 'Work Sans',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700],
    hasItalics: true,
    fallback: 'system-ui, sans-serif',
    preview: 'Optimiert für Bildschirme',
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    category: 'sans-serif',
    weights: [400, 500, 700],
    hasItalics: true,
    fallback: 'system-ui, sans-serif',
    preview: 'Minimalistisch und clean',
  },
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    hasItalics: true,
    fallback: 'system-ui, sans-serif',
    preview: 'Modern mit Charakter',
  },
  {
    id: 'raleway',
    name: 'Raleway',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700],
    hasItalics: true,
    fallback: 'system-ui, sans-serif',
    preview: 'Elegant für Überschriften',
  },
  {
    id: 'source-sans-3',
    name: 'Source Sans 3',
    category: 'sans-serif',
    weights: [300, 400, 600, 700],
    hasItalics: true,
    fallback: 'system-ui, sans-serif',
    preview: 'Adobe-Qualität, vielseitig',
  },
];

// ===== SERIF FONTS =====

export const SERIF_FONTS: FontFamily[] = [
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    category: 'serif',
    weights: [400, 500, 600, 700, 800],
    hasItalics: true,
    fallback: 'Georgia, serif',
    preview: 'Elegant für Überschriften',
  },
  {
    id: 'lora',
    name: 'Lora',
    category: 'serif',
    weights: [400, 500, 600, 700],
    hasItalics: true,
    fallback: 'Georgia, serif',
    preview: 'Zeitgemäße Antiqua',
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    category: 'serif',
    weights: [300, 400, 700, 900],
    hasItalics: true,
    fallback: 'Georgia, serif',
    preview: 'Angenehm zu lesen',
  },
  {
    id: 'source-serif-4',
    name: 'Source Serif 4',
    category: 'serif',
    weights: [300, 400, 600, 700],
    hasItalics: true,
    fallback: 'Georgia, serif',
    preview: 'Adobe-Qualität, klar',
  },
  {
    id: 'crimson-pro',
    name: 'Crimson Pro',
    category: 'serif',
    weights: [300, 400, 500, 600, 700],
    hasItalics: true,
    fallback: 'Georgia, serif',
    preview: 'Buch-Stil, traditionell',
  },
  {
    id: 'cormorant',
    name: 'Cormorant',
    category: 'serif',
    weights: [300, 400, 500, 600, 700],
    hasItalics: true,
    fallback: 'Georgia, serif',
    preview: 'Fein und elegant',
  },
  {
    id: 'libre-baskerville',
    name: 'Libre Baskerville',
    category: 'serif',
    weights: [400, 700],
    hasItalics: true,
    fallback: 'Georgia, serif',
    preview: 'Klassischer Baskerville',
  },
  {
    id: 'dm-serif-display',
    name: 'DM Serif Display',
    category: 'serif',
    weights: [400],
    hasItalics: true,
    fallback: 'Georgia, serif',
    preview: 'Modern für Headlines',
  },
];

// ===== DISPLAY FONTS =====

export const DISPLAY_FONTS: FontFamily[] = [
  {
    id: 'bebas-neue',
    name: 'Bebas Neue',
    category: 'display',
    weights: [400],
    hasItalics: false,
    fallback: 'Impact, sans-serif',
    preview: 'BOLD UND KONDENSIERT',
  },
  {
    id: 'oswald',
    name: 'Oswald',
    category: 'display',
    weights: [300, 400, 500, 600, 700],
    hasItalics: false,
    fallback: 'Impact, sans-serif',
    preview: 'Schmal für Headlines',
  },
  {
    id: 'abril-fatface',
    name: 'Abril Fatface',
    category: 'display',
    weights: [400],
    hasItalics: false,
    fallback: 'Georgia, serif',
    preview: 'Fett und ausdrucksstark',
  },
  {
    id: 'alfa-slab-one',
    name: 'Alfa Slab One',
    category: 'display',
    weights: [400],
    hasItalics: false,
    fallback: 'Georgia, serif',
    preview: 'Slab Serif Display',
  },
];

// ===== HANDWRITING FONTS =====

export const HANDWRITING_FONTS: FontFamily[] = [
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    category: 'handwriting',
    weights: [400, 500, 600, 700],
    hasItalics: false,
    fallback: 'cursive',
    preview: 'Fließend und elegant',
  },
  {
    id: 'pacifico',
    name: 'Pacifico',
    category: 'handwriting',
    weights: [400],
    hasItalics: false,
    fallback: 'cursive',
    preview: 'Retro und verspielt',
  },
  {
    id: 'great-vibes',
    name: 'Great Vibes',
    category: 'handwriting',
    weights: [400],
    hasItalics: false,
    fallback: 'cursive',
    preview: 'Kalligraphisch',
  },
  {
    id: 'satisfy',
    name: 'Satisfy',
    category: 'handwriting',
    weights: [400],
    hasItalics: false,
    fallback: 'cursive',
    preview: 'Retro Script',
  },
];

// ===== MONOSPACE FONTS =====

export const MONOSPACE_FONTS: FontFamily[] = [
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    category: 'monospace',
    weights: [400, 500, 600, 700],
    hasItalics: true,
    fallback: 'monospace',
    preview: 'Für Code und Zahlen',
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    category: 'monospace',
    weights: [300, 400, 500, 600, 700],
    hasItalics: false,
    fallback: 'monospace',
    preview: 'Mit Ligaturen',
  },
];

// ===== ALL FONTS =====

export const ALL_FONTS: FontFamily[] = [
  ...SANS_SERIF_FONTS,
  ...SERIF_FONTS,
  ...DISPLAY_FONTS,
  ...HANDWRITING_FONTS,
  ...MONOSPACE_FONTS,
];

// ===== FONT BY ID =====

export const getFontById = (id: string): FontFamily | undefined => {
  return ALL_FONTS.find(f => f.id === id);
};

// ===== FONTS BY CATEGORY =====

export const getFontsByCategory = (category: FontFamily['category']): FontFamily[] => {
  return ALL_FONTS.filter(f => f.category === category);
};

// ===== GOOGLE FONTS URL GENERATOR =====

export const generateGoogleFontsUrl = (fontIds: string[]): string => {
  const fonts = fontIds
    .map(id => getFontById(id))
    .filter((f): f is FontFamily => f !== undefined);

  if (fonts.length === 0) return '';

  const families = fonts.map(font => {
    const weights = font.weights.join(';');
    const italicWeights = font.hasItalics 
      ? font.weights.map(w => `1,${w}`).join(';')
      : '';
    
    const weightStr = font.hasItalics 
      ? `ital,wght@0,${weights};${italicWeights}`
      : `wght@${weights}`;

    return `family=${font.name.replace(/ /g, '+')}:${weightStr}`;
  });

  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
};

// ===== TYPOGRAPHY PRESETS =====

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    description: 'Minimalistisch mit Inter für alles',
    config: {
      ...createDefaultTypographyConfig(),
      headingFont: 'inter',
      bodyFont: 'inter',
    },
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    description: 'Playfair Display + Lora für klassischen Look',
    config: {
      ...createDefaultTypographyConfig(),
      headingFont: 'playfair-display',
      bodyFont: 'lora',
      h1: {
        fontFamily: 'playfair-display',
        fontSize: { desktop: '3.5rem', tablet: '2.75rem', mobile: '2.25rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.1', tablet: '1.15', mobile: '1.2' },
        letterSpacing: '-0.02em',
        textTransform: 'none',
      },
      h2: {
        fontFamily: 'playfair-display',
        fontSize: { desktop: '2.5rem', tablet: '2.125rem', mobile: '1.875rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.2', tablet: '1.25', mobile: '1.3' },
        letterSpacing: '-0.01em',
        textTransform: 'none',
      },
      h3: {
        fontFamily: 'playfair-display',
        fontSize: { desktop: '2rem', tablet: '1.75rem', mobile: '1.5rem' },
        fontWeight: 500,
        lineHeight: { desktop: '1.25', tablet: '1.3', mobile: '1.35' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h4: {
        fontFamily: 'playfair-display',
        fontSize: { desktop: '1.5rem', tablet: '1.375rem', mobile: '1.25rem' },
        fontWeight: 500,
        lineHeight: { desktop: '1.3', tablet: '1.35', mobile: '1.4' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h5: {
        fontFamily: 'lora',
        fontSize: { desktop: '1.25rem', tablet: '1.125rem', mobile: '1.125rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.4', tablet: '1.4', mobile: '1.45' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h6: {
        fontFamily: 'lora',
        fontSize: { desktop: '1rem', tablet: '1rem', mobile: '1rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      body: {
        fontFamily: 'lora',
        fontSize: { desktop: '1.0625rem', tablet: '1rem', mobile: '1rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.7', tablet: '1.7', mobile: '1.7' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      bodyLarge: {
        fontFamily: 'lora',
        fontSize: { desktop: '1.1875rem', tablet: '1.0625rem', mobile: '1.0625rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.7', tablet: '1.7', mobile: '1.7' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      bodySmall: {
        fontFamily: 'lora',
        fontSize: { desktop: '0.9375rem', tablet: '0.9375rem', mobile: '0.9375rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.6', tablet: '1.6', mobile: '1.6' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      caption: {
        fontFamily: 'lora',
        fontSize: { desktop: '0.8125rem', tablet: '0.8125rem', mobile: '0.8125rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
        letterSpacing: '0.01em',
        textTransform: 'none',
      },
      button: {
        fontFamily: 'lora',
        fontSize: { desktop: '0.9375rem', tablet: '0.9375rem', mobile: '0.9375rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1', tablet: '1', mobile: '1' },
        letterSpacing: '0.02em',
        textTransform: 'none',
      },
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Montserrat + Open Sans für Business',
    config: {
      ...createDefaultTypographyConfig(),
      headingFont: 'montserrat',
      bodyFont: 'open-sans',
      h1: {
        fontFamily: 'montserrat',
        fontSize: { desktop: '3rem', tablet: '2.5rem', mobile: '2rem' },
        fontWeight: 700,
        lineHeight: { desktop: '1.1', tablet: '1.15', mobile: '1.2' },
        letterSpacing: '-0.02em',
        textTransform: 'none',
      },
      h2: {
        fontFamily: 'montserrat',
        fontSize: { desktop: '2.25rem', tablet: '2rem', mobile: '1.75rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.2', tablet: '1.25', mobile: '1.3' },
        letterSpacing: '-0.01em',
        textTransform: 'none',
      },
      h3: {
        fontFamily: 'montserrat',
        fontSize: { desktop: '1.875rem', tablet: '1.625rem', mobile: '1.5rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.25', tablet: '1.3', mobile: '1.35' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h4: {
        fontFamily: 'montserrat',
        fontSize: { desktop: '1.5rem', tablet: '1.375rem', mobile: '1.25rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.3', tablet: '1.35', mobile: '1.4' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h5: {
        fontFamily: 'montserrat',
        fontSize: { desktop: '1.25rem', tablet: '1.125rem', mobile: '1.125rem' },
        fontWeight: 500,
        lineHeight: { desktop: '1.4', tablet: '1.4', mobile: '1.45' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h6: {
        fontFamily: 'montserrat',
        fontSize: { desktop: '1rem', tablet: '1rem', mobile: '1rem' },
        fontWeight: 500,
        lineHeight: { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      body: {
        fontFamily: 'open-sans',
        fontSize: { desktop: '1rem', tablet: '0.9375rem', mobile: '0.9375rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.6', tablet: '1.6', mobile: '1.6' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      bodyLarge: {
        fontFamily: 'open-sans',
        fontSize: { desktop: '1.125rem', tablet: '1rem', mobile: '1rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.6', tablet: '1.6', mobile: '1.6' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      bodySmall: {
        fontFamily: 'open-sans',
        fontSize: { desktop: '0.875rem', tablet: '0.875rem', mobile: '0.875rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      caption: {
        fontFamily: 'open-sans',
        fontSize: { desktop: '0.75rem', tablet: '0.75rem', mobile: '0.75rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.4', tablet: '1.4', mobile: '1.4' },
        letterSpacing: '0.02em',
        textTransform: 'none',
      },
      button: {
        fontFamily: 'montserrat',
        fontSize: { desktop: '0.875rem', tablet: '0.875rem', mobile: '0.875rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1', tablet: '1', mobile: '1' },
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      },
    },
  },
  {
    id: 'friendly-rounded',
    name: 'Freundlich & Rund',
    description: 'Nunito für einen einladenden Look',
    config: {
      ...createDefaultTypographyConfig(),
      headingFont: 'nunito',
      bodyFont: 'nunito',
      h1: {
        fontFamily: 'nunito',
        fontSize: { desktop: '3rem', tablet: '2.5rem', mobile: '2rem' },
        fontWeight: 800,
        lineHeight: { desktop: '1.15', tablet: '1.2', mobile: '1.25' },
        letterSpacing: '-0.01em',
        textTransform: 'none',
      },
      h2: {
        fontFamily: 'nunito',
        fontSize: { desktop: '2.25rem', tablet: '2rem', mobile: '1.75rem' },
        fontWeight: 700,
        lineHeight: { desktop: '1.2', tablet: '1.25', mobile: '1.3' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h3: {
        fontFamily: 'nunito',
        fontSize: { desktop: '1.875rem', tablet: '1.625rem', mobile: '1.5rem' },
        fontWeight: 700,
        lineHeight: { desktop: '1.25', tablet: '1.3', mobile: '1.35' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h4: {
        fontFamily: 'nunito',
        fontSize: { desktop: '1.5rem', tablet: '1.375rem', mobile: '1.25rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.3', tablet: '1.35', mobile: '1.4' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h5: {
        fontFamily: 'nunito',
        fontSize: { desktop: '1.25rem', tablet: '1.125rem', mobile: '1.125rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.4', tablet: '1.4', mobile: '1.45' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h6: {
        fontFamily: 'nunito',
        fontSize: { desktop: '1rem', tablet: '1rem', mobile: '1rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      body: {
        fontFamily: 'nunito',
        fontSize: { desktop: '1rem', tablet: '0.9375rem', mobile: '0.9375rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.65', tablet: '1.65', mobile: '1.65' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      bodyLarge: {
        fontFamily: 'nunito',
        fontSize: { desktop: '1.125rem', tablet: '1rem', mobile: '1rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.65', tablet: '1.65', mobile: '1.65' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      bodySmall: {
        fontFamily: 'nunito',
        fontSize: { desktop: '0.875rem', tablet: '0.875rem', mobile: '0.875rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.55', tablet: '1.55', mobile: '1.55' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      caption: {
        fontFamily: 'nunito',
        fontSize: { desktop: '0.75rem', tablet: '0.75rem', mobile: '0.75rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.4', tablet: '1.4', mobile: '1.4' },
        letterSpacing: '0.01em',
        textTransform: 'none',
      },
      button: {
        fontFamily: 'nunito',
        fontSize: { desktop: '0.9375rem', tablet: '0.9375rem', mobile: '0.9375rem' },
        fontWeight: 700,
        lineHeight: { desktop: '1', tablet: '1', mobile: '1' },
        letterSpacing: '0.01em',
        textTransform: 'none',
      },
    },
  },
  {
    id: 'bold-statement',
    name: 'Bold Statement',
    description: 'Bebas Neue + Work Sans für Impact',
    config: {
      ...createDefaultTypographyConfig(),
      headingFont: 'bebas-neue',
      bodyFont: 'work-sans',
      h1: {
        fontFamily: 'bebas-neue',
        fontSize: { desktop: '4rem', tablet: '3rem', mobile: '2.5rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1', tablet: '1.05', mobile: '1.1' },
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      },
      h2: {
        fontFamily: 'bebas-neue',
        fontSize: { desktop: '3rem', tablet: '2.5rem', mobile: '2rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.05', tablet: '1.1', mobile: '1.15' },
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      },
      h3: {
        fontFamily: 'bebas-neue',
        fontSize: { desktop: '2.25rem', tablet: '2rem', mobile: '1.75rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.1', tablet: '1.15', mobile: '1.2' },
        letterSpacing: '0.01em',
        textTransform: 'uppercase',
      },
      h4: {
        fontFamily: 'work-sans',
        fontSize: { desktop: '1.5rem', tablet: '1.375rem', mobile: '1.25rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.3', tablet: '1.35', mobile: '1.4' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h5: {
        fontFamily: 'work-sans',
        fontSize: { desktop: '1.25rem', tablet: '1.125rem', mobile: '1.125rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.4', tablet: '1.4', mobile: '1.45' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      h6: {
        fontFamily: 'work-sans',
        fontSize: { desktop: '1rem', tablet: '1rem', mobile: '1rem' },
        fontWeight: 600,
        lineHeight: { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      body: {
        fontFamily: 'work-sans',
        fontSize: { desktop: '1rem', tablet: '0.9375rem', mobile: '0.9375rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.6', tablet: '1.6', mobile: '1.6' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      bodyLarge: {
        fontFamily: 'work-sans',
        fontSize: { desktop: '1.125rem', tablet: '1rem', mobile: '1rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.6', tablet: '1.6', mobile: '1.6' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      bodySmall: {
        fontFamily: 'work-sans',
        fontSize: { desktop: '0.875rem', tablet: '0.875rem', mobile: '0.875rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.5', tablet: '1.5', mobile: '1.5' },
        letterSpacing: '0',
        textTransform: 'none',
      },
      caption: {
        fontFamily: 'work-sans',
        fontSize: { desktop: '0.75rem', tablet: '0.75rem', mobile: '0.75rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1.4', tablet: '1.4', mobile: '1.4' },
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      },
      button: {
        fontFamily: 'bebas-neue',
        fontSize: { desktop: '1.125rem', tablet: '1.125rem', mobile: '1rem' },
        fontWeight: 400,
        lineHeight: { desktop: '1', tablet: '1', mobile: '1' },
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      },
    },
  },
];

// ===== GET PRESET BY ID =====

export const getTypographyPresetById = (id: string): TypographyPreset | undefined => {
  return TYPOGRAPHY_PRESETS.find(p => p.id === id);
};

// ===== CATEGORY LABELS =====

export const FONT_CATEGORY_LABELS: Record<FontFamily['category'], string> = {
  'sans-serif': 'Sans-Serif',
  'serif': 'Serif',
  'display': 'Display',
  'handwriting': 'Handschrift',
  'monospace': 'Monospace',
};
