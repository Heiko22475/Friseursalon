// =====================================================
// THEME COLOR PICKER
// Picker für Theme-Farben mit "Keine Farbe" Option
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, X, Ban } from 'lucide-react';
import { useActiveTheme } from '../../hooks/useActiveTheme';
import { resolveColor } from '../../utils/token-resolver';
import { ColorValue } from '../../types/theme';

// ===== EXTENDED COLOR VALUE (with null option) =====

export type ThemeColorValue = ColorValue | null;

interface ThemeColorPickerProps {
  label: string;
  value: ThemeColorValue;
  onChange: (value: ThemeColorValue) => void;
  allowNoColor?: boolean;
  className?: string;
}

export const ThemeColorPicker: React.FC<ThemeColorPickerProps> = ({
  label,
  value,
  onChange,
  allowNoColor = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(
    value?.kind === 'custom' ? value.hex : '#000000'
  );
  const { theme } = useActiveTheme();

  // Get resolved color for display
  const getDisplayColor = (): string | null => {
    if (!value) return null;
    if (value.kind === 'custom') return value.hex;
    if (theme) {
      return resolveColor(value, theme) || null;
    }
    return null;
  };

  const displayColor = getDisplayColor();

  // Get theme palette colors organized by primary
  const getThemeColors = () => {
    if (!theme) return [];

    const colors: Array<{
      name: string;
      color: string;
      ref: string;
      isPrimary: boolean;
    }> = [];

    for (let i = 1; i <= 3; i++) {
      const primary = `primary${i}` as keyof typeof theme.palette;
      const baseColor = theme.palette[primary];

      if (baseColor && typeof baseColor === 'string') {
        // Labels für die 3 Primärfarben
        const labels = ['Marke (Brand)', 'Akzent', 'Neutral'];
        // Use .base suffix for correct token resolution
        colors.push({
          name: labels[i - 1],
          color: baseColor,
          ref: `palette.primary${i}.base`,
          isPrimary: true,
        });

        // Add accent variants (light, dark, muted)
        const accentLabels = ['Hell', 'Dunkel', 'Gedämpft'];
        for (let a = 1; a <= 3; a++) {
          const accentRef = `palette.primary${i}.accents.accent${a}`;
          const accentColor = resolveColor(
            { kind: 'tokenRef', ref: accentRef },
            theme
          );
          if (accentColor && typeof accentColor === 'string') {
            colors.push({
              name: `${labels[i - 1]} ${accentLabels[a - 1]}`,
              color: accentColor,
              ref: accentRef,
              isPrimary: false,
            });
          }
        }
      }
    }
    return colors;
  };

  const themeColors = getThemeColors();

  // Quick neutral colors
  const neutralColors = [
    { name: 'Weiß', hex: '#FFFFFF' },
    { name: 'Hellgrau', hex: '#F3F4F6' },
    { name: 'Grau', hex: '#9CA3AF' },
    { name: 'Dunkelgrau', hex: '#374151' },
    { name: 'Schwarz', hex: '#111827' },
  ];

  const handleThemeColorSelect = (_ref: string, hexColor: string) => {
    // Store as custom hex directly so GenericCard preview works correctly
    // The ref is stored for potential future token resolution
    onChange({ kind: 'custom', hex: hexColor });
    setIsOpen(false);
  };

  const handleCustomColorSelect = (hex: string) => {
    onChange({ kind: 'custom', hex });
    setIsOpen(false);
  };

  const handleNoColor = () => {
    onChange(null);
    setIsOpen(false);
  };

  // Ref for positioning the popup
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  // Calculate popup position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popupWidth = 320;
      const popupHeight = 450;
      
      // Calculate position - prefer below the trigger
      let top = rect.bottom + 8;
      let left = rect.left;
      
      // Check if popup would go off screen right
      if (left + popupWidth > window.innerWidth - 16) {
        left = window.innerWidth - popupWidth - 16;
      }
      
      // Check if popup would go off screen bottom
      if (top + popupHeight > window.innerHeight - 16) {
        // Position above instead
        top = rect.top - popupHeight - 8;
        if (top < 16) top = 16;
      }
      
      setPopupPosition({ top, left });
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-xs mb-1" style={{ color: 'var(--admin-text-muted)' }}>{label}</label>
      
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors"
        style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border)' }}
      >
        {displayColor ? (
          <div
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: displayColor, borderColor: 'var(--admin-border)' }}
          />
        ) : (
          <div className="w-6 h-6 rounded border flex items-center justify-center" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg-input)' }}>
            <Ban className="w-3 h-3" style={{ color: 'var(--admin-text-muted)' }} />
          </div>
        )}
        <span className="flex-1 text-left text-sm truncate" style={{ color: 'var(--admin-text-secondary)' }}>
          {displayColor || 'Keine Farbe'}
        </span>
        <Palette className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
      </button>

      {/* Picker Modal - Rendered as Portal */}
      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            style={{ backgroundColor: 'var(--admin-overlay)' }}
            onClick={() => setIsOpen(false)}
          />

          <div 
            className="fixed w-80 rounded-lg border p-4 z-[9999] max-h-[calc(100vh-32px)] overflow-y-auto"
            style={{ top: popupPosition.top, left: popupPosition.left, backgroundColor: 'var(--admin-bg-card)', boxShadow: 'var(--admin-shadow-lg)', borderColor: 'var(--admin-border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--admin-text-heading)' }}>{label}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="transition-colors"
                style={{ color: 'var(--admin-text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* No Color Option */}
            {allowNoColor && (
              <button
                type="button"
                onClick={handleNoColor}
                className="w-full mb-4 flex items-center gap-3 px-3 py-2 rounded-lg border-2 transition-all"
                style={{
                  borderColor: value === null ? 'var(--admin-accent)' : 'var(--admin-border)',
                  backgroundColor: value === null ? 'var(--admin-accent-bg)' : 'transparent',
                }}
              >
                <div className="w-8 h-8 rounded border flex items-center justify-center" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg-input)' }}>
                  <Ban className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Keine Farbe (Transparent)</span>
              </button>
            )}

            {/* Theme Colors */}
            {themeColors.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--admin-text-muted)' }}>
                  Theme-Farben
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {themeColors.map((item, idx) => {
                    const isSelected = value?.kind === 'custom' && value.hex === item.color;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleThemeColorSelect(item.ref, item.color)}
                        className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 relative group ${
                          isSelected
                            ? 'ring-2'
                            : ''
                        }`}
                        style={{
                          backgroundColor: item.color,
                          borderColor: isSelected ? 'var(--admin-accent)' : 'var(--admin-border)',
                          ...(isSelected ? { '--tw-ring-color': 'var(--admin-accent-light)' } as React.CSSProperties : {}),
                        }}
                        title={item.name}
                      >
                        {/* Tooltip */}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10" style={{ backgroundColor: 'var(--admin-text-heading)', color: 'var(--admin-bg-card)' }}>
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Neutral Colors */}
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--admin-text-muted)' }}>
                Neutrale Farben
              </p>
              <div className="grid grid-cols-5 gap-2">
                {neutralColors.map((item) => {
                  const isSelected = value?.kind === 'custom' && value.hex === item.hex;
                  return (
                    <button
                      key={item.hex}
                      type="button"
                      onClick={() => handleCustomColorSelect(item.hex)}
                      className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                        isSelected
                          ? 'ring-2'
                          : ''
                      }`}
                      style={{
                        backgroundColor: item.hex,
                        borderColor: isSelected ? 'var(--admin-accent)' : 'var(--admin-border)',
                        ...(isSelected ? { '--tw-ring-color': 'var(--admin-accent-light)' } as React.CSSProperties : {}),
                      }}
                      title={item.name}
                    />
                  );
                })}
              </div>
            </div>

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
                  className="w-12 h-10 rounded border cursor-pointer"
                  style={{ borderColor: 'var(--admin-border)' }}
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                  style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
                  placeholder="#000000"
                />
                <button
                  type="button"
                  onClick={() => handleCustomColorSelect(customColor)}
                  className="px-4 py-2 rounded-lg transition text-sm font-medium"
                  style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default ThemeColorPicker;
