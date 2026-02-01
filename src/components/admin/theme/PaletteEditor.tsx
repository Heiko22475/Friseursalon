// =====================================================
// PALETTE EDITOR
// 5×3 Grid Editor with Preset Palette Grid
// =====================================================

import { useState } from 'react';
import { Palette, AccentConfig, PalettePreset } from '../../../types/theme';
import { generateAccent, autoTextColor } from '../../../utils/color-utils';

interface PaletteEditorProps {
  palette: Palette;
  accentConfigs: AccentConfig[];
  onPaletteChange: (palette: Palette) => void;
  onAccentConfigsChange: (configs: AccentConfig[]) => void;
  presets?: PalettePreset[];
  showPresets: boolean;
}

interface ColorCellProps {
  color: string;
  label: string;
  isEditable: boolean;
  onChange?: (hex: string) => void;
}

function ColorCell({ color, label, isEditable, onChange }: ColorCellProps) {
  const textColor = autoTextColor(color);

  return (
    <div className="relative group">
      <div
        className="h-20 rounded border-2 border-gray-300 shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-105"
        style={{ backgroundColor: color }}
      >
        {isEditable && onChange && (
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        )}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center"
          style={{ color: textColor }}
        >
          <span className="text-xs font-medium">{label}</span>
          <span className="text-[10px] font-mono">{color}</span>
        </div>
      </div>
    </div>
  );
}

