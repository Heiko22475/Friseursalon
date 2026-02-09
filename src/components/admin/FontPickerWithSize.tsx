// =====================================================
// FONT PICKER WITH SIZE
// Extended font picker with viewport-specific font sizes
// =====================================================

import React, { useState, useMemo } from 'react';
import { ChevronDown, Type } from 'lucide-react';
import { ALL_FONTS } from '../../data/fonts';
import { FontPicker } from './FontPicker';

// ===== TYPES =====

export interface FontSizeConfig {
  desktop?: number;
  tablet?: number;
  mobile?: number;
}

interface FontPickerWithSizeProps {
  label: string;
  fontValue: string;
  onFontChange: (fontId: string) => void;
  sizeValue?: FontSizeConfig;
  onSizeChange?: (sizes: FontSizeConfig) => void;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

// ===== VIEWPORT SELECTOR =====

type Viewport = 'desktop' | 'tablet' | 'mobile';

const VIEWPORTS: { value: Viewport; label: string; icon: string }[] = [
  { value: 'desktop', label: 'Desktop', icon: '🖥️' },
  { value: 'tablet', label: 'Tablet', icon: '📱' },
  { value: 'mobile', label: 'Mobil', icon: '📱' },
];

// ===== COMPONENT =====

export const FontPickerWithSize: React.FC<FontPickerWithSizeProps> = ({
  label,
  fontValue,
  onFontChange,
  sizeValue = {},
  onSizeChange,
  defaultSize = 16,
  minSize = 8,
  maxSize = 72,
  className = '',
}) => {
  const [activeViewport, setActiveViewport] = useState<Viewport>('desktop');
  const [showSizeControls, setShowSizeControls] = useState(false);

  const selectedFont = useMemo(
    () => ALL_FONTS.find((f) => f.id === fontValue),
    [fontValue]
  );

  const currentSize = sizeValue[activeViewport] || defaultSize;

  const handleSizeChange = (viewport: Viewport, size: number) => {
    if (onSizeChange) {
      onSizeChange({
        ...sizeValue,
        [viewport]: size,
      });
    }
  };

  const handleResetSize = (viewport: Viewport) => {
    if (onSizeChange) {
      const newSizes = { ...sizeValue };
      delete newSizes[viewport];
      onSizeChange(newSizes);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <label className="block text-xs mb-1" style={{ color: 'var(--admin-text-muted)' }}>{label}</label>

      {/* Font Selection */}
      <FontPicker
        label=""
        value={fontValue}
        onChange={onFontChange}
      />

      {/* Size Controls Toggle */}
      {onSizeChange && (
        <button
          type="button"
          onClick={() => setShowSizeControls(!showSizeControls)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition"
          style={{ backgroundColor: 'var(--admin-bg-surface)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--admin-bg-surface)')}
        >
          <span className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Schriftgrößen anpassen
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showSizeControls ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {/* Size Controls */}
      {showSizeControls && onSizeChange && (
        <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg-surface)' }}>
          {/* Viewport Tabs */}
          <div className="flex gap-2">
            {VIEWPORTS.map((vp) => (
              <button
                key={vp.value}
                type="button"
                onClick={() => setActiveViewport(vp.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition"
                style={activeViewport === vp.value
                  ? { backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }
                  : { backgroundColor: 'var(--admin-bg-card)', color: 'var(--admin-text-secondary)' }
                }
              >
                <span className="mr-1">{vp.icon}</span>
                {vp.label}
              </button>
            ))}
          </div>

          {/* Size Input for Active Viewport */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                Schriftgröße für {VIEWPORTS.find((v) => v.value === activeViewport)?.label}
              </label>
              {sizeValue[activeViewport] && (
                <button
                  type="button"
                  onClick={() => handleResetSize(activeViewport)}
                  className="text-xs text-rose-500 hover:text-rose-600"
                >
                  Zurücksetzen
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={minSize}
                max={maxSize}
                value={currentSize}
                onChange={(e) =>
                  handleSizeChange(activeViewport, parseInt(e.target.value))
                }
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{ backgroundColor: 'var(--admin-bg-input)', accentColor: 'var(--admin-accent)' } as React.CSSProperties}
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={minSize}
                  max={maxSize}
                  value={currentSize}
                  onChange={(e) =>
                    handleSizeChange(activeViewport, parseInt(e.target.value) || defaultSize)
                  }
                  className="w-16 px-2 py-1 text-sm border rounded text-center"
                  style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)' }}
                />
                <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>px</span>
              </div>
            </div>

            {/* Preview */}
            <div
              className="p-3 rounded border text-center"
              style={{
                backgroundColor: 'var(--admin-bg-card)',
                borderColor: 'var(--admin-border)',
                fontFamily: selectedFont
                  ? `'${selectedFont.name}', ${selectedFont.fallback}`
                  : 'inherit',
                fontSize: `${currentSize}px`,
              }}
            >
              Beispieltext
            </div>
          </div>

          {/* Size Summary */}
          <div className="pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--admin-text-muted)' }}>Konfigurierte Größen:</p>
            <div className="grid grid-cols-3 gap-2">
              {VIEWPORTS.map((vp) => {
                const size = sizeValue[vp.value];
                return (
                  <div
                    key={vp.value}
                    className="px-2 py-1 rounded text-xs text-center"
                    style={size
                      ? { backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent)' }
                      : { backgroundColor: 'var(--admin-bg-surface)', color: 'var(--admin-text-muted)' }
                    }
                  >
                    {vp.icon} {size ? `${size}px` : `${defaultSize}px (Standard)`}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontPickerWithSize;
