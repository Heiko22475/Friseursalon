import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Scissors } from 'lucide-react';
import { IconPicker } from './IconPicker';

export interface IconConfig {
  icon_enabled: boolean;
  icon: string;
  icon_color: string;
  icon_size: number;
  icon_bg_enabled: boolean;
  icon_bg_color: string;
  icon_bg_shape: 'rounded' | 'circle';
  icon_bg_padding: number;
}

interface IconEditorProps {
  config: IconConfig;
  onChange: (config: IconConfig) => void;
  showIconPicker?: boolean; // Optional: hide icon picker for global styling
}

const ICON_SIZES = [15, 18, 24, 30];
const BG_PADDINGS = [5, 10, 15, 20];

export const IconEditor: React.FC<IconEditorProps> = ({ config, onChange, showIconPicker = true }) => {
  const updateConfig = (updates: Partial<IconConfig>) => {
    onChange({ ...config, ...updates });
  };

  const IconComponent = (LucideIcons[config.icon as keyof typeof LucideIcons] || Scissors) as React.FC<{
    size?: number;
    color?: string;
  }>;

  const getBackgroundStyle = () => {
    if (!config.icon_bg_enabled) return {};

    return {
      backgroundColor: config.icon_bg_color,
      padding: `${config.icon_bg_padding}px`,
      borderRadius: config.icon_bg_shape === 'circle' ? '50%' : '8px',
    };
  };

  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Icon Konfiguration</h3>
        
        {/* Preview */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Vorschau:</span>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            {config.icon_enabled ? (
              <div style={getBackgroundStyle()} className="inline-flex items-center justify-center">
                <IconComponent size={config.icon_size} color={config.icon_color} />
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Kein Icon</span>
            )}
          </div>
        </div>
      </div>

      {/* Icon Anzeigen Toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="icon-enabled"
          checked={config.icon_enabled}
          onChange={(e) => updateConfig({ icon_enabled: e.target.checked })}
          className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
        />
        <label htmlFor="icon-enabled" className="text-sm font-medium text-gray-700">
          Icon anzeigen
        </label>
      </div>

      {/* Icon Settings */}
      <div className={`space-y-4 ${!config.icon_enabled ? 'opacity-50' : ''}`}>
        {/* Icon Selection */}
        {showIconPicker && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon auswählen</label>
            <IconPicker
              value={config.icon}
              onChange={(icon) => updateConfig({ icon })}
            />
          </div>
        )}

        {/* Icon Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Icon Farbe</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={config.icon_color}
              onChange={(e) => updateConfig({ icon_color: e.target.value })}
              disabled={!config.icon_enabled}
              className="w-16 h-10 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
            />
            <input
              type="text"
              value={config.icon_color}
              onChange={(e) => updateConfig({ icon_color: e.target.value })}
              disabled={!config.icon_enabled}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Icon Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Icon Größe</label>
          <div className="grid grid-cols-4 gap-2">
            {ICON_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateConfig({ icon_size: size })}
                disabled={!config.icon_enabled}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition ${
                  config.icon_size === size
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-300 hover:border-gray-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <IconComponent size={size} color={config.icon_color} />
                <span className="text-xs mt-2 text-gray-600">{size}px</span>
              </button>
            ))}
          </div>
        </div>

        {/* Background Toggle */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="icon-bg-enabled"
              checked={config.icon_bg_enabled}
              onChange={(e) => updateConfig({ icon_bg_enabled: e.target.checked })}
              disabled={!config.icon_enabled}
              className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500 disabled:opacity-50"
            />
            <label htmlFor="icon-bg-enabled" className="text-sm font-medium text-gray-700">
              Hintergrund anzeigen
            </label>
          </div>

          {/* Background Settings */}
          <div className={`space-y-4 ${!config.icon_bg_enabled || !config.icon_enabled ? 'opacity-50' : ''}`}>
            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hintergrund Farbe</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.icon_bg_color}
                  onChange={(e) => updateConfig({ icon_bg_color: e.target.value })}
                  disabled={!config.icon_enabled || !config.icon_bg_enabled}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={config.icon_bg_color}
                  onChange={(e) => updateConfig({ icon_bg_color: e.target.value })}
                  disabled={!config.icon_enabled || !config.icon_bg_enabled}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="#1e293b"
                />
              </div>
            </div>

            {/* Background Shape */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hintergrund Form</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateConfig({ icon_bg_shape: 'rounded' })}
                  disabled={!config.icon_enabled || !config.icon_bg_enabled}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition ${
                    config.icon_bg_shape === 'rounded'
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div
                    style={{ backgroundColor: config.icon_bg_color, borderRadius: '8px', padding: '12px' }}
                    className="flex items-center justify-center mb-2"
                  >
                    <IconComponent size={20} color={config.icon_color} />
                  </div>
                  <span className="text-xs text-gray-600">Abgerundet</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateConfig({ icon_bg_shape: 'circle' })}
                  disabled={!config.icon_enabled || !config.icon_bg_enabled}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition ${
                    config.icon_bg_shape === 'circle'
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div
                    style={{ backgroundColor: config.icon_bg_color, borderRadius: '50%', padding: '12px' }}
                    className="flex items-center justify-center mb-2"
                  >
                    <IconComponent size={20} color={config.icon_color} />
                  </div>
                  <span className="text-xs text-gray-600">Kreisrund</span>
                </button>
              </div>
            </div>

            {/* Background Padding */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hintergrund Padding</label>
              <div className="grid grid-cols-4 gap-2">
                {BG_PADDINGS.map((padding) => (
                  <button
                    key={padding}
                    type="button"
                    onClick={() => updateConfig({ icon_bg_padding: padding })}
                    disabled={!config.icon_enabled || !config.icon_bg_enabled}
                    className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition ${
                      config.icon_bg_padding === padding
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div
                      style={{
                        backgroundColor: config.icon_bg_color,
                        borderRadius: config.icon_bg_shape === 'circle' ? '50%' : '6px',
                        padding: `${padding}px`,
                      }}
                      className="flex items-center justify-center mb-2"
                    >
                      <IconComponent size={18} color={config.icon_color} />
                    </div>
                    <span className="text-xs text-gray-600">{padding}px</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
