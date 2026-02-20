// =====================================================
// VISUAL EDITOR – ICON PICKER
// Centered popup modal with fixed search header + icon grid
// =====================================================

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

// ===== ICON REGISTRY =====

/** Build the icon list once from Lucide exports (filter out non-icon exports) */
const ALL_ICONS: { name: string; Component: React.ComponentType<any> }[] = (() => {
  const icons = LucideIcons as any;
  const excluded = new Set([
    'createLucideIcon', 'default', 'icons', 'Icon',
    'createElement', 'LucideIcon',
  ]);
  return Object.keys(icons)
    .filter(key => {
      if (excluded.has(key)) return false;
      if (!/^[A-Z]/.test(key)) return false;
      const val = icons[key];
      return typeof val === 'object' || typeof val === 'function';
    })
    .sort()
    .map(name => ({ name, Component: icons[name] }));
})();

// ===== COMPONENT =====

interface VEIconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

/** Popup dimensions */
const POPUP_WIDTH = 950;
const POPUP_HEIGHT = 600;

export const VEIconPicker: React.FC<VEIconPickerProps> = ({ value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { theme } = useAdminTheme();

  // Filter icons
  const filtered = useMemo(() => {
    if (!searchTerm) return ALL_ICONS;
    const lower = searchTerm.toLowerCase();
    return ALL_ICONS.filter(i => i.name.toLowerCase().includes(lower));
  }, [searchTerm]);

  // Auto-focus search field when popup opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!popupRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleSelect = useCallback((name: string) => {
    onChange(name);
    setIsOpen(false);
    setSearchTerm('');
  }, [onChange]);

  // Resolve current icon for preview
  const CurrentIcon = value ? ((LucideIcons as any)[value] || null) : null;

  return (
    <div style={{ marginBottom: '8px' }}>
      {/* Label row with current icon preview */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <label style={{ fontSize: '11px', color: 'var(--admin-text-icon)', fontWeight: 500 }}>Icon</label>
        {CurrentIcon && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CurrentIcon size={14} color="#d1d5db" strokeWidth={2} />
            <span style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>{value}</span>
          </div>
        )}
      </div>

      {/* Trigger button – opens the popup */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          width: '100%',
          padding: '6px 8px 6px 28px',
          backgroundColor: 'var(--admin-bg-input)',
          border: '1px solid var(--admin-border-strong)',
          borderRadius: '4px',
          color: 'var(--admin-text)',
          fontSize: '12px',
          fontFamily: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', pointerEvents: 'none' }} />
        {value || 'Icon wählen…'}
      </button>

      {/* Popup – centered modal via portal */}
      {isOpen && createPortal(
        <div className={`admin-theme-${theme}`} style={{ display: 'contents' }}>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              zIndex: 9999,
            }}
          />

          {/* Popup */}
          <div
            ref={popupRef}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: POPUP_WIDTH,
              height: POPUP_HEIGHT,
              maxWidth: 'calc(100vw - 40px)',
              maxHeight: 'calc(100vh - 40px)',
              backgroundColor: 'var(--admin-bg-surface)',
              border: '1px solid var(--admin-border-strong)',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* ── Fixed Header ─────────────── */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--admin-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexShrink: 0,
              }}
            >
              {/* Left: Search field */}
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', pointerEvents: 'none' }} />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Icon suchen…"
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 36px 0 36px',
                    backgroundColor: 'var(--admin-bg-input)',
                    border: '1px solid #3b82f6',
                    borderRadius: '6px',
                    color: 'var(--admin-text)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(''); searchRef.current?.focus(); }}
                    style={{
                      position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer',
                      padding: '2px', display: 'flex',
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Right: Icon preview + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                {CurrentIcon ? (
                  <>
                    <span style={{ fontSize: '14px', color: 'var(--admin-text-icon)', fontWeight: 500 }}>{value}</span>
                    <CurrentIcon size={50} color="#d1d5db" strokeWidth={1.5} />
                  </>
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--admin-text-muted)', fontStyle: 'italic' }}>Kein Icon gewählt</span>
                )}
              </div>
            </div>

            {/* ── Scrollable Icon Grid ─────────────── */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '12px 16px',
              }}
              className="ve-props-scroll"
            >
              {filtered.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '14px' }}>
                  Kein Icon gefunden
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: '4px',
                  }}
                >
                  {filtered.map(({ name, Component }) => (
                    <button
                      key={name}
                      onClick={() => handleSelect(name)}
                      title={name}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '8px 4px',
                        backgroundColor: value === name ? '#3b82f620' : 'transparent',
                        border: `1px solid ${value === name ? '#3b82f6' : 'transparent'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: value === name ? '#3b82f6' : 'var(--admin-text-icon)',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        if (value !== name) e.currentTarget.style.backgroundColor = 'var(--admin-border)';
                      }}
                      onMouseLeave={(e) => {
                        if (value !== name) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Component size={30} strokeWidth={1.75} />
                      <span style={{
                        fontSize: '10px',
                        lineHeight: '13px',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        width: '100%',
                      }}>
                        {name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Footer ─────────────── */}
            <div style={{
              padding: '8px 20px',
              fontSize: '11px',
              color: 'var(--admin-text-muted)',
              textAlign: 'right',
              borderTop: '1px solid var(--admin-border)',
              flexShrink: 0,
            }}>
              {filtered.length} von {ALL_ICONS.length} Icons
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
