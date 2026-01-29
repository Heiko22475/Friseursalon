// =====================================================
// THEME MANAGER
// Admin page for managing themes and color palettes
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette as PaletteIcon, Save, Plus, Trash2, Download, Upload, Shuffle } from 'lucide-react';
import { ThemeTokens, Palette, PalettePreset } from '../types/theme';
import { generatePalette, HARMONY_TYPES, HarmonyType } from '../utils/color-generator';
import {
  getActiveTheme,
  getAllPalettes,
  updatePalette,
  createPalette,
  updateAccentConfigs,
  updateSemanticToken,
  setActiveTheme,
  createTheme,
  getAllThemes,
  deleteTheme,
} from '../services/theme-service';
import { generateCSSVariables, injectCSSVariables, resolveColor } from '../utils/token-resolver';
import PaletteEditor from './admin/theme/PaletteEditor';
import ThemePreview from './admin/theme/ThemePreview';
import UnifiedColorPicker from './admin/theme/UnifiedColorPicker';
import { SemanticTokens, ColorValue } from '../types/theme';

type Tab = 'palette' | 'semantic' | 'preview';

export default function ThemeManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<ThemeTokens | null>(null);
  const [allPalettes, setAllPalettes] = useState<Palette[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('palette');
  const [themes, setThemes] = useState<any[]>([]);
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

      alert('Theme erfolgreich gespeichert! Klicken Sie auf "Anwenden", um es auf der Webseite zu aktivieren.');
    } catch (error) {
      console.error('Failed to save theme:', error);
      alert('Fehler beim Speichern des Themes.');
    } finally {
      setSaving(false);
    }
  };

  // Apply theme to website (activate it)
  const handleApply = async () => {
    if (!theme) return;

    const confirmed = window.confirm(
      'Möchten Sie dieses Theme wirklich auf der Webseite anwenden?\n\n' +
      'Das Theme wird für alle Besucher sichtbar sein.'
    );

    if (!confirmed) return;

    try {
      await setActiveTheme(theme.id);
      alert('Theme wurde erfolgreich auf der Webseite angewendet!');
      await loadData(); // Reload to update active status
    } catch (error) {
      console.error('Failed to apply theme:', error);
      alert('Fehler beim Anwenden des Themes.');
    }
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
      alert('Palette gespeichert!');
      await loadData();
    } else {
      alert('Fehler beim Speichern der Palette.');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Theme wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Kein aktives Theme gefunden</p>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4 text-rose-500 hover:text-rose-600"
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <PaletteIcon className="w-6 h-6 text-rose-500" />
                  Theme Editor
                </h1>
                <p className="text-sm text-gray-600">
                  Aktives Theme: <span className="font-medium">{theme.name}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Actions Header - Visible on all tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[88px] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Harmony Selector - Available on all tabs */}
              <span className="text-sm text-gray-600">Farbharmonie:</span>
              <select
                value={selectedHarmony}
                onChange={(e) => setSelectedHarmony(e.target.value as HarmonyType)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              <div className="h-6 w-px bg-gray-300 mx-1"></div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Presets {showPresets ? 'ausblenden' : 'anzeigen'}
              </button>
              <button
                onClick={handleSaveAsPreset}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Als Preset speichern
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Download className="w-4 h-4" />
                JSON Export
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Speichert...' : 'Speichern'}
              </button>
              <button
                onClick={handleApply}
                className="flex items-center gap-2 px-6 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition shadow-md"
              >
                Anwenden
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('palette')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'palette'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Farbpalette
            </button>
            <button
              onClick={() => setActiveTab('semantic')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'semantic'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Semantische Farben
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
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
            <div className="w-1/2 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Semantische Farben</h3>
                <p className="text-sm text-gray-600">Wählen Sie einen Token zum Bearbeiten</p>
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {/* Links & Navigation */}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Links & Navigation
                      </td>
                    </tr>
                    {[
                      { key: 'link', label: 'Link' },
                      { key: 'link_hover', label: 'Link Hover' },
                      { key: 'focus_ring', label: 'Focus Ring' },
                    ].map(({ key, label }) => {
                      const value = theme.semantic_tokens[key as keyof typeof theme.semantic_tokens] as ColorValue;
                      const displayColor = resolveColor(value, theme) || '#999999';
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
                              <span className="text-xs text-gray-600">
                                {value?.kind === 'tokenRef' ? value.ref : value?.hex || 'N/A'}
                              </span>
                              <div
                                className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                                style={{ backgroundColor: displayColor }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    
                    {/* Backgrounds */}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Hintergründe
                      </td>
                    </tr>
                    {[
                      { key: 'page_bg', label: 'Page Background' },
                      { key: 'content_bg', label: 'Content Background' },
                      { key: 'card_bg', label: 'Card Background' },
                    ].map(({ key, label }) => {
                      const value = theme.semantic_tokens[key as keyof typeof theme.semantic_tokens] as ColorValue;
                      const displayColor = resolveColor(value, theme) || '#999999';
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
                              <span className="text-xs text-gray-600">
                                {value?.kind === 'tokenRef' ? value.ref : value?.hex || 'N/A'}
                              </span>
                              <div
                                className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                                style={{ backgroundColor: displayColor }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    
                    {/* Text */}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Text
                      </td>
                    </tr>
                    {[
                      { key: 'heading_text', label: 'Heading Text' },
                      { key: 'body_text', label: 'Body Text' },
                      { key: 'muted_text', label: 'Muted Text' },
                    ].map(({ key, label }) => {
                      const value = theme.semantic_tokens[key as keyof typeof theme.semantic_tokens] as ColorValue;
                      const displayColor = resolveColor(value, theme) || '#999999';
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
                              <span className="text-xs text-gray-600">
                                {value?.kind === 'tokenRef' ? value.ref : value?.hex || 'N/A'}
                              </span>
                              <div
                                className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                                style={{ backgroundColor: displayColor }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    
                    {/* Borders */}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Borders
                      </td>
                    </tr>
                    {[
                      { key: 'border', label: 'Border' },
                      { key: 'border_light', label: 'Border Light' },
                    ].map(({ key, label }) => {
                      const value = theme.semantic_tokens[key as keyof typeof theme.semantic_tokens] as ColorValue;
                      const displayColor = resolveColor(value, theme) || '#999999';
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
                              <span className="text-xs text-gray-600">
                                {value?.kind === 'tokenRef' ? value.ref : value?.hex || 'N/A'}
                              </span>
                              <div
                                className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                                style={{ backgroundColor: displayColor }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    
                    {/* Buttons */}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Buttons
                      </td>
                    </tr>
                    {[
                      { key: 'button_primary_bg', label: 'Button Primary Background' },
                      { key: 'button_primary_text', label: 'Button Primary Text' },
                      { key: 'button_secondary_bg', label: 'Button Secondary Background' },
                      { key: 'button_secondary_text', label: 'Button Secondary Text' },
                    ].map(({ key, label }) => {
                      const value = theme.semantic_tokens[key as keyof typeof theme.semantic_tokens] as ColorValue;
                      const displayColor = resolveColor(value, theme) || '#999999';
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
                              <span className="text-xs text-gray-600">
                                {value?.kind === 'tokenRef' ? value.ref : value?.hex || 'N/A'}
                              </span>
                              <div
                                className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                                style={{ backgroundColor: displayColor }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Color Picker */}
            <div className="w-1/2 bg-white rounded-lg border border-gray-200 p-6 overflow-y-auto">
              {selectedSemanticToken ? (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedSemanticToken.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <UnifiedColorPicker
                    label=""
                    value={theme.semantic_tokens[selectedSemanticToken as keyof typeof theme.semantic_tokens] as ColorValue}
                    onChange={(v) => handleSemanticTokenChange(selectedSemanticToken as any, v)}
                    theme={theme}
                    showTextContrasts={
                      // Show text contrast recommendations for background colors
                      selectedSemanticToken.includes('_bg') || 
                      selectedSemanticToken === 'button_primary_bg' ||
                      selectedSemanticToken === 'button_secondary_bg'
                    }
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
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
