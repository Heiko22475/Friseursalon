import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ThemeTokens, SemanticTokens } from '../types/theme';
import { resolveColor } from '../utils/token-resolver';

/**
 * Hook to fetch the currently active theme
 */
export function useActiveTheme() {
  const [theme, setTheme] = useState<ThemeTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  const fetchActiveTheme = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch active theme
      const { data: themeData, error: themeError } = await supabase
        .from('themes')
        .select('*')
        .eq('is_active', true)
        .single();

      if (themeError) throw themeError;
      if (!themeData) {
        setLoading(false);
        return;
      }

      // 2. Fetch Palette
      const { data: paletteData, error: paletteError } = await supabase
        .from('color_palettes')
        .select('*')
        .eq('id', themeData.palette_id)
        .single();

      if (paletteError) throw paletteError;

      // 3. Fetch Semantic Tokens
      const { data: semanticData, error: semanticError } = await supabase
        .from('semantic_tokens')
        .select('*')
        .eq('theme_id', themeData.id)
        .single();
      
      if (semanticError) throw semanticError;

      // 4. Fetch Accent Configs
      const { data: accentData, error: accentError } = await supabase
        .from('accent_configs')
        .select('*')
        .eq('palette_id', themeData.palette_id);
      
      if (accentError) throw accentError;

      // Construct ThemeTokens object (simplified for usage)
      const fullTheme: ThemeTokens = {
        ...themeData,
        palette: paletteData,
        semantic_tokens: semanticData,
        accent_configs: accentData || [],
        text_mappings: []
      };

      setTheme(fullTheme);
    } catch (err: any) {
      console.error('Error fetching active theme:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper to get a resolved color hex from a semantic token key
   */
  const getSemanticColor = (key: keyof SemanticTokens): string => {
    if (!theme || !theme.semantic_tokens) return '#000000';
    
    // Check if the property exists on semantic_tokens
    // We need to cast because Typescript doesn't know the exact shape from DB purely
    const val = (theme.semantic_tokens as any)[key];
    if (!val) return '#000000';

    return resolveColor(val, theme) || '#000000';
  };

  /**
   * Helper to get resolved Brand (Primary 1)
   */
  const getBrandColor = (): string => {
    if (!theme) return '#000000';
    return theme.palette.primary1;
  };
   /**
   * Helper to get resolved Accent (Primary 2)
   */
  const getAccentColor = (): string => {
    if (!theme) return '#000000';
    // Assuming Primary 2 is mapped to 'accent' roughly, or used as secondary
    return theme.palette.primary2;
  };


  return { theme, loading, error, getSemanticColor, getBrandColor, getAccentColor };
}
