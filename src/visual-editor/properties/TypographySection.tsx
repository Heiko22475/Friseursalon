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
  Pencil,
} from 'lucide-react';
import type { StyleProperties, SizeValue } from '../types/styles';
import { ALL_FONTS, FONT_CATEGORY_LABELS, getFontById } from '../../data/fonts';
import { useVETheme } from '../theme/VEThemeBridge';
import { VEColorPicker } from '../components/VEColorPicker';
import { UnitInput } from '../components/UnitInput';

interface TypographySectionProps {
  styles: Partial<StyleProperties>;
  onChange: (key: keyof StyleProperties, value: any) => void;
  /** Resolved token styles (from _typo) — shown as inherited placeholders */
  tokenStyles?: Partial<StyleProperties>;
  /** Label of the attached Typography Token */
  tokenLabel?: string;
  /** Key of the current _typo token (for display) */
  tokenKey?: string;
  /** All available typography tokens for selection */
  typographyTokens?: Record<string, { label: string; fontSize: { desktop: string }; fontWeight: number; standard?: boolean }>;
  /** Callback to change the _typo token on the class */
  onTypoTokenChange?: (key: string | undefined) => void;
  /** Whether the user has any per-element typography overrides */
  hasOverrides?: boolean;
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
        color: active ? '#fff' : 'var(--admin-text-icon)',
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

