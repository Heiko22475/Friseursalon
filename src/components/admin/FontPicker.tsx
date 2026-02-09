// =====================================================
// FONT PICKER
// Visual font selection component for typography
// =====================================================

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Type, Search } from 'lucide-react';
import { FontFamily, FontCategory } from '../../types/typography';
import { ALL_FONTS, getFontsByCategory } from '../../data/fonts';

// ===== FONT PICKER PROPS =====

interface FontPickerProps {
  label: string;
  value: string; // Font ID
  onChange: (fontId: string) => void;
  category?: FontCategory; // Optional: Filter by category
  className?: string;
}

// ===== FONT PREVIEW ITEM =====

const FontPreviewItem: React.FC<{
  font: FontFamily;
  isSelected: boolean;
  onClick: () => void;
}> = ({ font, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left px-3 py-3 rounded-lg border-2 transition-all"
    style={isSelected
      ? { borderColor: 'var(--admin-accent)', backgroundColor: 'var(--admin-accent-bg)' }
      : { borderColor: 'var(--admin-border)' }
    }
    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'; e.currentTarget.style.borderColor = 'var(--admin-border-strong)'; } }}
    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderColor = 'var(--admin-border)'; } }}
  >
    <div className="flex items-center justify-between mb-1">
      <span
        className="text-lg"
        style={{ fontFamily: `'${font.name}', ${font.fallback}` }}
      >
        {font.name}
      </span>
      <span className="text-xs uppercase" style={{ color: 'var(--admin-text-muted)' }}>{font.category}</span>
    </div>
    <p
      className="text-sm"
      style={{ fontFamily: `'${font.name}', ${font.fallback}`, color: 'var(--admin-text-secondary)' }}
    >
      {font.preview}
    </p>
    <div className="flex gap-1 mt-2">
      {font.weights.map((w) => (
        <span
          key={w}
          className="text-xs px-1.5 py-0.5 rounded"
          style={{ backgroundColor: 'var(--admin-bg-surface)', color: 'var(--admin-text-muted)' }}
        >
          {w}
        </span>
      ))}
    </div>
  </button>
);

// ===== CATEGORY TABS =====

const CATEGORIES: { value: FontCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'sans-serif', label: 'Sans-Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'display', label: 'Display' },
  { value: 'handwriting', label: 'Handschrift' },
  { value: 'monospace', label: 'Monospace' },
];

// ===== FONT PICKER COMPONENT =====

export const FontPicker: React.FC<FontPickerProps> = ({
  label,
  value,
  onChange,
  category,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FontCategory | 'all'>(
    category || 'all'
  );

  // Get selected font
  const selectedFont = useMemo(
    () => ALL_FONTS.find((f) => f.id === value),
    [value]
  );

  // Filter fonts
  const filteredFonts = useMemo(() => {
    let fonts =
      activeCategory === 'all'
        ? ALL_FONTS
        : getFontsByCategory(activeCategory);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      fonts = fonts.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.preview.toLowerCase().includes(query)
      );
    }

    return fonts;
  }, [activeCategory, searchQuery]);

  const handleSelect = (fontId: string) => {
    onChange(fontId);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Ref for positioning the popup
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  // Calculate popup position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popupWidth = 384; // w-96
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
        className="w-full flex items-center gap-3 px-3 py-2 border rounded-lg transition-colors text-left"
        style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border-strong)' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--admin-accent)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--admin-border-strong)')}
      >
        <Type className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--admin-text-muted)' }} />
        <div className="flex-1 min-w-0">
          {selectedFont ? (
            <span
              className="text-base truncate block"
              style={{
                fontFamily: `'${selectedFont.name}', ${selectedFont.fallback}`,
              }}
            >
              {selectedFont.name}
            </span>
          ) : (
            <span style={{ color: 'var(--admin-text-muted)' }}>Schriftart wählen...</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ color: 'var(--admin-text-muted)' }}
        />
      </button>

      {/* Dropdown - Rendered as Portal */}
      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/10 z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          <div 
            className="fixed w-96 max-w-[calc(100vw-2rem)] rounded-lg border z-[9999] overflow-hidden"
            style={{ backgroundColor: 'var(--admin-bg-card)', boxShadow: 'var(--admin-shadow-lg)', borderColor: 'var(--admin-border)', top: popupPosition.top, left: popupPosition.left } as React.CSSProperties}
          >
            {/* Header */}
            <div className="p-3 border-b" style={{ backgroundColor: 'var(--admin-bg-surface)', borderColor: 'var(--admin-border)' }}>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--admin-bg-input)', borderColor: 'var(--admin-border-strong)' }}>
                <Search className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Schriftart suchen..."
                  className="flex-1 text-sm outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Category Tabs */}
            {!category && (
              <div className="flex gap-1 p-2 border-b overflow-x-auto" style={{ backgroundColor: 'var(--admin-bg-surface)', borderColor: 'var(--admin-border)' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setActiveCategory(cat.value)}
                    className="px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition"
                    style={activeCategory === cat.value
                      ? { backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }
                      : { backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text-secondary)' }
                    }
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* Font List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-2">
              {filteredFonts.length > 0 ? (
                filteredFonts.map((font) => (
                  <FontPreviewItem
                    key={font.id}
                    font={font}
                    isSelected={font.id === value}
                    onClick={() => handleSelect(font.id)}
                  />
                ))
              ) : (
                <div className="text-center py-8" style={{ color: 'var(--admin-text-muted)' }}>
                  <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Keine Schriftarten gefunden</p>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

// ===== COMPACT FONT PICKER (for inline use) =====

interface CompactFontPickerProps {
  value: string;
  onChange: (fontId: string) => void;
  className?: string;
}

export const CompactFontPicker: React.FC<CompactFontPickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const selectedFont = useMemo(
    () => ALL_FONTS.find((f) => f.id === value),
    [value]
  );

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 ${className}`}
      style={{
        borderColor: 'var(--admin-border-strong)',
        backgroundColor: 'var(--admin-bg-input)',
        fontFamily: selectedFont
          ? `'${selectedFont.name}', ${selectedFont.fallback}`
          : undefined,
      }}
    >
      {CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
        <optgroup key={cat.value} label={cat.label}>
          {getFontsByCategory(cat.value as FontCategory).map((font) => (
            <option
              key={font.id}
              value={font.id}
              style={{ fontFamily: `'${font.name}', ${font.fallback}` }}
            >
              {font.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

export default FontPicker;
