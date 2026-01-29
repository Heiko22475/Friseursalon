// =====================================================
// PALETTE EDITOR
// 5×3 Grid Editor with Preset Palette Grid
// =====================================================

import { useState, useEffect } from 'react';
import { Palette, AccentConfig, PalettePreset } from '../../../types/theme';
import { generateAccent, autoTextColor, hexToHsl } from '../../../utils/color-utils';

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

      {/* 5×4 Color Grid - Horizontal Layout */}
      <div className="space-y-4">
        {/* Base Colors Row */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Primärfarben</h4>
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((primaryNum) => {
              const primaryKey = `primary${primaryNum}` as keyof Palette;
              const baseColor = palette[primaryKey] as string;
              
              return (
                <div key={primaryNum} className="space-y-2">
                  <ColorCell
                    color={baseColor}
                    label={`Primary ${primaryNum}`}
                    isEditable={true}
                    onChange={(hex) => handlePrimaryChange(primaryNum, hex)}
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={baseColor}
                      onChange={(e) => handlePrimaryChange(primaryNum, e.target.value.toUpperCase())}
                      className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                      title="Farbe wählen"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accent Colors Rows */}
        {[1, 2, 3].map((accentNum) => (
          <div key={accentNum}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Accent {accentNum}</h4>
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((primaryNum) => {
                const accentColor = getAccentColor(primaryNum, accentNum);
                const config = accentConfigs.find(
                  c => c.primary_number === primaryNum && c.accent_number === accentNum
                );
                
                return (
                  <div key={primaryNum} className="space-y-2">
                    <ColorCell
                      color={accentColor}
                      label={`${accentNum}.${primaryNum}`}
                      isEditable={false}
                    />
                    <button
                      onClick={() => setEditingAccents(
                        editingAccents?.primary === primaryNum && editingAccents?.accent === accentNum
                          ? null
                          : { primary: primaryNum, accent: accentNum }
                      )}
                      className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-rose-50 hover:border-rose-500 hover:text-rose-600 transition-colors"
                    >
                      {editingAccents?.primary === primaryNum && editingAccents?.accent === accentNum
                        ? 'Schließen'
                        : 'Anpassen'}
                    </button>
                  </div>
                );
              })}
            </div>
            
            {/* HSL Sliders - Show for any selected accent in this row */}
            {[1, 2, 3, 4, 5].map((primaryNum) => {
              const config = accentConfigs.find(
                c => c.primary_number === primaryNum && c.accent_number === accentNum
              );
              
              if (editingAccents?.primary !== primaryNum || editingAccents?.accent !== accentNum || !config) {
                return null;
              }
              
              return (
                <div key={`sliders-${primaryNum}`} className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Primary {primaryNum} - Accent {accentNum} HSL-Shifts
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Hue */}
                    <div>
                      <label className="text-xs text-gray-600 flex justify-between mb-1">
                        <span>Hue</span>
                        <span>{config.hue_shift}°</span>
                      </label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={config.hue_shift}
                        onChange={(e) => handleAccentConfigChange(
                          primaryNum,
                          accentNum,
                          'hue_shift',
                          parseInt(e.target.value)
                        )}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Saturation */}
                    <div>
                      <label className="text-xs text-gray-600 flex justify-between mb-1">
                        <span>Sat</span>
                        <span>{config.saturation_shift > 0 ? '+' : ''}{config.saturation_shift}%</span>
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={config.saturation_shift}
                        onChange={(e) => handleAccentConfigChange(
                          primaryNum,
                          accentNum,
                          'saturation_shift',
                          parseInt(e.target.value)
                        )}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Lightness */}
                    <div>
                      <label className="text-xs text-gray-600 flex justify-between mb-1">
                        <span>Light</span>
                        <span>{config.lightness_shift > 0 ? '+' : ''}{config.lightness_shift}%</span>
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={config.lightness_shift}
                        onChange={(e) => handleAccentConfigChange(
                          primaryNum,
                          accentNum,
                          'lightness_shift',
                          parseInt(e.target.value)
                        )}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