  // Resolve font entry to get the full CSS font-family with fallback
  const fontEntry = value ? ALL_FONTS.find((f) => f.name === value) : null;
  const buttonFontFamily = fontEntry
    ? `"${fontEntry.name}", ${fontEntry.fallback}`
    : value || 'inherit';

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
          backgroundColor: 'var(--admin-bg-input)',
          border: '1px solid var(--admin-border-strong)',
          borderRadius: '4px',
          color: value ? 'var(--admin-text)' : 'var(--admin-text-icon)',
          fontSize: '12px',
          cursor: 'pointer',
          fontFamily: buttonFontFamily,
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
            backgroundColor: 'var(--admin-bg-card)',
            border: '1px solid var(--admin-border-strong)',
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
                backgroundColor: 'var(--admin-bg-input)',
                border: '1px solid var(--admin-border-strong)',
                borderRadius: '4px',
                color: 'var(--admin-text)',
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
                  color: 'var(--admin-text-icon)',
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
                      color: 'var(--admin-text)',
                      fontSize: '13px',
                      textAlign: 'left',
                      fontFamily: `"${themeHeadingFont.name}", ${themeHeadingFont.fallback}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{themeHeadingFont.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--admin-text-icon)' }}>Heading</span>
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
                      color: 'var(--admin-text)',
                      fontSize: '13px',
                      textAlign: 'left',
                      fontFamily: `"${themeBodyFont.name}", ${themeBodyFont.fallback}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{themeBodyFont.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--admin-text-icon)' }}>Body</span>
                  </button>
                )}
              </div>
            )}

            {/* All Fonts grouped by category */}
            {[...grouped.entries()].map(([cat, fonts]) => (
              <div key={cat}>
                <div style={{
                  fontSize: '10px',
                  color: 'var(--admin-text-icon)',
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
                      color: 'var(--admin-text)',
                      fontSize: '13px',
                      textAlign: 'left',
                      fontFamily: `"${font.name}", ${font.fallback}`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--admin-border)')}
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
    <label style={{ width: '52px', flexShrink: 0, fontSize: '11px', color: 'var(--admin-text-icon)' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ===== COMPONENT =====

/** Small label showing that a value is inherited from a token */
const TokenHint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontSize: '9px', color: '#a78bfa', marginLeft: '4px', fontStyle: 'italic', whiteSpace: 'nowrap' }}>← {children}</span>
);

export const TypographySection: React.FC<TypographySectionProps> = ({
  styles, onChange, tokenStyles, tokenLabel, tokenKey, typographyTokens, onTypoTokenChange, hasOverrides,
}) => {
  const sz = 13;
  const hasToken = !!(tokenStyles && tokenLabel);
  const [showOverrides, setShowOverrides] = useState(hasOverrides ?? false);

  // Helper: get effective value (own or token-inherited)
  const eff = <K extends keyof StyleProperties>(key: K): StyleProperties[K] | undefined =>
    styles[key] !== undefined ? styles[key] : tokenStyles?.[key];

  // Helper: is this field inherited from the token?
  const isInherited = (key: keyof StyleProperties) =>
    hasToken && styles[key] === undefined && tokenStyles?.[key] !== undefined;

  // Check if there are actual per-element style overrides
  const typoKeys: (keyof StyleProperties)[] = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign', 'textDecoration', 'textTransform', 'fontStyle', 'color'];
  const hasAnyOverride = typoKeys.some(k => styles[k] !== undefined);

  return (
    <div>
      {/* Token Selector (always visible if tokens are available) */}
      {typographyTokens && onTypoTokenChange && Object.keys(typographyTokens).length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Type size={12} style={{ color: '#a78bfa' }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Typo Token
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={tokenKey || ''}
              onChange={(e) => onTypoTokenChange(e.target.value || undefined)}
              style={{
                width: '100%',
                padding: '6px 28px 6px 8px',
                borderRadius: '4px',
                border: tokenKey ? '1px solid #a78bfa40' : '1px solid var(--admin-border)',
                backgroundColor: tokenKey ? '#7c5cfc10' : 'var(--admin-bg-sidebar)',
                color: tokenKey ? '#c4b5fd' : 'var(--admin-text)',
                fontSize: '12px',
                cursor: 'pointer',
                appearance: 'none' as const,
                outline: 'none',
              }}
            >
              <option value="">– Kein Typo Token –</option>
              {Object.entries(typographyTokens).map(([key, t]) => (
                <option key={key} value={key}>
                  {t.label} ({t.fontSize.desktop}, {t.fontWeight})
                  {t.standard ? ' ★' : ''}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', pointerEvents: 'none' }}
            />
          </div>
          {tokenKey && tokenLabel && (
            <div style={{ marginTop: '4px', fontSize: '10px', color: 'var(--admin-text-muted)' }}>
              Verknüpft: {tokenLabel} – Font/Größe/Gewicht werden vom Token gesteuert
            </div>
          )}
        </div>
      )}

      {/* Token Banner (when token is active via class and no picker available) */}
      {hasToken && !(typographyTokens && onTypoTokenChange) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          marginBottom: '10px',
          borderRadius: '4px',
          backgroundColor: '#7c5cfc10',
          border: '1px solid #7c5cfc30',
        }}>
          <Type size={12} style={{ color: '#a78bfa', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: '#c4b5fd', fontWeight: 600 }}>
            {tokenLabel}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--admin-text-muted)', marginLeft: 'auto' }}>
            Token
          </span>
        </div>
      )}

      {/* "Typografie anpassen" toggle button */}
      {!showOverrides ? (
        <button
          onClick={() => setShowOverrides(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            width: '100%',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid var(--admin-border)',
            backgroundColor: hasAnyOverride ? '#2563eb10' : 'var(--admin-bg-sidebar)',
            color: hasAnyOverride ? '#60a5fa' : 'var(--admin-text-icon)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <Pencil size={12} />
          Typografie anpassen
          {hasAnyOverride && (
            <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#60a5fa', fontWeight: 400 }}>
              (Anpassungen vorhanden)
            </span>
          )}
        </button>
      ) : (
        <>
          <button
            onClick={() => setShowOverrides(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
              padding: '6px 10px',
              marginBottom: '10px',
              borderRadius: '6px',
              border: '1px solid var(--admin-border)',
              backgroundColor: 'var(--admin-bg-sidebar)',
              color: 'var(--admin-text-muted)',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            <ChevronDown size={10} style={{ transform: 'rotate(180deg)' }} />
            Anpassungen ausblenden
          </button>

      {/* Font Family */}
      <Row label="Font">
        <div>
          <FontDropdown
            value={styles.fontFamily || (tokenStyles?.fontFamily as string | undefined)}
            onChange={(v) => onChange('fontFamily', v || undefined)}
          />
          {isInherited('fontFamily') && <TokenHint>Token</TokenHint>}
        </div>
      </Row>

      {/* Weight + Size in one row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {/* Weight */}
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '11px', color: 'var(--admin-text-icon)', display: 'block', marginBottom: '3px' }}>
            Gewicht{isInherited('fontWeight') && <TokenHint>Token</TokenHint>}
          </label>
          <select
            value={styles.fontWeight ?? (hasToken ? (tokenStyles?.fontWeight ?? '') : '')}
            onChange={(e) => onChange('fontWeight', e.target.value ? Number(e.target.value) : undefined)}
            style={{
              width: '100%',
              padding: '5px 6px',
              backgroundColor: isInherited('fontWeight') ? 'var(--admin-border)' : 'var(--admin-border)',
              border: isInherited('fontWeight') ? '1px solid #7c5cfc30' : '1px solid var(--admin-border-strong)',
              borderRadius: '4px',
              color: isInherited('fontWeight') ? '#a78bfa' : 'var(--admin-text)',
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
            units={['rem', 'px', 'em', '%']}
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
            units={['rem', 'px', 'em', '%']}
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
            units={['rem', 'px', 'em']}
            placeholder="0"
            step={0.5}
          />
        </div>
      </div>

      {/* Text Align */}
      <Row label="Align">
        <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--admin-bg-surface)', borderRadius: '4px', padding: '2px' }}>
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
                color: styles.textAlign === opt.value ? '#fff' : 'var(--admin-text-icon)',
              }}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </Row>

      {/* Decoration toggles */}
      <Row label="Stil">
        <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--admin-bg-surface)', borderRadius: '4px', padding: '2px' }}>
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
        label={isInherited('color') ? 'Farbe ← Token' : 'Farbe'}
        value={eff('color')}
        onChange={(v) => onChange('color', v)}
      />
        </>
      )}
    </div>
  );
};
