// =====================================================
// THEME SERVICE
// CRUD operations for theme system
// =====================================================

import { supabase } from '../lib/supabase';
import {
  Palette,
  Theme,
  ThemeTokens,
  SemanticTokens,
  AccentConfig,
  TextMapping,
  ColorValue,
} from '../types/theme';

// ===== ACTIVE THEME =====

/**
 * Loads the currently active theme with all related data
 */
export async function getActiveTheme(): Promise<ThemeTokens | null> {
  try {
    // Get active theme
    const { data: theme, error: themeError } = await supabase
      .from('themes')
      .select('*')
      .eq('is_active', true)
      .single();

    if (themeError || !theme) {
      console.error('Failed to load active theme:', themeError);
      return null;
    }

    // Get palette
    let palette: Palette | null = null;
    if (theme.palette_id) {
      const { data: paletteData, error: paletteError } = await supabase
        .from('color_palettes')
        .select('*')
        .eq('id', theme.palette_id)
        .single();

      if (!paletteError && paletteData) {
        palette = paletteData as Palette;
      }
    }

    if (!palette) {
      console.error('No palette found for active theme');
      return null;
    }

    // Get semantic tokens
    const { data: semanticData, error: semanticError } = await supabase
      .from('semantic_tokens')
      .select('*')
      .eq('theme_id', theme.id)
      .single();

    if (semanticError || !semanticData) {
      console.error('Failed to load semantic tokens:', semanticError);
      return null;
    }

    const semanticTokens: SemanticTokens = semanticData as SemanticTokens;

    // Get text mappings
    const { data: textMappings, error: textError } = await supabase
      .from('text_mappings')
      .select('*')
      .eq('theme_id', theme.id);

    if (textError) {
      console.error('Failed to load text mappings:', textError);
    }

    // Get accent configs
    const { data: accentConfigs, error: accentError } = await supabase
      .from('accent_configs')
      .select('*')
      .eq('palette_id', palette.id);

    if (accentError) {
      console.error('Failed to load accent configs:', accentError);
    }

    return {
      id: theme.id,
      name: theme.name,
      palette,
      semantic_tokens: semanticTokens,
      text_mappings: (textMappings as TextMapping[]) || [],
      accent_configs: (accentConfigs as AccentConfig[]) || [],
      is_active: theme.is_active,
    };
  } catch (error) {
    console.error('Error loading active theme:', error);
    return null;
  }
}

/**
 * Loads a specific theme by ID
 */
export async function getThemeById(themeId: string): Promise<ThemeTokens | null> {
  try {
    const { data: theme, error: themeError } = await supabase
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();

    if (themeError || !theme) {
      console.error('Failed to load theme:', themeError);
      return null;
    }

    // Get palette
    let palette: Palette | null = null;
    if (theme.palette_id) {
      const { data: paletteData, error: paletteError } = await supabase
        .from('color_palettes')
        .select('*')
        .eq('id', theme.palette_id)
        .single();

      if (!paletteError && paletteData) {
        palette = paletteData as Palette;
      }
    }

    if (!palette) {
      console.error('No palette found for theme');
      return null;
    }

    // Get semantic tokens
    const { data: semanticData, error: semanticError } = await supabase
      .from('semantic_tokens')
      .select('*')
      .eq('theme_id', theme.id)
      .single();

    if (semanticError || !semanticData) {
      console.error('Failed to load semantic tokens:', semanticError);
      return null;
    }

    // Get text mappings
    const { data: textMappings } = await supabase
      .from('text_mappings')
      .select('*')
      .eq('theme_id', theme.id);

    // Get accent configs
    const { data: accentConfigs } = await supabase
      .from('accent_configs')
      .select('*')
      .eq('palette_id', palette.id);

    return {
      id: theme.id,
      name: theme.name,
      palette: palette as Palette,
      semantic_tokens: semanticData as SemanticTokens,
      text_mappings: (textMappings as TextMapping[]) || [],
      accent_configs: (accentConfigs as AccentConfig[]) || [],
      is_active: theme.is_active,
    };
  } catch (error) {
    console.error('Error loading theme:', error);
    return null;
  }
}

/**
 * Sets a theme as active (deactivates all others)
 */
