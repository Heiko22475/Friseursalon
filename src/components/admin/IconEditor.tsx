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
    <div className="space-y-6 p-6 rounded-lg border" style={{ backgroundColor: 'var(--admin-bg-surface)', borderColor: 'var(--admin-border)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--admin-text-heading)' }}>Icon Konfiguration</h3>
        
        {/* Preview */}
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Vorschau:</span>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border)' }}>
            {config.icon_enabled ? (
              <div style={getBackgroundStyle()} className="inline-flex items-center justify-center">
                <IconComponent size={config.icon_size} color={config.icon_color} />
              </div>
            ) : (
              <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>Kein Icon</span>
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
          className="w-4 h-4 rounded" style={{ accentColor: 'var(--admin-accent)' }}
        />
        <label htmlFor="icon-enabled" className="text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>
          Icon anzeigen
        </label>
      </div>

      {/* Icon Settings */}
      <div className={`space-y-4 ${!config.icon_enabled ? 'opacity-50' : ''}`}>
        {/* Icon Selection */}
        {showIconPicker && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>Icon auswählen</label>
            <IconPicker
              value={config.icon}
              onChange={(icon) => updateConfig({ icon })}
            />
          </div>
        )}

        {/* Icon Color */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>Icon Farbe</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={config.icon_color}
              onChange={(e) => updateConfig({ icon_color: e.target.value })}
              disabled={!config.icon_enabled}
              className="w-16 h-10 rounded border cursor-pointer disabled:opacity-50" style={{ borderColor: 'var(--admin-border-strong)' }}
            />
            <input
              type="text"
              value={config.icon_color}
              onChange={(e) => updateConfig({ icon_color: e.target.value })}
              disabled={!config.icon_enabled}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 disabled:cursor-not-allowed" style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)' }}
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Icon Size */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>Icon Größe</label>
          <div className="grid grid-cols-4 gap-2">
            {ICON_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateConfig({ icon_size: size })}
                disabled={!config.icon_enabled}
                className="flex flex-col items-center justify-center p-4 border-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={config.icon_size === size
                  ? { borderColor: 'var(--admin-accent)', backgroundColor: 'var(--admin-accent-bg)' }
                  : { borderColor: 'var(--admin-border-strong)' }
                }
              >
                <IconComponent size={size} color={config.icon_color} />
                <span className="text-xs mt-2" style={{ color: 'var(--admin-text-secondary)' }}>{size}px</span>
              </button>
            ))}
          </div>
        </div>

        {/* Background Toggle */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="icon-bg-enabled"
              checked={config.icon_bg_enabled}
              onChange={(e) => updateConfig({ icon_bg_enabled: e.target.checked })}
              disabled={!config.icon_enabled}
              className="w-4 h-4 rounded disabled:opacity-50" style={{ accentColor: 'var(--admin-accent)' }}
            />
            <label htmlFor="icon-bg-enabled" className="text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>
              Hintergrund anzeigen
            </label>
          </div>

          {/* Background Settings */}
          <div className={`space-y-4 ${!config.icon_bg_enabled || !config.icon_enabled ? 'opacity-50' : ''}`}>
            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>Hintergrund Farbe</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.icon_bg_color}
                  onChange={(e) => updateConfig({ icon_bg_color: e.target.value })}
                  disabled={!config.icon_enabled || !config.icon_bg_enabled}
                  className="w-16 h-10 rounded border cursor-pointer disabled:opacity-50" style={{ borderColor: 'var(--admin-border-strong)' }}
                />
                <input
                  type="text"
                  value={config.icon_bg_color}
                  onChange={(e) => updateConfig({ icon_bg_color: e.target.value })}
                  disabled={!config.icon_enabled || !config.icon_bg_enabled}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 disabled:cursor-not-allowed" style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)' }}
                  placeholder="#1e293b"
                />
              </div>
            </div>

            {/* Background Shape */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>Hintergrund Form</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateConfig({ icon_bg_shape: 'rounded' })}
                  disabled={!config.icon_enabled || !config.icon_bg_enabled}
                  className="flex flex-col items-center justify-center p-4 border-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={config.icon_bg_shape === 'rounded'
                    ? { borderColor: 'var(--admin-accent)', backgroundColor: 'var(--admin-accent-bg)' }
                    : { borderColor: 'var(--admin-border-strong)' }
                  }
                >
                  <div
                    style={{ backgroundColor: config.icon_bg_color, borderRadius: '8px', padding: '12px' }}
                    className="flex items-center justify-center mb-2"
                  >
                    <IconComponent size={20} color={config.icon_color} />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>Abgerundet</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateConfig({ icon_bg_shape: 'circle' })}
                  disabled={!config.icon_enabled || !config.icon_bg_enabled}
                  className="flex flex-col items-center justify-center p-4 border-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={config.icon_bg_shape === 'circle'
                    ? { borderColor: 'var(--admin-accent)', backgroundColor: 'var(--admin-accent-bg)' }
                    : { borderColor: 'var(--admin-border-strong)' }
                  }
                >
                  <div
                    style={{ backgroundColor: config.icon_bg_color, borderRadius: '50%', padding: '12px' }}
                    className="flex items-center justify-center mb-2"
                  >
                    <IconComponent size={20} color={config.icon_color} />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>Kreisrund</span>
                </button>
              </div>
            </div>

            {/* Background Padding */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>Hintergrund Padding</label>
              <div className="grid grid-cols-4 gap-2">
                {BG_PADDINGS.map((padding) => (
                  <button
                    key={padding}
                    type="button"
                    onClick={() => updateConfig({ icon_bg_padding: padding })}
                    disabled={!config.icon_enabled || !config.icon_bg_enabled}
                    className="flex flex-col items-center justify-center p-3 border-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={config.icon_bg_padding === padding
                      ? { borderColor: 'var(--admin-accent)', backgroundColor: 'var(--admin-accent-bg)' }
                      : { borderColor: 'var(--admin-border-strong)' }
                    }
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
                    <span className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>{padding}px</span>
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
