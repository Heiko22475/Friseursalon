// =====================================================
// VISUAL EDITOR – FONT TOKEN PANEL
// Manages FontTokens (Level 1 of the Typography Token System)
// CRUD operations: Create, Edit, Delete, Set Standard
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Star, ChevronDown, Search } from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import { ALL_FONTS } from '../../data/fonts';
import type { FontToken } from '../types/typographyTokens';
import {
  DEFAULT_FONT_TOKEN,
  getTypoTokensUsingFontToken,
  getStandardFontTokenKey,
} from '../types/typographyTokens';

// ===== FONT FAMILY DROPDOWN =====

const FontFamilyDropdown: React.FC<{
  value: string;
  onChange: (fontId: string) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = search
    ? ALL_FONTS.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : ALL_FONTS;

  const currentFont = ALL_FONTS.find((f) => f.id === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          backgroundColor: 'var(--admin-bg-sidebar)',
          border: '1px solid var(--admin-border)',
          borderRadius: '4px',
          color: 'var(--admin-text)',
          fontSize: '12px',
          cursor: 'pointer',
          fontFamily: currentFont ? `"${currentFont.name}", ${currentFont.fallback}` : 'inherit',
        }}
      >
        <span>{currentFont?.name || value || 'Font wählen…'}</span>
        <ChevronDown size={12} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '2px',
            backgroundColor: 'var(--admin-bg-card)',
            border: '1px solid #3d3d5d',
            borderRadius: '6px',
            maxHeight: '220px',
            overflowY: 'auto',
            zIndex: 200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ padding: '6px', borderBottom: '1px solid var(--admin-border)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={11} style={{ position: 'absolute', left: '6px', top: '6px', color: 'var(--admin-text-muted)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Suche…"
                autoFocus
                style={{
                  width: '100%',
                  padding: '4px 6px 4px 22px',
                  borderRadius: '3px',
                  border: '1px solid var(--admin-border)',
                  backgroundColor: 'var(--admin-bg-sidebar)',
                  color: 'var(--admin-text)',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
          {filtered.map((font) => (
            <button
              key={font.id}
              onClick={() => {
                onChange(font.id);
                setOpen(false);
                setSearch('');
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '6px 10px',
                background: font.id === value ? '#3b82f620' : 'none',
                border: 'none',
                cursor: 'pointer',
                color: font.id === value ? '#60a5fa' : 'var(--admin-text)',
                fontSize: '12px',
                fontFamily: `"${font.name}", ${font.fallback}`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--admin-border)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = font.id === value ? '#3b82f620' : 'transparent')}
            >
              {font.name}
              <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--admin-text-muted)', fontFamily: 'system-ui' }}>
                {font.category}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '11px' }}>
              Keine Treffer
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ===== FONT TOKEN EDITOR (inline expanded) =====

const FontTokenEditor: React.FC<{
  tokenKey: string;
  token: FontToken;
  isStandard: boolean;
  usageCount: number;
  onClose: () => void;
}> = ({ tokenKey, token, isStandard, usageCount, onClose }) => {
  const { state, dispatch } = useEditor();
  const [label, setLabel] = useState(token.label);
  const [description, setDescription] = useState(token.description || '');
  const [fontFamily, setFontFamily] = useState(token.fontFamily);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const standardKey = getStandardFontTokenKey(state.fontTokens);
  const otherKeys = Object.keys(state.fontTokens).filter((k) => k !== tokenKey);

  const save = () => {
    dispatch({
      type: 'SET_FONT_TOKEN',
      key: tokenKey,
      token: { ...token, label, description: description || undefined, fontFamily },
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    // Replace with standard, or the first other token
    const replaceWith = standardKey && standardKey !== tokenKey ? standardKey : otherKeys[0];
    if (!replaceWith) return; // Can't delete the last token
    dispatch({ type: 'DELETE_FONT_TOKEN', key: tokenKey, replaceWith });
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
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          style={inputStyle}
        />
      </div>

      {/* Font Family */}
      <div>
        <label style={fieldLabelStyle}>Schriftart</label>
        <FontFamilyDropdown
          value={fontFamily}
          onChange={(id) => {
            setFontFamily(id);
            dispatch({
              type: 'SET_FONT_TOKEN',
              key: tokenKey,
              token: { ...token, label, description: description || undefined, fontFamily: id },
            });
          }}
        />
      </div>

      {/* Description */}
      <div>
        <label style={fieldLabelStyle}>Beschreibung</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={save}
          placeholder="Optional…"
          style={inputStyle}
        />
      </div>

      {/* Standard toggle + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
        {!isStandard ? (
          <button
            onClick={() => dispatch({ type: 'SET_STANDARD_FONT_TOKEN', key: tokenKey })}
            title="Als Standard-Font setzen (Fallback bei Löschung)"
            style={{
              ...smallBtnStyle,
              color: '#fbbf24',
              border: '1px solid #fbbf2440',
            }}
          >
            <Star size={11} /> Standard
          </button>
        ) : (
          <span style={{ fontSize: '10px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={11} fill="#fbbf24" /> Standard-Font
          </span>
        )}
        <span style={{ flex: 1 }} />
        {otherKeys.length > 0 && (
          <button
            onClick={handleDelete}
            title={confirmDelete ? `Wirklich löschen? ${usageCount} Token werden umgeleitet` : 'Font Token löschen'}
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
        <div style={{ fontSize: '10px', color: 'var(--admin-text-muted)' }}>
          Wird von {usageCount} Typo-Token{usageCount !== 1 ? 's' : ''} verwendet
        </div>
      )}
    </div>
  );
};

// ===== FONT TOKEN PANEL =====

export const FontTokenPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { fontTokens, typographyTokens } = state;
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const tokenKeys = Object.keys(fontTokens);
  const standardKey = getStandardFontTokenKey(fontTokens);

  const handleCreate = () => {
    // Generate unique key
    let idx = tokenKeys.length + 1;
    let key = `font-${idx}`;
    while (fontTokens[key]) {
      key = `font-${++idx}`;
    }
    const isFirst = tokenKeys.length === 0;
    dispatch({
      type: 'SET_FONT_TOKEN',
      key,
      token: { ...DEFAULT_FONT_TOKEN, standard: isFirst ? true : undefined },
    });
    setExpandedKey(key);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '8px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px 8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-icon)', flex: 1 }}>
          Font Tokens ({tokenKeys.length})
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
          title="Neuen Font Token erstellen"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Token List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
        {tokenKeys.length === 0 && (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '12px' }}>
            Keine Font Tokens definiert.
            <br />
            Klicke + um einen zu erstellen.
          </div>
        )}

        {tokenKeys.map((key) => {
          const token = fontTokens[key];
          const isExpanded = expandedKey === key;
          const isStd = key === standardKey;
          const font = ALL_FONTS.find((f) => f.id === token.fontFamily);
          const usageCount = getTypoTokensUsingFontToken(typographyTokens, key).length;

          return (
            <div
              key={key}
              style={{
                margin: '0 4px 2px',
                borderRadius: '6px',
                border: isExpanded ? '1px solid #3b82f640' : '1px solid transparent',
                backgroundColor: isExpanded ? 'var(--admin-bg-sidebar)' : 'transparent',
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
                {/* Font preview letter */}
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--admin-bg-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: font ? `"${font.name}", ${font.fallback}` : 'inherit',
                    color: 'var(--admin-text-icon)',
                    flexShrink: 0,
                  }}
                >
                  Aa
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {token.label}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--admin-text-muted)', fontFamily: font ? `"${font.name}", ${font.fallback}` : 'inherit' }}>
                    {font?.name || token.fontFamily}
                  </div>
                </div>
                {isStd && <Star size={12} fill="#fbbf24" style={{ color: '#fbbf24', flexShrink: 0 }} />}
                <span style={{ fontSize: '10px', color: usageCount > 0 ? '#4ade80' : 'var(--admin-text-muted)', flexShrink: 0 }}>
                  {usageCount}
                </span>
              </button>

              {/* Expanded editor */}
              {isExpanded && (
                <div style={{ padding: '0 10px 8px' }}>
                  <FontTokenEditor
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
      </div>
    </div>
  );
};

// ===== SHARED STYLES =====

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
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
  fontSize: '10px',
  fontWeight: 600,
};