export async function setActiveTheme(themeId: string): Promise<boolean> {
  try {
    // Deactivate all themes first
    const { error: deactivateError } = await supabase
      .from('themes')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

    if (deactivateError) {
      console.error('Failed to deactivate themes:', deactivateError);
      return false;
    }

    // Activate selected theme
    const { error: activateError } = await supabase
      .from('themes')
      .update({ is_active: true })
      .eq('id', themeId);

    if (activateError) {
      console.error('Failed to activate theme:', activateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting active theme:', error);
    return false;
  }
}

// ===== PALETTES =====

/**
 * Get all palettes
 */
export async function getAllPalettes(): Promise<Palette[]> {
  const { data, error } = await supabase
    .from('color_palettes')
    .select('*')
    .order('is_preset', { ascending: false })
    .order('name');

  if (error) {
    console.error('Failed to load palettes:', error);
    return [];
  }

  return data as Palette[];
}

/**
 * Get preset palettes only
 */
export async function getPresetPalettes(): Promise<Palette[]> {
  const { data, error } = await supabase
    .from('color_palettes')
    .select('*')
    .eq('is_preset', true)
    .order('name');

  if (error) {
    console.error('Failed to load preset palettes:', error);
    return [];
  }

  return data as Palette[];
}

/**
 * Create a new palette
 */
export async function createPalette(
  palette: Omit<Palette, 'id' | 'created_at' | 'updated_at'>
): Promise<Palette | null> {
  const { data, error } = await supabase
    .from('color_palettes')
    .insert([palette])
    .select()
    .single();

  if (error) {
    console.error('Failed to create palette:', error);
    return null;
  }

  return data as Palette;
}

/**
 * Update an existing palette
 */
export async function updatePalette(
  paletteId: string,
  updates: Partial<Omit<Palette, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('color_palettes')
    .update(updates)
    .eq('id', paletteId);

  if (error) {
    console.error('Failed to update palette:', error);
    return false;
  }

  return true;
}

/**
 * Delete a palette (only if not preset and not used by any theme)
 */
export async function deletePalette(paletteId: string): Promise<boolean> {
  try {
    // Check if palette is used by any theme
    const { data: themes, error: themeError } = await supabase
      .from('themes')
      .select('id')
      .eq('palette_id', paletteId);

    if (themeError) {
      console.error('Failed to check palette usage:', themeError);
      return false;
    }

    if (themes && themes.length > 0) {
      console.error('Cannot delete palette: used by themes');
      return false;
    }

    // Delete palette
    const { error } = await supabase
      .from('color_palettes')
      .delete()
      .eq('id', paletteId)
      .eq('is_preset', false); // Only allow deleting non-presets

    if (error) {
      console.error('Failed to delete palette:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting palette:', error);
    return false;
  }
}

// ===== THEMES =====

/**
 * Get all themes
 */
export async function getAllThemes(): Promise<Theme[]> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('name');

  if (error) {
    console.error('Failed to load themes:', error);
    return [];
  }

  return data as Theme[];
}

/**
 * Create a new theme
 */
export async function createTheme(
  name: string,
  paletteId: string,
  isActive: boolean = false
): Promise<string | null> {
  try {
    // Create theme
    const { data: theme, error: themeError } = await supabase
      .from('themes')
      .insert([{ name, palette_id: paletteId, is_active: isActive }])
      .select()
      .single();

    if (themeError || !theme) {
      console.error('Failed to create theme:', themeError);
      return null;
    }

    // Create default semantic tokens
    const defaultTokens = {
      theme_id: theme.id,
      link: { kind: 'tokenRef', ref: 'palette.primary1.base' },
      link_hover: { kind: 'tokenRef', ref: 'palette.primary1.accents.accent2' },
      focus_ring: { kind: 'tokenRef', ref: 'palette.primary1.base' },
      page_bg: { kind: 'tokenRef', ref: 'palette.primary5.base' },
      content_bg: { kind: 'tokenRef', ref: 'palette.primary5.accents.accent1' },
      card_bg: { kind: 'custom', hex: '#FFFFFF' },
      heading_text: { kind: 'custom', hex: '#1F2937' },
      heading_text_inverse: { kind: 'custom', hex: '#FFFFFF' },
      body_text: { kind: 'custom', hex: '#374151' },
      body_text_inverse: { kind: 'custom', hex: '#F9FAFB' },
      muted_text: { kind: 'custom', hex: '#6B7280' },
      muted_text_inverse: { kind: 'custom', hex: '#9CA3AF' },
      link_inverse: { kind: 'custom', hex: '#E5E7EB' },
      border: { kind: 'custom', hex: '#D1D5DB' },
      border_light: { kind: 'custom', hex: '#E5E7EB' },
      button_primary_bg: { kind: 'tokenRef', ref: 'palette.primary1.base' },
      button_primary_text: { kind: 'custom', hex: '#FFFFFF' },
      button_secondary_bg: { kind: 'tokenRef', ref: 'palette.primary2.base' },
      button_secondary_text: { kind: 'custom', hex: '#FFFFFF' },
      success: { kind: 'tokenRef', ref: 'palette.primary2.base' },
      warning: { kind: 'tokenRef', ref: 'palette.primary4.base' },
      error: { kind: 'tokenRef', ref: 'palette.primary1.base' },
      info: { kind: 'tokenRef', ref: 'palette.primary3.base' },
    };

    const { error: tokensError } = await supabase
      .from('semantic_tokens')
      .insert([defaultTokens]);

    if (tokensError) {
      console.error('Failed to create semantic tokens:', tokensError);
      // Rollback theme creation
      await supabase.from('themes').delete().eq('id', theme.id);
      return null;
    }

    if (isActive) {
      await setActiveTheme(theme.id);
    }

    return theme.id;
  } catch (error) {
    console.error('Error creating theme:', error);
    return null;
  }
}

/**
 * Update theme name
 */
export async function updateThemeName(themeId: string, name: string): Promise<boolean> {
  const { error } = await supabase
    .from('themes')
    .update({ name })
    .eq('id', themeId);

  if (error) {
    console.error('Failed to update theme name:', error);
    return false;
  }

  return true;
}

/**
 * Delete a theme (cannot delete active theme)
 */
export async function deleteTheme(themeId: string): Promise<boolean> {
  try {
    // Check if theme is active
    const { data: theme, error: themeError } = await supabase
      .from('themes')
      .select('is_active')
      .eq('id', themeId)
      .single();

    if (themeError) {
      console.error('Failed to check theme:', themeError);
      return false;
    }

    if (theme?.is_active) {
      console.error('Cannot delete active theme');
      return false;
    }

    // Delete semantic tokens first (FK constraint)
    await supabase.from('semantic_tokens').delete().eq('theme_id', themeId);
    
    // Delete text mappings
    await supabase.from('text_mappings').delete().eq('theme_id', themeId);

    // Delete theme
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', themeId);

    if (error) {
      console.error('Failed to delete theme:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting theme:', error);
    return false;
  }
}

// ===== SEMANTIC TOKENS =====

/**
 * Update a semantic token
 */
export async function updateSemanticToken(
  themeId: string,
  tokenName: keyof Omit<SemanticTokens, 'id' | 'theme_id' | 'created_at' | 'updated_at'>,
  value: ColorValue
): Promise<boolean> {
  const { error } = await supabase
    .from('semantic_tokens')
    .update({ [tokenName]: value })
    .eq('theme_id', themeId);

  if (error) {
    console.error('Failed to update semantic token:', error);
    return false;
  }

  return true;
}

/**
 * Update multiple semantic tokens at once
 */
export async function updateSemanticTokens(
  themeId: string,
  updates: Partial<Omit<SemanticTokens, 'id' | 'theme_id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('semantic_tokens')
    .update(updates)
    .eq('theme_id', themeId);

  if (error) {
    console.error('Failed to update semantic tokens:', error);
    return false;
  }

  return true;
}

// ===== ACCENT CONFIGS =====

/**
 * Update accent config
 */
export async function updateAccentConfig(
  configId: string,
  updates: Partial<Pick<AccentConfig, 'hue_shift' | 'saturation_shift' | 'lightness_shift'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('accent_configs')
    .update(updates)
    .eq('id', configId);

  if (error) {
    console.error('Failed to update accent config:', error);
    return false;
  }

  return true;
}

/**
 * Update accent configs for a palette
 */
export async function updateAccentConfigs(
  paletteId: string,
  configs: Array<{
    primary_number: number;
    accent_number: number;
    hue_shift: number;
    saturation_shift: number;
    lightness_shift: number;
  }>
): Promise<boolean> {
  try {
    // Update each config
    for (const config of configs) {
      const { error } = await supabase
        .from('accent_configs')
        .update({
          hue_shift: config.hue_shift,
          saturation_shift: config.saturation_shift,
          lightness_shift: config.lightness_shift,
        })
        .eq('palette_id', paletteId)
        .eq('primary_number', config.primary_number)
        .eq('accent_number', config.accent_number);

      if (error) {
        console.error('Failed to update accent config:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating accent configs:', error);
    return false;
  }
}

// ===== TEXT MAPPINGS =====

/**
 * Set text color mapping
 */
export async function setTextMapping(
  themeId: string,
  token: string,
  mode: 'auto' | 'custom',
  customHex?: string
): Promise<boolean> {
  try {
    // Check if mapping exists
    const { data: existing } = await supabase
      .from('text_mappings')
      .select('id')
      .eq('theme_id', themeId)
      .eq('token', token)
      .single();

    if (existing) {
      // Update
      const { error } = await supabase
        .from('text_mappings')
        .update({ mode, custom_hex: customHex || null })
        .eq('id', existing.id);

      if (error) {
        console.error('Failed to update text mapping:', error);
        return false;
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('text_mappings')
        .insert([{ theme_id: themeId, token, mode, custom_hex: customHex || null }]);

      if (error) {
        console.error('Failed to create text mapping:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error setting text mapping:', error);
    return false;
  }
}

/**
 * Remove text mapping (revert to auto)
 */
export async function removeTextMapping(themeId: string, token: string): Promise<boolean> {
  const { error } = await supabase
    .from('text_mappings')
    .delete()
    .eq('theme_id', themeId)
    .eq('token', token);

  if (error) {
    console.error('Failed to remove text mapping:', error);
    return false;
  }

  return true;
}
