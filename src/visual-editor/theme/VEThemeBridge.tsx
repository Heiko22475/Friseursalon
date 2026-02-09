// =====================================================
// VISUAL EDITOR – THEME BRIDGE
// Verbindet den Visual Editor mit dem bestehenden Theme-System
// Stellt aktive Palette, Semantic Tokens, Typografie und
// Farbauflösung bereit.
// =====================================================

import React, { createContext, useContext, useMemo } from 'react';
import { useActiveTheme } from '../../hooks/useActiveTheme';
import { resolveColor } from '../../utils/token-resolver';
import type { ColorValue, ThemeTokens, Palette, SemanticTokens } from '../../types/theme';
import type { TypographyConfig } from '../../types/typography';
import { useWebsite } from '../../contexts/WebsiteContext';
import { createDefaultTypographyConfig } from '../../types/typography';

// ===== CONTEXT VALUE =====

export interface VEThemeContextValue {
  /** Aktives Theme (kann null sein wenn keins geladen) */
  theme: ThemeTokens | null;
  /** Aktive Palette */
  palette: Palette | null;
  /** Semantic Tokens */
  semanticTokens: SemanticTokens | null;
  /** Typografie-Config aus dem Website JSON */
  typography: TypographyConfig;
  /** Löst einen ColorValue zu einem Hex-String auf */
  resolveColorValue: (cv: ColorValue | undefined | null) => string;
  /** Gibt alle verfügbaren Theme-Farben als Swatches zurück */
  getThemeSwatches: () => ThemeSwatch[];
  /** Ob ein Theme geladen ist */
  hasTheme: boolean;
}

export interface ThemeSwatch {
  label: string;
  hex: string;
  tokenRef: string;
}

// ===== CONTEXT =====

const VEThemeContext = createContext<VEThemeContextValue | null>(null);

// ===== PROVIDER =====

export const VEThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useActiveTheme();
  const { websiteRecord } = useWebsite();

  // Typografie aus dem Website JSON
  const typography = useMemo<TypographyConfig>(() => {
    if (websiteRecord?.content?.typography) {
      return websiteRecord.content.typography as TypographyConfig;
    }
    return createDefaultTypographyConfig();
  }, [websiteRecord?.content?.typography]);

  // Color Resolver
  const resolveColorValueFn = useMemo(() => {
    return (cv: ColorValue | undefined | null): string => {
      if (!cv) return 'transparent';
      if (cv.kind === 'custom') return cv.hex || 'transparent';
      if (cv.kind === 'tokenRef' && theme) {
        return resolveColor(cv, theme) || '#000000';
      }
      return '#000000';
    };
  }, [theme]);

  // Theme Swatches für den Color Picker
  const getThemeSwatches = useMemo(() => {
    return (): ThemeSwatch[] => {
      if (!theme?.palette) return [];

      const swatches: ThemeSwatch[] = [];
      const palette = theme.palette;

      // 5 Primary-Farben
      for (let i = 1; i <= 5; i++) {
        const key = `primary${i}` as keyof Palette;
        const hex = palette[key];
        if (typeof hex === 'string') {
          swatches.push({
            label: `Primary ${i}`,
            hex,
            tokenRef: `palette.primary${i}.base`,
          });
        }
      }

      // Semantic Tokens (die wichtigsten)
      if (theme.semantic_tokens) {
        const st = theme.semantic_tokens;
        const semanticEntries: [string, ColorValue | null][] = [
          ['Page BG', st.page_bg as ColorValue],
          ['Content BG', st.content_bg as ColorValue],
          ['Card BG', st.card_bg as ColorValue],
          ['Heading', st.heading_text as ColorValue],
          ['Body Text', st.body_text as ColorValue],
          ['Muted Text', st.muted_text as ColorValue],
          ['Border', st.border as ColorValue],
          ['Button Primary', st.button_primary_bg as ColorValue],
          ['Button Text', st.button_primary_text as ColorValue],
          ['Link', st.link as ColorValue],
        ];

        for (const [label, cv] of semanticEntries) {
          if (cv && typeof cv === 'object' && 'kind' in cv) {
            const resolved = resolveColorValueFn(cv);
            if (resolved !== 'transparent' && resolved !== '#000000') {
              swatches.push({
                label,
                hex: resolved,
                tokenRef: `semantic.${label.toLowerCase().replace(/\s+/g, '')}`,
              });
            }
          }
        }
      }

      return swatches;
    };
  }, [theme, resolveColorValueFn]);

  const value: VEThemeContextValue = {
    theme,
    palette: theme?.palette || null,
    semanticTokens: theme?.semantic_tokens || null,
    typography,
    resolveColorValue: resolveColorValueFn,
    getThemeSwatches,
    hasTheme: !!theme,
  };

  return (
    <VEThemeContext.Provider value={value}>
      {children}
    </VEThemeContext.Provider>
  );
};

// ===== HOOK =====

export function useVETheme(): VEThemeContextValue {
  const ctx = useContext(VEThemeContext);
  if (!ctx) {
    // Fallback wenn außerhalb des Providers (z.B. Preview)
    return {
      theme: null,
      palette: null,
      semanticTokens: null,
      typography: createDefaultTypographyConfig(),
      resolveColorValue: (cv) => {
        if (!cv) return 'transparent';
        if (cv.kind === 'custom') return cv.hex;
        return '#000000';
      },
      getThemeSwatches: () => [],
      hasTheme: false,
    };
  }
  return ctx;
}
