import React, { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { useActiveTheme } from '../../hooks/useActiveTheme';
import { resolveColor } from '../../utils/token-resolver';

interface BackgroundColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export const BackgroundColorPicker: React.FC<BackgroundColorPickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value || '#FFFFFF');
  const { theme } = useActiveTheme();

  // Predefined quick colors
  const quickColors = [
    { name: 'Weiß', color: '#FFFFFF' },
    { name: 'Hellgrau', color: '#F3F4F6' },
    { name: 'Grau', color: '#E5E7EB' },
    { name: 'Dunkelgrau', color: '#374151' },
    { name: 'Schwarz', color: '#111827' },
  ];

  // Get theme palette colors
  const getPaletteColors = () => {
    if (!theme) return [];
    
    const colors = [];
    for (let i = 1; i <= 5; i++) {
      const primary = `primary${i}` as keyof typeof theme.palette;
      const baseColor = theme.palette[primary];
      
      if (baseColor) {
        colors.push({
          name: `Primär ${i}`,
          color: baseColor,
        });
        
        // Add accent variants
        const accent1 = resolveColor(
          { kind: 'tokenRef', ref: `palette.primary${i}.accents.accent1` },
          theme
        );
        const accent2 = resolveColor(
          { kind: 'tokenRef', ref: `palette.primary${i}.accents.accent2` },
          theme
        );
        
        if (accent1) {
          colors.push({ name: `P${i} Hell`, color: accent1 });
        }
        if (accent2) {
          colors.push({ name: `P${i} Dunkel`, color: accent2 });
        }
      }
    }
    return colors;
  };

  const paletteColors = getPaletteColors();

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-rose-400 transition-colors shadow-sm"
        title="Hintergrundfarbe ändern"
      >
        <div
          className="w-6 h-6 rounded border-2 border-gray-400"
          style={{ backgroundColor: value || '#FFFFFF' }}
        />
        <Palette className="w-4 h-4 text-gray-600" />
      </button>

      {/* Color Picker Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Picker Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Hintergrundfarbe</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Colors */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Schnellauswahl
              </p>
              <div className="grid grid-cols-5 gap-2">
                {quickColors.map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    onClick={() => handleColorSelect(item.color)}
                    className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                      value === item.color
                        ? 'border-rose-500 ring-2 ring-rose-200'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={item.name}
                  />
                ))}
              </div>
            </div>

            {/* Theme Palette Colors */}
            {paletteColors.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Theme-Farben
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {paletteColors.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleColorSelect(item.color)}
                      className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                        value === item.color
                          ? 'border-rose-500 ring-2 ring-rose-200'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: item.color }}
                      title={item.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Color Picker */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Eigene Farbe
              </p>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  placeholder="#FFFFFF"
                />
                <button
                  type="button"
                  onClick={() => handleColorSelect(customColor)}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
                >
                  OK
                </button>
              </div>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={() => handleColorSelect('')}
              className="w-full mt-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Transparent (Standard)
            </button>
          </div>
        </>
      )}
    </div>
  );
};
