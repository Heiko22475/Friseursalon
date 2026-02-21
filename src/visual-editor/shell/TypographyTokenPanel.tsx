// =====================================================
// VISUAL EDITOR – TYPOGRAPHY TOKEN PANEL
// Manages TypographyTokens (Level 2 of the Typography Token System)
// CRUD operations: Create, Edit, Delete, Set Standard
// =====================================================

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Star, ChevronDown, ChevronRight, Type } from 'lucide-react';
import { findElementById } from '../utils/elementHelpers';
import { useEditor } from '../state/EditorContext';
import { VEColorPicker } from '../components/VEColorPicker';
import { ALL_FONTS } from '../../data/fonts';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import type { TypographyToken, TypographyTokenHover, ResponsiveStringValue } from '../types/typographyTokens';
import {
  DEFAULT_TYPOGRAPHY_TOKEN,
  getStylesUsingTypoToken,
  getStandardTypoTokenKey,
} from '../types/typographyTokens';
import type { ColorValue } from '../../types/theme';

// ===== SHARED STYLES =====

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#888',
  marginBottom: '3px',
  textTransform: 'uppercase',
  fontWeight: 600,
  letterSpacing: '0.05em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  borderRadius: '4px',
  border: '1px solid var(--admin-border)',
  backgroundColor: 'var(--admin-bg-sidebar)',
  color: 'var(--admin-text)',
  fontSize: '12px',
  outline: 'none',
};

const smallBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '3px 8px',
  borderRadius: '4px',
  background: 'none',
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: 600,
};

const FONT_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const FONT_WEIGHT_LABELS: Record<number, string> = {
  100: 'Thin',
  200: 'Extra Light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semi Bold',
  700: 'Bold',
  800: 'Extra Bold',
  900: 'Black',
};

const TEXT_TRANSFORMS: { value: string; label: string }[] = [
  { value: 'none', label: 'Normal' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
];

const TEXT_DECORATIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'Keine' },
  { value: 'underline', label: 'Unterstrichen' },
  { value: 'line-through', label: 'Durchgestrichen' },
];

// ===== FONT TOKEN DROPDOWN =====