export default function PaletteEditor({
  palette,
  accentConfigs,
  onPaletteChange,
  onAccentConfigsChange,
  presets = [],
  showPresets,
}: PaletteEditorProps) {
  const [editingAccents, setEditingAccents] = useState<{ primary: number; accent: number } | null>(null);

  // Generate accents for display
  const getAccentColor = (primaryNum: number, accentNum: number): string => {
    const primaryKey = `primary${primaryNum}` as keyof Palette;
    const baseColor = palette[primaryKey] as string;
    
    const config = accentConfigs.find(
      c => c.primary_number === primaryNum && c.accent_number === accentNum
    );
    
    if (!config) return baseColor;
    
    return generateAccent(baseColor, {
      hue_shift: config.hue_shift,
      saturation_shift: config.saturation_shift,
      lightness_shift: config.lightness_shift,
    });
  };

  // Handle primary color change
  const handlePrimaryChange = (primaryNum: number, hex: string) => {
    const primaryKey = `primary${primaryNum}` as keyof Palette;
    onPaletteChange({
      ...palette,
      [primaryKey]: hex,
    });
  };

  // Handle accent config change
  const handleAccentConfigChange = (
    primaryNum: number,
    accentNum: number,
    field: 'hue_shift' | 'saturation_shift' | 'lightness_shift',
    value: number
  ) => {
    const newConfigs = accentConfigs.map(c => {
      if (c.primary_number === primaryNum && c.accent_number === accentNum) {
        return { ...c, [field]: value };
      }
      return c;
    });
    onAccentConfigsChange(newConfigs);
  };

  // Load preset
  const handlePresetSelect = (preset: PalettePreset) => {
    onPaletteChange({
      ...palette,
      name: preset.name,
      primary1: preset.colors[0],
      primary2: preset.colors[1],
      primary3: preset.colors[2],
      primary4: preset.colors[3],
      primary5: preset.colors[4],
    });
  };

  return (
    <div className="space-y-6">

      {/* Preset Grid */}
      {showPresets && presets.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Preset-Paletten</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className="flex flex-col gap-2 p-3 bg-white border border-gray-300 rounded-lg hover:border-rose-500 hover:shadow-md transition-all text-left"
              >
                <div className="flex gap-1 h-10">
                  {preset.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-700">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Refactored Layout: Table-Like per Primary */}
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Marken-Identität & Autom. Abstufungen</h4>
          
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((primaryNum) => {
              const primaryKey = `primary${primaryNum}` as keyof Palette;
              const baseColor = palette[primaryKey] as string;
              
              // Custom labels for the simplified view
              const labels = ['Marke (Brand)', 'Akzent (Secondary)', 'Neutral (Graustufen)'];
              const colLabel = labels[primaryNum - 1];
              
              const accent1Color = getAccentColor(primaryNum, 1);
              const accent2Color = getAccentColor(primaryNum, 2);
              const accent3Color = getAccentColor(primaryNum, 3);
              
              const isEditing = editingAccents?.primary === primaryNum;

              return (
                <div key={primaryNum} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  {/* Row Header & Main Color */}
                  <div className="flex items-start gap-6">
                    {/* Primary Control (Left) */}
                    <div className="w-48 flex-shrink-0">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">{colLabel}</label>
                      <div className="space-y-2">
                        <ColorCell
                          color={baseColor}
                          label="Basis"
                          isEditable={true}
                          onChange={(hex) => handlePrimaryChange(primaryNum, hex)}
                        />
                         <div className="relative">
                            <input
                              type="color"
                              value={baseColor}
                              onChange={(e) => handlePrimaryChange(primaryNum, e.target.value.toUpperCase())}
                              className="w-full h-10 rounded-md border border-gray-300 cursor-pointer"
                              title="Farbe wählen"
                            />
                        </div>
                      </div>
                    </div>

                    {/* Accents (Right - Table-like) */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Automatische Abstufungen</label>
                         <button
                            onClick={() => setEditingAccents(isEditing ? null : { primary: primaryNum, accent: 1 })}
                            className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                              isEditing 
                                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                         >
                            {isEditing ? 'Schließen' : 'Anpassen'}
                         </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {/* Accent 1 */}
                        <div className="space-y-1">
                           <div className="h-16 rounded border border-gray-200" style={{ backgroundColor: accent1Color }}></div>
                        </div>
                        {/* Accent 2 */}
                        <div className="space-y-1">
                           <div className="h-16 rounded border border-gray-200" style={{ backgroundColor: accent2Color }}></div>
                        </div>
                        {/* Accent 3 */}
                        <div className="space-y-1">
                           <div className="h-16 rounded border border-gray-200" style={{ backgroundColor: accent3Color }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HSL Sliders (Collapsible Area) */}
                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                      {[1, 2, 3].map(accNum => {
                        const config = accentConfigs.find(
                          c => c.primary_number === primaryNum && c.accent_number === accNum
                        );
                        if (!config) return null;

                        return (
                          <div key={accNum} className="space-y-3 bg-gray-50 p-3 rounded-md">
                             <div className="text-xs font-bold text-gray-700">
                                {accNum === 1 && 'Heller Akzent'}
                                {accNum === 2 && 'Dunkler Akzent'}
                                {accNum === 3 && 'Gedämpft'}
                             </div>
                             
                             {/* HSL Controls */}
                             <div className="space-y-2">
                                <div>
                                  <label className="text-[10px] text-gray-500 flex justify-between">
                                    <span>Farbton (Hue)</span>
                                    <span>{config.hue_shift}°</span>
                                  </label>
                                  <input type="range" min="-180" max="180" value={config.hue_shift}
                                    onChange={(e) => handleAccentConfigChange(primaryNum, accNum as any, 'hue_shift', parseInt(e.target.value))}
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 flex justify-between">
                                    <span>Sättigung</span>
                                    <span>{config.saturation_shift}%</span>
                                  </label>
                                  <input type="range" min="-100" max="100" value={config.saturation_shift}
                                    onChange={(e) => handleAccentConfigChange(primaryNum, accNum as any, 'saturation_shift', parseInt(e.target.value))}
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 flex justify-between">
                                    <span>Helligkeit</span>
                                    <span>{config.lightness_shift}%</span>
                                  </label>
                                  <input type="range" min="-100" max="100" value={config.lightness_shift}
                                    onChange={(e) => handleAccentConfigChange(primaryNum, accNum as any, 'lightness_shift', parseInt(e.target.value))}
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                  />
                                </div>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
