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
    className={`w-full text-left px-3 py-3 rounded-lg border-2 transition-all hover:bg-gray-50 ${
      isSelected
        ? 'border-rose-500 bg-rose-50'
        : 'border-gray-200 hover:border-gray-300'
    }`}
  >
    <div className="flex items-center justify-between mb-1">
      <span
        className="text-lg"
        style={{ fontFamily: `'${font.name}', ${font.fallback}` }}
      >
        {font.name}
      </span>
      <span className="text-xs text-gray-400 uppercase">{font.category}</span>
    </div>
    <p
      className="text-sm text-gray-600"
      style={{ fontFamily: `'${font.name}', ${font.fallback}` }}
    >
      {font.preview}
    </p>
    <div className="flex gap-1 mt-2">
      {font.weights.map((w) => (
        <span
          key={w}
          className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded"
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
      <label className="block text-xs text-gray-500 mb-1">{label}</label>

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-rose-400 transition-colors text-left"
      >
        <Type className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
            <span className="text-gray-500">Schriftart wählen...</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
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
            className="fixed w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden"
            style={{ top: popupPosition.top, left: popupPosition.left }}
          >
            {/* Header */}
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
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
              <div className="flex gap-1 p-2 border-b bg-gray-50 overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setActiveCategory(cat.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition ${
                      activeCategory === cat.value
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
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
                <div className="text-center py-8 text-gray-500">
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
      className={`px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${className}`}
      style={{
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