const FontTokenDropdown: React.FC<{
  value: string;
  onChange: (key: string) => void;
}> = ({ value, onChange }) => {
  const { state } = useEditor();
  const { fontTokens } = state;
  const tokenKeys = Object.keys(fontTokens);

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputStyle,
          cursor: 'pointer',
          appearance: 'none',
          paddingRight: '24px',
        }}
      >
        <option value="">– Font wählen –</option>
        {tokenKeys.map((key) => {
          const ft = fontTokens[key];
          const fontObj = ALL_FONTS.find((f) => f.id === ft.fontFamily);
          return (
            <option key={key} value={key}>
              {ft.label} ({fontObj?.name || ft.fontFamily})
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={12}
        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', pointerEvents: 'none' }}
      />
    </div>
  );
};

// ===== RESPONSIVE UNIT INPUT (desktop / tablet / mobile) =====

const UNIT_OPTIONS = ['rem', 'px', 'em'] as const;
type UnitOption = typeof UNIT_OPTIONS[number];

/** Parse a CSS size string like "1.5rem" into { num: 1.5, unit: 'rem' } */
function parseSizeString(s: string): { num: number; unit: UnitOption } {
  if (!s) return { num: 0, unit: 'rem' };
  const match = s.match(/^(-?[\d.]+)\s*(rem|px|em)$/i);
  if (match) {
    return { num: parseFloat(match[1]), unit: match[2].toLowerCase() as UnitOption };
  }
  // Fallback: try to parse as number, assume rem
  const n = parseFloat(s);
  return { num: isNaN(n) ? 0 : n, unit: 'rem' };
}

function buildSizeString(num: number, unit: UnitOption): string {
  return `${num}${unit}`;
}

const ResponsiveUnitInput: React.FC<{
  label: string;
  value: ResponsiveStringValue;
  onChange: (val: ResponsiveStringValue) => void;
  step?: number;
  min?: number;
}> = ({ label, value, onChange, step = 0.125, min }) => {
  const viewports = ['desktop', 'tablet', 'mobile'] as const;
  const vpLabels = { desktop: 'D', tablet: 'T', mobile: 'M' };

  const handleChange = (vp: typeof viewports[number], num: number, unit: UnitOption) => {
    const val = buildSizeString(num, unit);
    onChange({ ...value, [vp]: val });
  };

  const handleUnitChange = (vp: typeof viewports[number], newUnit: UnitOption) => {
    const parsed = parseSizeString(value[vp] || '');
    handleChange(vp, parsed.num, newUnit);
  };

  const handleNumChange = (vp: typeof viewports[number], raw: string) => {
    const parsed = parseSizeString(value[vp] || '');
    const num = parseFloat(raw);
    if (raw === '' || raw === '-') {
      onChange({ ...value, [vp]: '' });
      return;
    }
    if (!isNaN(num)) {
      handleChange(vp, num, parsed.unit);
    }
  };

  const handleKeyDown = (vp: typeof viewports[number], e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const parsed = parseSizeString(value[vp] || '');
      const delta = e.key === 'ArrowUp' ? step : -step;
      const multiplier = e.shiftKey ? 10 : 1;
      let newNum = parsed.num + delta * multiplier;
      // Round to avoid floating point noise
      newNum = Math.round(newNum * 1000) / 1000;
      if (min !== undefined) newNum = Math.max(min, newNum);
      handleChange(vp, newNum, parsed.unit);
    }
  };

  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '4px' }}>
        {viewports.map((vp) => {
          const parsed = parseSizeString(value[vp] || '');
          return (
            <div key={vp} style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)', textAlign: 'center', marginBottom: '2px' }}>
                {vpLabels[vp]}
              </div>
              <div style={{ display: 'flex' }}>
                <input
                  type="number"
                  value={value[vp] ? parsed.num : ''}
                  onChange={(e) => handleNumChange(vp, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(vp, e)}
                  placeholder="0"
                  step={step}
                  min={min}
                  style={{
                    ...inputStyle,
                    flex: 1,
                    minWidth: 0,
                    textAlign: 'center',
                    padding: '6px 4px',
                    fontSize: '11px',
                    borderRadius: '4px 0 0 4px',
                    borderRight: 'none',
                    MozAppearance: 'textfield' as any,
                  }}
                />
                <select
                  value={parsed.unit}
                  onChange={(e) => handleUnitChange(vp, e.target.value as UnitOption)}
                  style={{
                    padding: '6px 2px',
                    backgroundColor: '#252535',
                    border: '1px solid var(--admin-border)',
                    borderLeft: 'none',
                    borderRadius: '0 4px 4px 0',
                    color: '#8b8fa3',
                    fontSize: '11px',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '32px',
                  }}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===== SELECT DROPDOWN =====

const SelectField: React.FC<{
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (val: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div>
    <label style={fieldLabelStyle}>{label}</label>
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', paddingRight: '24px' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        size={12}
        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', pointerEvents: 'none' }}
      />
    </div>
  </div>
);

// ===== HOVER SECTION (collapsible) =====

const HoverSection: React.FC<{
  hover: TypographyTokenHover | null;
  onChange: (h: TypographyTokenHover | null) => void;
}> = ({ hover, onChange }) => {
  const [open, setOpen] = useState(false);
  const hasHover = hover !== null;

  const toggleHover = () => {
    if (hasHover) {
      onChange(null);
      setOpen(false);
    } else {
      onChange({});
      setOpen(true);
    }
  };

  const update = (partial: Partial<TypographyTokenHover>) => {
    onChange({ ...(hover || {}), ...partial });
  };

  return (
    <div style={{ border: '1px solid var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
      <button
        onClick={() => hasHover ? setOpen(!open) : toggleHover()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          width: '100%',
          padding: '6px 8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: hasHover ? '#60a5fa' : 'var(--admin-text-muted)',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        {hasHover ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        Hover-Effekte
        {hasHover && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleHover(); }}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#f87171',
              fontSize: '11px',
              padding: '0 4px',
            }}
          >
            Entfernen
          </button>
        )}
      </button>

      {hasHover && open && (
        <div style={{ padding: '6px 8px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Hover Color */}
          <VEColorPicker
            label="Hover-Farbe"
            value={hover?.color ?? null}
            onChange={(c) => update({ color: c ?? undefined })}
            allowNoColor
          />

          {/* Hover Text Decoration */}
          <SelectField
            label="Hover-Dekoration"
            value={hover?.textDecoration || 'none'}
            options={TEXT_DECORATIONS}
            onChange={(v) => update({ textDecoration: v as TypographyTokenHover['textDecoration'] })}
          />

          {/* Hover Letter Spacing */}
          <div>
            <label style={fieldLabelStyle}>Hover-Buchstabenabstand</label>
            <input
              value={hover?.letterSpacing || ''}
              onChange={(e) => update({ letterSpacing: e.target.value || undefined })}
              placeholder="z.B. 0.05em"
              style={inputStyle}
            />
          </div>

          {/* Hover Font Weight */}
          <SelectField
            label="Hover-Schriftstärke"
            value={hover?.fontWeight || ''}
            options={[
              { value: '', label: 'Keine Änderung' },
              ...FONT_WEIGHTS.map((w) => ({ value: w, label: `${w} – ${FONT_WEIGHT_LABELS[w]}` })),
            ]}
            onChange={(v) => update({ fontWeight: v ? (Number(v) as TypographyTokenHover['fontWeight']) : undefined })}
          />
        </div>
      )}
    </div>
  );
};

// ===== TYPOGRAPHY TOKEN EDITOR (inline expanded) =====

const TypographyTokenEditor: React.FC<{
  tokenKey: string;
  token: TypographyToken;
  isStandard: boolean;
  usageCount: number;
  onClose: () => void;
}> = ({ tokenKey, token, isStandard, usageCount, onClose }) => {
  const { state, dispatch } = useEditor();
  const [label, setLabel] = useState(token.label);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const standardKey = getStandardTypoTokenKey(state.typographyTokens);
  const otherKeys = Object.keys(state.typographyTokens).filter((k) => k !== tokenKey);

  const save = (partial: Partial<TypographyToken>) => {
    dispatch({
      type: 'SET_TYPOGRAPHY_TOKEN',
      key: tokenKey,
      token: { ...token, ...partial },
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const replaceWith = standardKey && standardKey !== tokenKey ? standardKey : otherKeys[0];
    if (!replaceWith) return;
    dispatch({ type: 'DELETE_TYPOGRAPHY_TOKEN', key: tokenKey, replaceWith });
    onClose();
  };

  return (
    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Label */}
      <div>
        <label style={fieldLabelStyle}>Bezeichnung</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => save({ label })}
          onKeyDown={(e) => e.key === 'Enter' && save({ label })}
          style={inputStyle}
        />
      </div>

      {/* Font Token Reference */}
      <div>
        <label style={fieldLabelStyle}>Font Token</label>
        <FontTokenDropdown
          value={token.fontToken}
          onChange={(key) => save({ fontToken: key })}
        />
      </div>

      {/* Font Size (responsive) */}
      <ResponsiveUnitInput
        label="Schriftgröße"
        value={token.fontSize}
        onChange={(v) => save({ fontSize: v })}
        step={0.125}
        min={0}
      />

      {/* Font Weight */}
      <SelectField
        label="Schriftstärke"
        value={token.fontWeight}
        options={FONT_WEIGHTS.map((w) => ({ value: w, label: `${w} – ${FONT_WEIGHT_LABELS[w]}` }))}
        onChange={(v) => save({ fontWeight: Number(v) as TypographyToken['fontWeight'] })}
      />

      {/* Line Height (responsive) */}
      <ResponsiveUnitInput
        label="Zeilenhöhe"
        value={token.lineHeight}
        onChange={(v) => save({ lineHeight: v })}
        step={0.1}
      />

      {/* Letter Spacing */}
      <div>
        <label style={fieldLabelStyle}>Buchstabenabstand</label>
        <div style={{ display: 'flex' }}>
          <input
            type="number"
            value={parseSizeString(token.letterSpacing || '0em').num}
            onChange={(e) => {
              const num = parseFloat(e.target.value);
              if (!isNaN(num)) {
                const unit = parseSizeString(token.letterSpacing || '0em').unit;
                save({ letterSpacing: buildSizeString(num, unit) });
              } else if (e.target.value === '' || e.target.value === '-') {
                save({ letterSpacing: '' });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const parsed = parseSizeString(token.letterSpacing || '0em');
                const delta = e.key === 'ArrowUp' ? 0.01 : -0.01;
                const multiplier = e.shiftKey ? 10 : 1;
                let newNum = Math.round((parsed.num + delta * multiplier) * 1000) / 1000;
                save({ letterSpacing: buildSizeString(newNum, parsed.unit) });
              }
            }}
            step={0.01}
            placeholder="0"
            style={{
              ...inputStyle,
              flex: 1,
              padding: '6px 4px',
              textAlign: 'center',
              borderRadius: '4px 0 0 4px',
              borderRight: 'none',
              MozAppearance: 'textfield' as any,
            }}
          />
          <select
            value={parseSizeString(token.letterSpacing || '0em').unit}
            onChange={(e) => {
              const parsed = parseSizeString(token.letterSpacing || '0em');
              save({ letterSpacing: buildSizeString(parsed.num, e.target.value as UnitOption) });
            }}
            style={{
              padding: '6px 2px',
              backgroundColor: '#252535',
              border: '1px solid var(--admin-border)',
              borderLeft: 'none',
              borderRadius: '0 4px 4px 0',
              color: '#8b8fa3',
              fontSize: '11px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '32px',
            }}
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Text Transform */}
      <SelectField
        label="Textumwandlung"
        value={token.textTransform || 'none'}
        options={TEXT_TRANSFORMS}
        onChange={(v) => save({ textTransform: v as TypographyToken['textTransform'] })}
      />

      {/* Color */}
      <VEColorPicker
        label="Textfarbe"
        value={token.color}
        onChange={(c: ColorValue | null) => save({ color: c })}
        allowNoColor
      />

      {/* Hover Effects */}
      <HoverSection
        hover={token.hover}
        onChange={(h) => save({ hover: h })}
      />

      {/* Standard toggle + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
        {!isStandard ? (
          <button
            onClick={() => dispatch({ type: 'SET_STANDARD_TYPOGRAPHY_TOKEN', key: tokenKey })}
            title="Als Standard-Typo setzen (Fallback bei Löschung)"
            style={{
              ...smallBtnStyle,
              color: '#fbbf24',
              border: '1px solid #fbbf2440',
            }}
          >
            <Star size={11} /> Standard
          </button>
        ) : (
          <span style={{ fontSize: '11px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={11} fill="#fbbf24" /> Standard-Typo
          </span>
        )}
        <span style={{ flex: 1 }} />
        {otherKeys.length > 0 && (
          <button
            onClick={handleDelete}
            title={confirmDelete ? `Wirklich löschen? ${usageCount} Klassen werden umgeleitet` : 'Typography Token löschen'}
            style={{
              ...smallBtnStyle,
              color: confirmDelete ? '#fff' : '#f87171',
              backgroundColor: confirmDelete ? '#ef4444' : 'transparent',
              border: confirmDelete ? '1px solid #ef4444' : '1px solid #ef444440',
            }}
          >
            <Trash2 size={11} /> {confirmDelete ? 'Bestätigen' : 'Löschen'}
          </button>
        )}
      </div>

      {/* Usage info */}
      {usageCount > 0 && (
        <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
          Wird von {usageCount} Klasse{usageCount !== 1 ? 'n' : ''} verwendet
        </div>
      )}
    </div>
  );
};

// ===== TOKEN HOVER PREVIEW FLYOUT =====

const TokenPreviewFlyout: React.FC<{
  token: TypographyToken;
  fontTokens: Record<string, import('../types/typographyTokens').FontToken>;
  anchorRect: { top: number; right: number; height: number };
}> = ({ token, fontTokens, anchorRect }) => {
  const fontToken = fontTokens[token.fontToken];
  const fontObj = fontToken ? ALL_FONTS.find((f) => f.id === fontToken.fontFamily) : null;
  const fontFamily = fontObj ? `"${fontObj.name}", ${fontObj.fallback}` : 'inherit';
  const { theme } = useAdminTheme();

  // Parse desktop font size for preview
  const previewSize = token.fontSize.desktop || '1rem';

  return createPortal(
    <div className={`admin-theme-${theme}`} style={{ display: 'contents' }}>
    <div
      style={{
        position: 'fixed',
        left: `${anchorRect.right + 8}px`,
        top: `${anchorRect.top}px`,
        zIndex: 9999,
        backgroundColor: 'var(--admin-bg-card)',
        border: '1px solid var(--admin-border-strong)',
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        minWidth: '200px',
        maxWidth: '320px',
        pointerEvents: 'none',
      }}
    >
      {/* Preview text */}
      <div
        style={{
          fontFamily,
          fontSize: previewSize,
          fontWeight: token.fontWeight,
          lineHeight: token.lineHeight.desktop || '1.4',
          letterSpacing: token.letterSpacing || 'normal',
          color: 'var(--admin-text)',
          textTransform: (token.textTransform || 'none') as React.CSSProperties['textTransform'],
          marginBottom: '12px',
          wordBreak: 'break-word',
        }}
      >
        Schöne Frisuren
      </div>

      {/* Token details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
          <span style={{ color: 'var(--admin-text-icon)' }}>Font:</span> {fontObj?.name || token.fontToken}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
          <span style={{ color: 'var(--admin-text-icon)' }}>Größe:</span> {token.fontSize.desktop}
          {token.fontSize.tablet && ` / ${token.fontSize.tablet}`}
          {token.fontSize.mobile && ` / ${token.fontSize.mobile}`}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
          <span style={{ color: 'var(--admin-text-icon)' }}>Gewicht:</span> {FONT_WEIGHT_LABELS[token.fontWeight] || token.fontWeight}
        </div>
        {token.lineHeight.desktop && (
          <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
            <span style={{ color: 'var(--admin-text-icon)' }}>Zeile:</span> {token.lineHeight.desktop}
          </div>
        )}
        {token.letterSpacing && token.letterSpacing !== '0' && (
          <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
            <span style={{ color: 'var(--admin-text-icon)' }}>Abstand:</span> {token.letterSpacing}
          </div>
        )}
      </div>
    </div>
    </div>,
    document.body
  );
};

// ===== TYPOGRAPHY TOKEN PANEL =====

export const TypographyTokenPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { fontTokens, typographyTokens, globalStyles } = state;
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [hoverRect, setHoverRect] = useState<{ top: number; right: number; height: number } | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll expanded token into view
  useEffect(() => {
    if (expandedKey && rowRefs.current[expandedKey]) {
      // small delay to let the DOM expand
      requestAnimationFrame(() => {
        rowRefs.current[expandedKey]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [expandedKey]);

  // Determine which typo tokens the selected element uses (via its classes)
  const activeTypoKeys = useMemo(() => {
    const keys = new Set<string>();
    if (!state.selectedId) return keys;
    const el = findElementById(state.page.body, state.selectedId);
    if (!el?.classNames) return keys;
    for (const cn of el.classNames) {
      const classDef = globalStyles[cn];
      if (classDef?._typo && typographyTokens[classDef._typo]) {
        keys.add(classDef._typo);
      }
    }
    return keys;
  }, [state.selectedId, state.page.body, globalStyles, typographyTokens]);

  const handleMouseEnterRow = useCallback((key: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredKey(key);
    setHoverRect({ top: rect.top, right: rect.right, height: rect.height });
  }, []);

  const handleMouseLeaveRow = useCallback(() => {
    setHoveredKey(null);
    setHoverRect(null);
  }, []);

  const tokenKeys = Object.keys(typographyTokens);
  const standardKey = getStandardTypoTokenKey(typographyTokens);

  // Precompute usage counts
  const usageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const key of tokenKeys) {
      counts[key] = getStylesUsingTypoToken(globalStyles, key).length;
    }
    return counts;
  }, [tokenKeys, globalStyles]);

  const handleCreate = () => {
    let idx = tokenKeys.length + 1;
    let key = `typo-${idx}`;
    while (typographyTokens[key]) {
      key = `typo-${++idx}`;
    }
    const fontTokenKey = Object.keys(fontTokens)[0] || '';
    const isFirst = tokenKeys.length === 0;
    dispatch({
      type: 'SET_TYPOGRAPHY_TOKEN',
      key,
      token: { ...DEFAULT_TYPOGRAPHY_TOKEN, fontToken: fontTokenKey, standard: isFirst ? true : undefined },
    });
    setExpandedKey(key);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '8px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px 8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-icon)', flex: 1 }}>
          Typo Tokens ({tokenKeys.length})
        </span>
        <button
          onClick={handleCreate}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#60a5fa',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Neuen Typography Token erstellen"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Empty state warning when no font tokens exist */}
      {Object.keys(fontTokens).length === 0 && (
        <div style={{ padding: '12px', margin: '0 8px', borderRadius: '6px', backgroundColor: '#fbbf2410', border: '1px solid #fbbf2430' }}>
          <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600, marginBottom: '4px' }}>
            Keine Font Tokens
          </div>
          <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
            Erstelle zuerst Font Tokens, bevor du Typo Tokens anlegen kannst.
          </div>
        </div>
      )}

      {/* Token List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
        {tokenKeys.length === 0 && Object.keys(fontTokens).length > 0 && (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '12px' }}>
            Keine Typography Tokens definiert.
            <br />
            Klicke + um einen zu erstellen.
          </div>
        )}

        {tokenKeys.map((key) => {
          const token = typographyTokens[key];
          const isExpanded = expandedKey === key;
          const isStd = key === standardKey;
          const fontToken = fontTokens[token.fontToken];
          const fontObj = fontToken ? ALL_FONTS.find((f) => f.id === fontToken.fontFamily) : null;
          const usageCount = usageCounts[key] || 0;

          const isActiveForSelection = activeTypoKeys.has(key);

          return (
            <div
              key={key}
              ref={(el) => { rowRefs.current[key] = el; }}
              onMouseEnter={(e) => !isExpanded && handleMouseEnterRow(key, e)}
              onMouseLeave={handleMouseLeaveRow}
              style={{
                margin: '0 4px 2px',
                borderRadius: '6px',
                border: isExpanded ? '1px solid #3b82f640' : isActiveForSelection ? '1px solid #4ade8060' : '1px solid transparent',
                backgroundColor: isExpanded ? 'var(--admin-bg-sidebar)' : isActiveForSelection ? '#4ade8010' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {/* Row */}
              <button
                onClick={() => setExpandedKey(isExpanded ? null : key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--admin-text)',
                  fontSize: '12px',
                  textAlign: 'left',
                  borderRadius: '6px',
                }}
                onMouseEnter={(e) => {
                  if (!isExpanded) e.currentTarget.style.backgroundColor = '#2d2d3d40';
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Preview - shows "Aa" with the token's font and size */}
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--admin-bg-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: token.fontWeight,
                    fontFamily: fontObj ? `"${fontObj.name}", ${fontObj.fallback}` : 'inherit',
                    color: 'var(--admin-text-icon)',
                    flexShrink: 0,
                    textTransform: (token.textTransform || 'none') as React.CSSProperties['textTransform'],
                  }}
                >
                  <Type size={14} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {token.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                    {fontToken?.label || token.fontToken || '–'} · {token.fontSize.desktop} · {FONT_WEIGHT_LABELS[token.fontWeight] || token.fontWeight}
                  </div>
                </div>
                {isStd && <Star size={12} fill="#fbbf24" style={{ color: '#fbbf24', flexShrink: 0 }} />}
                {isActiveForSelection && (
                  <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600, flexShrink: 0, fontFamily: 'sans-serif' }} title="Wird vom selektierten Element verwendet">
                    ●
                  </span>
                )}
                <span style={{ fontSize: '11px', color: usageCount > 0 ? '#4ade80' : 'var(--admin-text-muted)', flexShrink: 0 }}>
                  {usageCount}
                </span>
              </button>

              {/* Expanded editor */}
              {isExpanded && (
                <div style={{ padding: '0 10px 8px' }}>
                  <TypographyTokenEditor
                    tokenKey={key}
                    token={token}
                    isStandard={isStd}
                    usageCount={usageCount}
                    onClose={() => setExpandedKey(null)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Hover preview flyout */}
        {hoveredKey && hoverRect && typographyTokens[hoveredKey] && (
          <TokenPreviewFlyout
            token={typographyTokens[hoveredKey]}
            fontTokens={fontTokens}
            anchorRect={hoverRect}
          />
        )}
      </div>
    </div>
  );
};
