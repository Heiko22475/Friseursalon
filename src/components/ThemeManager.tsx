// =====================================================
// THEME MANAGER
// Admin page for managing themes and color palettes
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette as PaletteIcon, Save, Download, Shuffle, Wand2 } from 'lucide-react';
import { AdminHeader } from './admin/AdminHeader';
import { ThemeTokens, Palette, PalettePreset } from '../types/theme';
import { generatePalette, HARMONY_TYPES, HarmonyType } from '../utils/color-generator';
import { getReadableTextColors } from '../utils/color-utils';
import {
  getActiveTheme,
  getAllPalettes,
  updatePalette,
  createPalette,
  updateAccentConfigs,
  updateSemanticToken,
  setActiveTheme,
  getAllThemes,
} from '../services/theme-service';
import { generateCSSVariables, injectCSSVariables, resolveColor } from '../utils/token-resolver';
import PaletteEditor from './admin/theme/PaletteEditor';
import ThemePreview from './admin/theme/ThemePreview';
import UnifiedColorPicker from './admin/theme/UnifiedColorPicker';
import { SemanticTokens, ColorValue } from '../types/theme';
import { useConfirmDialog } from './admin/ConfirmDialog';

type Tab = 'palette' | 'semantic' | 'preview';

export default function ThemeManager() {
  const navigate = useNavigate();
  const { Dialog, confirm, success: showSuccess, error: showError } = useConfirmDialog();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<ThemeTokens | null>(null);
  const [allPalettes, setAllPalettes] = useState<Palette[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('palette');
  const [_themes, setThemes] = useState<any[]>([]);
  const [selectedHarmony, setSelectedHarmony] = useState<HarmonyType>('analogous');
  const [showPresets, setShowPresets] = useState(false);
  const [selectedSemanticToken, setSelectedSemanticToken] = useState<string | null>('link');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Space key listener for random palette generation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Only trigger if not in an input field
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') {
          e.preventDefault();
          handleRandomizePalette();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [theme, selectedHarmony]);

  const loadData = async () => {
    setLoading(true);
    const [themeData, palettesData, themesData] = await Promise.all([
      getActiveTheme(),
      getAllPalettes(),
      getAllThemes(),
    ]);
    setTheme(themeData);
    setAllPalettes(palettesData);
    setThemes(themesData);
    setLoading(false);
  };

  // Apply theme to admin page (preview)
  useEffect(() => {
    if (theme) {
      const cssVars = generateCSSVariables(theme);
      injectCSSVariables(cssVars);
    }
  }, [theme]);

  // Handle palette changes
  const handlePaletteChange = (updatedPalette: Palette) => {
    if (!theme) return;
    setTheme({
      ...theme,
      palette: updatedPalette,
    });
  };

  // Handle accent config changes
  const handleAccentConfigsChange = (configs: any[]) => {
    if (!theme) return;
    setTheme({
      ...theme,
      accent_configs: configs,
    });
  };

  // Handle semantic token change
  const handleSemanticTokenChange = (
    tokenName: keyof Omit<SemanticTokens, 'id' | 'theme_id' | 'created_at' | 'updated_at'>,
    value: ColorValue
  ) => {
    if (!theme) return;
    setTheme({
      ...theme,
      semantic_tokens: {
        ...theme.semantic_tokens,
        [tokenName]: value,
      },
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!theme) return;
    
    setSaving(true);
    try {
      // Update palette
      await updatePalette(theme.palette.id, {
        name: theme.palette.name,
        primary1: theme.palette.primary1,
        primary2: theme.palette.primary2,
        primary3: theme.palette.primary3,
        primary4: theme.palette.primary4,
        primary5: theme.palette.primary5,
      });

      // Update accent configs
      const accentUpdates = theme.accent_configs.map(c => ({
        primary_number: c.primary_number,
        accent_number: c.accent_number,
        hue_shift: c.hue_shift,
        saturation_shift: c.saturation_shift,
        lightness_shift: c.lightness_shift,
      }));
      await updateAccentConfigs(theme.palette.id, accentUpdates);

      // Update semantic tokens
      const semanticFields = [
        'link', 'link_hover', 'focus_ring',
        'page_bg', 'content_bg', 'card_bg',
        'heading_text', 'body_text', 'muted_text',
        'border', 'border_light',
        'button_primary_bg', 'button_primary_text',
        'button_secondary_bg', 'button_secondary_text',
      ] as const;

      for (const field of semanticFields) {
        const value = theme.semantic_tokens[field];
        if (value && typeof value === 'object' && 'kind' in value) {
          await updateSemanticToken(theme.id, field, value as ColorValue);
        }
      }

      await showSuccess('Theme gespeichert', 'Theme erfolgreich gespeichert! Klicken Sie auf "Anwenden", um es auf der Webseite zu aktivieren.');
    } catch (error) {
      console.error('Failed to save theme:', error);
      await showError('Fehler', 'Fehler beim Speichern des Themes.');
    } finally {
      setSaving(false);
    }
  };

  // Apply theme to website (activate it)
  const handleApply = async () => {
    if (!theme) return;

    await confirm(
      'Theme anwenden',
      'Möchten Sie dieses Theme wirklich auf der Webseite anwenden?\n\nDas Theme wird für alle Besucher sichtbar sein.',
      async () => {
        try {
          await setActiveTheme(theme.id);
          await showSuccess('Theme angewendet', 'Theme wurde erfolgreich auf der Webseite angewendet!');
          await loadData(); // Reload to update active status
        } catch (error) {
          console.error('Failed to apply theme:', error);
          await showError('Fehler', 'Fehler beim Anwenden des Themes.');
        }
      }
    );
  };

  // Save as new preset
  const handleSaveAsPreset = async () => {
    if (!theme) return;

    const name = prompt('Name für die Preset-Palette:');
    if (!name) return;

    const newPalette = await createPalette({
      name,
      description: 'Benutzerdefiniert',
      primary1: theme.palette.primary1,
      primary2: theme.palette.primary2,
      primary3: theme.palette.primary3,
      primary4: theme.palette.primary4,
      primary5: theme.palette.primary5,
      is_preset: false,
    });

    if (newPalette) {
      await showSuccess('Palette gespeichert', 'Palette gespeichert!');
      await loadData();
    } else {
      await showError('Fehler', 'Fehler beim Speichern der Palette.');
    }
  };

  // Export as JSON
  const handleExportJSON = () => {
    if (!theme) return;

    const exportData = {
      name: theme.name,
      palette: {
        name: theme.palette.name,
        colors: [
          theme.palette.primary1,
          theme.palette.primary2,
          theme.palette.primary3,
          theme.palette.primary4,
          theme.palette.primary5,
        ],
      },
      accent_configs: theme.accent_configs,
      semantic_tokens: theme.semantic_tokens,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Randomize palette using color harmony
  const handleRandomizePalette = () => {
    if (!theme) return;

    const newColors = generatePalette(selectedHarmony);
    
    setTheme({
      ...theme,
      palette: {
        ...theme.palette,
        primary1: newColors[0],
        primary2: newColors[1],
        primary3: newColors[2],
        primary4: newColors[3],
        primary5: newColors[4],
      },
    });
  };

  // Convert palettes to preset format for PaletteEditor
  const presets: PalettePreset[] = allPalettes
    .filter(p => p.is_preset)
    .map(p => ({
      id: p.id,
      name: p.name,
      colors: [p.primary1, p.primary2, p.primary3, p.primary4, p.primary5],
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--admin-accent)' }}></div>
          <p className="mt-4" style={{ color: 'var(--admin-text-secondary)' }}>Theme wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-semibold" style={{ color: 'var(--admin-danger)' }}>Kein aktives Theme gefunden</p>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4"
            style={{ color: 'var(--admin-accent)' }}
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Dialog />
      <AdminHeader
        title="Theme Editor"
        subtitle={`Aktives Theme: ${theme.name}`}
        icon={PaletteIcon}
        sticky
      />

      {/* Actions Header - Visible on all tabs */}
      <div className="sticky top-[73px] z-10" style={{ backgroundColor: 'var(--admin-bg-surface)', borderBottom: '1px solid var(--admin-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Farbharmonie:</span>
              <select
                value={selectedHarmony}
                onChange={(e) => setSelectedHarmony(e.target.value as HarmonyType)}
                className="px-3 py-2 text-sm rounded-lg"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              >
                {HARMONY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRandomizePalette}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition shadow-sm"
                title="Oder drücke [Leertaste]"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <div className="h-6 w-px mx-1" style={{ backgroundColor: 'var(--admin-border)' }}></div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition"
                style={{ color: 'var(--admin-text)', backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}
              >
                Presets {showPresets ? 'ausblenden' : 'anzeigen'}
              </button>
              <button
                onClick={handleSaveAsPreset}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition"
                style={{ color: 'var(--admin-text)', backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}
              >
                Als Preset speichern
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition"
                style={{ color: 'var(--admin-text)', backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}
              >
                <Download className="w-4 h-4" />
                JSON Export
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition disabled:opacity-50"
                style={{ backgroundColor: 'var(--admin-text-secondary)' }}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Speichert...' : 'Speichern'}
              </button>
              <button
                onClick={handleApply}
                className="flex items-center gap-2 px-6 py-2 text-sm text-white rounded-lg transition"
                style={{ backgroundColor: 'var(--admin-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Anwenden
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: 'var(--admin-bg-surface)', borderBottom: '1px solid var(--admin-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('palette')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'palette'
                  ? 'text-[var(--admin-accent)]'
                  : 'border-transparent'
              }`}
              style={activeTab === 'palette' ? { borderColor: 'var(--admin-accent)' } : { color: 'var(--admin-text-muted)' }}
            >
              Farbpalette
            </button>
            <button
              onClick={() => setActiveTab('semantic')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'semantic'
                  ? 'text-[var(--admin-accent)]'
                  : 'border-transparent'
              }`}
              style={activeTab === 'semantic' ? { borderColor: 'var(--admin-accent)' } : { color: 'var(--admin-text-muted)' }}
            >
              Semantische Farben
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'text-[var(--admin-accent)]'
                  : 'border-transparent'
              }`}
              style={activeTab === 'preview' ? { borderColor: 'var(--admin-accent)' } : { color: 'var(--admin-text-muted)' }}
            >
              Vorschau
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Palette Tab */}
        {activeTab === 'palette' && (
          <PaletteEditor
            palette={theme.palette}
            accentConfigs={theme.accent_configs}
            onPaletteChange={handlePaletteChange}
            onAccentConfigsChange={handleAccentConfigsChange}
            presets={presets}
            showPresets={showPresets}
          />
        )}

        {/* Semantic Tab */}
        {activeTab === 'semantic' && (
          <div className="flex gap-6 h-[calc(100vh-280px)]">
            {/* Left: Semantic Tokens Table */}
            <div className="w-1/2 rounded-lg overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
              <div className="p-4" style={{ borderBottom: '1px solid var(--admin-border)' }}>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--admin-text-heading)' }}>Semantische Farben</h3>
                <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Wählen Sie einen Token zum Bearbeiten</p>
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {/* Hintergründe */}
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Hintergründe
                      </td>
                    </tr>
                    {[
                      { key: 'page_bg', label: 'Seiten-Hintergrund' },
                      { key: 'card_bg', label: 'Karten / Container' },
                    ].map(({ key, label }) => {
                      const value = theme.semantic_tokens[key as keyof typeof theme.semantic_tokens] as ColorValue;
                      const displayColor = resolveColor(value, theme) || '#999999';
                      const formattedRef = value?.kind === 'tokenRef' 
                        ? value.ref.replace('palette.', '').replace('.accents', '').replace('.', '/') 
                        : value?.hex || 'N/A';
                      return (
                        <tr
                          key={key}
                          onClick={() => setSelectedSemanticToken(key)}
                          className={`cursor-pointer hover:bg-rose-50 transition-colors ${
                            selectedSemanticToken === key ? 'bg-rose-100' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">{label}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-gray-600 truncate max-w-[120px]" title={value?.kind === 'tokenRef' ? value.ref : ''}>
                                {formattedRef}
                              </span>
                              <div
                                className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                                style={{ backgroundColor: displayColor }}
                              />
                            </div>
                          </td>
                           <td className="px-4 py-3"></td>
                        </tr>
                      );
                    })}
                    


                    {/* Text */}
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Text
                      </td>
                    </tr>
                    {[
                      { key: 'heading_text', inverseKey: 'heading_text_inverse', label: 'Überschriften' },
                      { key: 'body_text', inverseKey: 'body_text_inverse', label: 'Fließtext' },
                      { key: 'muted_text', inverseKey: 'muted_text_inverse', label: 'Sekundärtext' },
                    ].map(({ key, inverseKey, label }) => {
                       // Light Token
                      const value = theme.semantic_tokens[key as keyof typeof theme.semantic_tokens] as ColorValue;
                      const displayColor = resolveColor(value, theme) || '#999999';
                      const formattedRef = value?.kind === 'tokenRef' 
                        ? value.ref.replace('palette.', '').replace('.accents', '').replace('.', '/') 
                        : value?.hex || 'N/A';
                        
                      // Inverse Token
                      const invValue = (theme.semantic_tokens as any)[inverseKey] as ColorValue | undefined;
                      const invDisplayColor = invValue ? (resolveColor(invValue, theme) || '#FFFFFF') : '#FFFFFF';
                      const invFormattedRef = invValue?.kind === 'tokenRef' 
                          ? invValue.ref.replace('palette.', '').replace('.accents', '').replace('.', '/')
                          : invValue?.hex || '-';

                      return (
                        <tr key={key} className="group">
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{label}</td>
                          
                          {/* Light Preview - Clickable */}
                          <td 
                            className={`px-4 py-3 text-right cursor-pointer transition-colors ${
                                selectedSemanticToken === key ? 'bg-rose-100 ring-inset ring-2 ring-rose-300' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedSemanticToken(key)}
                          >
                             <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-gray-400 group-hover:text-gray-600 truncate max-w-[80px]" title={value?.kind === 'tokenRef' ? value.ref : ''}>
                                {formattedRef}
                              </span>
                              <div className="w-10 h-10 rounded bg-white flex items-center justify-center border border-gray-300 shadow-sm">
                                  <span style={{ color: displayColor }} className="text-sm font-bold">Aa</span>
                              </div>
                            </div>
                          </td>
                          
                           {/* Dark Preview - Clickable */}
                           <td 
                             className={`px-4 py-3 text-right cursor-pointer transition-colors ${
                                 selectedSemanticToken === inverseKey ? 'bg-rose-100 ring-inset ring-2 ring-rose-300' : 'hover:bg-gray-50'
                             }`}
                             onClick={() => setSelectedSemanticToken(inverseKey)}
                           >
                               <div className="flex items-center justify-end gap-2">
                                  <span className="text-xs text-gray-400 group-hover:text-gray-600 truncate max-w-[80px]" title={invValue?.kind === 'tokenRef' ? invValue.ref : ''}>
                                    {invFormattedRef}
                                  </span>
                                  <div className="w-10 h-10 rounded bg-gray-900 flex items-center justify-center border border-gray-700">
                                      <span style={{ color: invDisplayColor }} className="text-sm font-bold">Aa</span>
                                  </div>
                               </div>
                           </td>
                        </tr>
                      );
                    })}


                    

                    {/* Elemente */}
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Elemente
                      </td>
                    </tr>
                    {[
                      { key: 'link', inverseKey: 'link_inverse', label: 'Links' },
                      { key: 'button_primary_bg', inverseKey: null, label: 'Buttons (Primär)' },
                      { key: 'border', inverseKey: null, label: 'Rahmen / Linien' },
                    ].map(({ key, inverseKey, label }) => {
                       // Light Token
                      const value = theme.semantic_tokens[key as keyof typeof theme.semantic_tokens] as ColorValue;
                      const displayColor = resolveColor(value, theme) || '#999999';
                      const formattedRef = value?.kind === 'tokenRef' 
                        ? value.ref.replace('palette.', '').replace('.accents', '').replace('.', '/') 
                        : value?.hex || 'N/A';
                      
                      // Inverse Token (only for link)
                      const invValue = inverseKey ? (theme.semantic_tokens as any)[inverseKey as string] as ColorValue : undefined;
                      
                      return (
                        <tr
                          key={key}
                          className="group"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{label}</td>
                          
                          {/* Light / Main */}
                          <td 
                             className={`px-4 py-3 text-right cursor-pointer transition-colors ${
                                 selectedSemanticToken === key ? 'bg-rose-100 ring- inset ring-2 ring-rose-300' : 'hover:bg-gray-50'
                             }`}
                             onClick={() => setSelectedSemanticToken(key)}
                          >
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-gray-400 group-hover:text-gray-600 truncate max-w-[80px]" title={value?.kind === 'tokenRef' ? value.ref : ''}>
                                {formattedRef}
                              </span>
                              <div
                                className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                                style={{ backgroundColor: displayColor }}
                              />
                            </div>
                          </td>
                           
                           {/* Dark / Inverse (Optional) */}
                           <td 
                             className={`px-4 py-3 text-right ${invValue ? 'cursor-pointer hover:bg-gray-50' : ''} ${selectedSemanticToken === inverseKey ? 'bg-rose-100 ring-2 ring-rose-300' : ''}`}
                             onClick={() => invValue && inverseKey && setSelectedSemanticToken(inverseKey)}
                           >
                               {invValue && (
                                   <div className="flex items-center justify-end gap-2">
                                       <div className="w-10 h-10 rounded bg-gray-900 flex items-center justify-center border border-gray-700">
                                            {/* For links, show simple underline or text */}
                                            <span style={{ color: resolveColor(invValue, theme) || '#fff', textDecoration: 'underline' }} className="text-sm font-bold">Aa</span>
                                       </div>
                                   </div>
                               )}
                           </td>
                        </tr>
                      );
                    })}


                     {/* Dunkler Hintergrund */}
                     {/* Removed separate section, merged into Text rows */}


                  </tbody>
                </table>

              </div>
            </div>

            {/* Right: Color Picker */}
            <div className="w-1/2 rounded-lg p-6 overflow-y-auto" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
              {selectedSemanticToken ? (
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text-heading)' }}>
                    {selectedSemanticToken.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <UnifiedColorPicker
                    label=""
                    value={(theme.semantic_tokens as any)[selectedSemanticToken] || { kind: 'custom', hex: '#000000' }}
                    onChange={(v) => handleSemanticTokenChange(selectedSemanticToken as any, v)}
                    theme={theme}
                    showTextContrasts={
                      // Show text contrast recommendations for background colors
                      selectedSemanticToken.includes('_bg') || 
                      selectedSemanticToken === 'button_primary_bg' ||
                      selectedSemanticToken === 'button_secondary_bg'
                    }
                  />
                  
                  {/* Reset/Auto Button for Text Tokens */}
                  {(selectedSemanticToken.includes('text') || selectedSemanticToken.includes('inverse')) && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Automatisierung</h5>
                          <button
                            onClick={() => {
                                // Determine context background
                                let bgHex = '#FFFFFF'; // Default to white page
                                if (selectedSemanticToken.includes('inverse')) {
                                    // Inverse usually on dark brand color or dark grey
                                    // Use Primary 1 Base as reference if available, else black
                                    const p1 = resolveColor({ kind: 'tokenRef', ref: 'palette.primary1.base'}, theme);
                                    bgHex = p1 || '#000000';
                                } else {
                                    // Normal text is usually on page_bg
                                    const pageBg = theme.semantic_tokens.page_bg;
                                    const resolvedPageBg = resolveColor(pageBg, theme);
                                    bgHex = resolvedPageBg || '#FFFFFF';
                                }
                                
                                const textColors = getReadableTextColors(bgHex);
                                let finalColor = textColors.body; 

                                if (selectedSemanticToken.includes('heading')) {
                                    finalColor = textColors.heading;
                                } else if (selectedSemanticToken.includes('muted')) {
                                    finalColor = textColors.muted;
                                }
                                
                                handleSemanticTokenChange(selectedSemanticToken as any, { kind: 'custom', hex: finalColor });
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors w-full justify-center"
                          >
                            <Wand2 className="w-4 h-4 text-purple-600" />
                            <span>Automatisch berechnen (Kontrast)</span>
                          </button>
                          <p className="text-xs text-center text-gray-500 mt-2">
                             {selectedSemanticToken.includes('inverse') 
                                ? 'Setzt optimierte Textfarbe (Heading/Body/Muted) basierend auf Primärfarbe.' 
                                : 'Setzt optimierte Textfarbe (Heading/Body/Muted) basierend auf Seitenhintergrund.'}
                          </p>
                      </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full" style={{ color: 'var(--admin-text-muted)' }}>
                  Wählen Sie einen Token aus der Liste
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && <ThemePreview theme={theme} />}
      </main>
    </div>
  );
}
