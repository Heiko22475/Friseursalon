// =====================================================
// VISUAL EDITOR – TYPOGRAPHY SECTION
// Properties Panel: Font, Size, Weight, Color, Align, etc.
// Integriert mit Theme-Fonts und VE Color Picker
// =====================================================

import React, { useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline,
  Strikethrough,
  Type,
  Italic,
  ChevronDown,
} from 'lucide-react';
import type { StyleProperties, SizeValue } from '../types/styles';
import { ALL_FONTS, FONT_CATEGORY_LABELS, getFontById } from '../../data/fonts';
import { useVETheme } from '../theme/VEThemeBridge';
import { VEColorPicker } from '../components/VEColorPicker';
import { UnitInput } from '../components/UnitInput';

interface TypographySectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
}

// ===== ICON TOGGLE GROUP =====

function IconToggle({
  icon,
  active,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '28px',
        height: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? '#3b82f6' : 'transparent',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        color: active ? '#fff' : '#b0b7c3',
        transition: 'all 0.1s',
      }}
    >
      {icon}
    </button>
  );
}

// ===== FONT DROPDOWN =====

const FontDropdown: React.FC<{
  value: string | undefined;
  onChange: (fontFamily: string) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { typography } = useVETheme();

  // Get theme fonts for prominent display
  const themeHeadingFont = typography?.h1?.fontFamily ? getFontById(typography.h1.fontFamily) : null;
  const themeBodyFont = typography?.body?.fontFamily ? getFontById(typography.body.fontFamily) : null;

  const filtered = search
    ? ALL_FONTS.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : ALL_FONTS;

  // Group by category
  const grouped = new Map<string, typeof ALL_FONTS>();
  for (const font of filtered) {
    const cat = font.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(font);
  }

  const displayName = value || 'Font wählen…';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 8px',
          backgroundColor: '#2d2d3d',
          border: '1px solid #3d3d4d',
          borderRadius: '4px',
          color: value ? '#d1d5db' : '#b0b7c3',
          fontSize: '12px',
          cursor: 'pointer',
          fontFamily: value || 'inherit',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </span>
        <ChevronDown size={12} style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            marginTop: '4px',
            backgroundColor: '#1e1e2e',
            border: '1px solid #3d3d4d',
            borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            maxHeight: '280px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search */}
          <div style={{ padding: '6px' }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Font suchen…"
              style={{
                width: '100%',
                padding: '5px 8px',
                backgroundColor: '#2d2d3d',
                border: '1px solid #3d3d4d',
                borderRadius: '4px',
                color: '#d1d5db',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          {/* Font List */}
          <div style={{ overflow: 'auto', flex: 1 }}>
            {/* Theme Fonts */}
            {(themeHeadingFont || themeBodyFont) && !search && (
              <div>
                <div style={{
                  fontSize: '10px',
                  color: '#b0b7c3',
                  padding: '4px 10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  backgroundColor: '#1a1a28',
                }}>
                  Theme
                </div>
                {themeHeadingFont && (
                  <button
                    onClick={() => { onChange(themeHeadingFont.name); setOpen(false); setSearch(''); }}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      backgroundColor: value === themeHeadingFont.name ? '#2d2d4d' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#d1d5db',
                      fontSize: '13px',
                      textAlign: 'left',
                      fontFamily: `"${themeHeadingFont.name}", ${themeHeadingFont.fallback}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{themeHeadingFont.name}</span>
                    <span style={{ fontSize: '10px', color: '#b0b7c3' }}>Heading</span>
                  </button>
                )}
                {themeBodyFont && themeBodyFont.id !== themeHeadingFont?.id && (
                  <button
                    onClick={() => { onChange(themeBodyFont.name); setOpen(false); setSearch(''); }}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      backgroundColor: value === themeBodyFont.name ? '#2d2d4d' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#d1d5db',
                      fontSize: '13px',
                      textAlign: 'left',
                      fontFamily: `"${themeBodyFont.name}", ${themeBodyFont.fallback}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{themeBodyFont.name}</span>
                    <span style={{ fontSize: '10px', color: '#b0b7c3' }}>Body</span>
                  </button>
                )}
              </div>
            )}

            {/* All Fonts grouped by category */}
            {[...grouped.entries()].map(([cat, fonts]) => (
              <div key={cat}>
                <div style={{
                  fontSize: '10px',
                  color: '#b0b7c3',
                  padding: '4px 10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  backgroundColor: '#1a1a28',
                }}>
                  {FONT_CATEGORY_LABELS[cat as keyof typeof FONT_CATEGORY_LABELS] || cat}
                </div>
                {fonts.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => { onChange(font.name); setOpen(false); setSearch(''); }}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      backgroundColor: value === font.name ? '#2d2d4d' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#d1d5db',
                      fontSize: '13px',
                      textAlign: 'left',
                      fontFamily: `"${font.name}", ${font.fallback}`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d2d3d')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = value === font.name ? '#2d2d4d' : 'transparent')}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close */}
      {open && (
        <div
          onClick={() => { setOpen(false); setSearch(''); }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
          }}
        />
      )}
    </div>
  );
};

// ===== ROW =====

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '52px', flexShrink: 0, fontSize: '11px', color: '#b0b7c3' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ===== COMPONENT =====

export const TypographySection: React.FC<TypographySectionProps> = ({ styles, onChange }) => {
  const sz = 13;

  return (
    <div>
      {/* Font Family */}
      <Row label="Font">
        <FontDropdown
          value={styles.fontFamily}
          onChange={(v) => onChange('fontFamily', v || undefined)}
        />
      </Row>

      {/* Weight + Size in one row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {/* Weight */}
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '11px', color: '#b0b7c3', display: 'block', marginBottom: '3px' }}>Gewicht</label>
          <select
            value={styles.fontWeight ?? ''}
            onChange={(e) => onChange('fontWeight', e.target.value ? Number(e.target.value) : undefined)}
            style={{
              width: '100%',
              padding: '5px 6px',
              backgroundColor: '#2d2d3d',
              border: '1px solid #3d3d4d',
              borderRadius: '4px',
              color: '#d1d5db',
              fontSize: '12px',
            }}
          >
            <option value="">–</option>
            <option value="300">Light</option>
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semibold</option>
            <option value="700">Bold</option>
            <option value="800">Extra Bold</option>
          </select>
        </div>

        {/* Size */}
        <div style={{ flex: 1 }}>
          <UnitInput
            label="Größe"
            value={styles.fontSize}
            onChange={(v) => onChange('fontSize', v)}
            compact
            units={['px', 'rem', 'em', '%']}
            placeholder="16"
            min={1}
          />
        </div>
      </div>

      {/* Line Height + Letter Spacing */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <UnitInput
            label="Zeilen-H."
            value={typeof styles.lineHeight === 'object' ? styles.lineHeight as SizeValue : undefined}
            onChange={(v) => onChange('lineHeight', v)}
            compact
            units={['px', 'em', '%']}
            placeholder="1.5"
            step={0.1}
          />
        </div>
        <div style={{ flex: 1 }}>
          <UnitInput
            label="Abstand"
            value={styles.letterSpacing}
            onChange={(v) => onChange('letterSpacing', v)}
            compact
            units={['px', 'em']}
            placeholder="0"
            step={0.5}
          />
        </div>
      </div>

      {/* Text Align */}
      <Row label="Align">
        <div style={{ display: 'flex', gap: '2px', backgroundColor: '#1a1a2a', borderRadius: '4px', padding: '2px' }}>
          {[
            { value: 'left' as const, icon: <AlignLeft size={sz} />, title: 'Links' },
            { value: 'center' as const, icon: <AlignCenter size={sz} />, title: 'Mitte' },
            { value: 'right' as const, icon: <AlignRight size={sz} />, title: 'Rechts' },
            { value: 'justify' as const, icon: <AlignJustify size={sz} />, title: 'Blocksatz' },
          ].map((opt) => (
            <button
              key={opt.value}
              title={opt.title}
              onClick={() => onChange('textAlign', opt.value)}
              style={{
                width: '28px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: styles.textAlign === opt.value ? '#3b82f6' : 'transparent',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                color: styles.textAlign === opt.value ? '#fff' : '#b0b7c3',
              }}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </Row>

      {/* Decoration toggles */}
      <Row label="Stil">
        <div style={{ display: 'flex', gap: '2px', backgroundColor: '#1a1a2a', borderRadius: '4px', padding: '2px' }}>
          <IconToggle
            icon={<Italic size={sz} />}
            active={styles.fontStyle === 'italic'}
            onClick={() => onChange('fontStyle', styles.fontStyle === 'italic' ? 'normal' : 'italic')}
            title="Kursiv"
          />
          <IconToggle
            icon={<Type size={sz} />}
            active={styles.textTransform === 'uppercase'}
            onClick={() => onChange('textTransform', styles.textTransform === 'uppercase' ? 'none' : 'uppercase')}
            title="Großbuchstaben"
          />
          <IconToggle
            icon={<Underline size={sz} />}
            active={styles.textDecoration === 'underline'}
            onClick={() => onChange('textDecoration', styles.textDecoration === 'underline' ? 'none' : 'underline')}
            title="Unterstrichen"
          />
          <IconToggle
            icon={<Strikethrough size={sz} />}
            active={styles.textDecoration === 'line-through'}
            onClick={() => onChange('textDecoration', styles.textDecoration === 'line-through' ? 'none' : 'line-through')}
            title="Durchgestrichen"
          />
        </div>
      </Row>

      {/* Color */}
      <VEColorPicker
        label="Farbe"
        value={styles.color}
        onChange={(v) => onChange('color', v)}
      />
    </div>
  );
};
