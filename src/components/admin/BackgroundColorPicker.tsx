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
  const getPaletteColors = (): Array<{name: string; color: string}> => {
    if (!theme) return [];
    
    const colors: Array<{name: string; color: string}> = [];
    for (let i = 1; i <= 5; i++) {
      const primary = `primary${i}` as keyof typeof theme.palette;
      const baseColor = theme.palette[primary];
      
      if (baseColor && typeof baseColor === 'string') {
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
        
        if (accent1 && typeof accent1 === 'string') {
          colors.push({ name: `P${i} Hell`, color: accent1 });
        }
        if (accent2 && typeof accent2 === 'string') {
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
        className="flex items-center gap-2 px-3 py-2 border-2 rounded-lg transition-colors"
        style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border-strong)', boxShadow: 'var(--admin-shadow)' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--admin-accent)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--admin-border-strong)')}
        title="Hintergrundfarbe ändern"
      >
        <div
          className="w-6 h-6 rounded border-2"
          style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: value || '#FFFFFF' }}
        />
        <Palette className="w-4 h-4" style={{ color: 'var(--admin-text-secondary)' }} />
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
          <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border p-4 z-50" style={{ backgroundColor: 'var(--admin-bg-card)', boxShadow: 'var(--admin-shadow-lg)', borderColor: 'var(--admin-border)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--admin-text-heading)' }}>Hintergrundfarbe</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="transition"
                style={{ color: 'var(--admin-text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Colors */}
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--admin-text-muted)' }}>
                Schnellauswahl
              </p>
              <div className="grid grid-cols-5 gap-2">
                {quickColors.map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    onClick={() => handleColorSelect(item.color)}
                    className="aspect-square rounded-lg border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: item.color,
                      borderColor: value === item.color ? 'var(--admin-accent)' : 'var(--admin-border-strong)',
                      boxShadow: value === item.color ? '0 0 0 2px var(--admin-accent-light)' : undefined
                    }}
                    title={item.name}
                  />
                ))}
              </div>
            </div>

            {/* Theme Palette Colors */}
            {paletteColors.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--admin-text-muted)' }}>
                  Theme-Farben
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {paletteColors.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleColorSelect(item.color)}
                      className="aspect-square rounded-lg border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: item.color,
                        borderColor: value === item.color ? 'var(--admin-accent)' : 'var(--admin-border-strong)',
                        boxShadow: value === item.color ? '0 0 0 2px var(--admin-accent-light)' : undefined
                      }}
                      title={item.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Color Picker */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--admin-text-muted)' }}>
                Eigene Farbe
              </p>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-16 h-10 rounded border cursor-pointer"
                  style={{ borderColor: 'var(--admin-border-strong)' }}
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                  style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)' }}
                  placeholder="#FFFFFF"
                />
                <button
                  type="button"
                  onClick={() => handleColorSelect(customColor)}
                  className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--admin-accent-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--admin-accent)')}
                >
                  OK
                </button>
              </div>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={() => handleColorSelect('')}
              className="w-full mt-3 py-2 text-sm border rounded-lg transition-colors"
              style={{ color: 'var(--admin-text-secondary)', borderColor: 'var(--admin-border-strong)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'; e.currentTarget.style.color = 'var(--admin-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--admin-text-secondary)'; }}
            >
              Transparent (Standard)
            </button>
          </div>
        </>
      )}
    </div>
  );
};
