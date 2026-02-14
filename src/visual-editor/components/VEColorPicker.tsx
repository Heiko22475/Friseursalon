// =====================================================
// VISUAL EDITOR – COLOR PICKER
// Farbwähler mit Theme-Integration (Palette + Custom)
// Webflow-Style: kompaktes Swatch + Popup
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { ColorValue } from '../../types/theme';
import { useVETheme } from '../theme/VEThemeBridge';

interface VEColorPickerProps {
  label: string;
  value: ColorValue | undefined | null;
  onChange: (value: ColorValue | null) => void;
  allowNoColor?: boolean;
}

export const VEColorPicker: React.FC<VEColorPickerProps> = ({
  label,
  value,
  onChange,
  allowNoColor = true,
}) => {
  const [open, setOpen] = useState(false);
  const [customHex, setCustomHex] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const { resolveColorValue, getThemeSwatches, hasTheme } = useVETheme();

  const displayColor = value ? resolveColorValue(value) : 'transparent';
  const swatches = hasTheme ? getThemeSwatches() : [];

  // Sync custom hex
  useEffect(() => {
    if (value?.kind === 'custom') {
      setCustomHex(value.hex);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Popup position
  const getPosition = () => {
    if (!triggerRef.current) return { top: 0, left: 0 };
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: Math.max(8, rect.left - 160),
    };
  };

  // Neutrals
  const neutrals = [
    { hex: '#ffffff', label: 'Weiß' },
    { hex: '#f3f4f6', label: 'Hellgrau' },
    { hex: '#b0b7c3', label: 'Grau' },
    { hex: '#374151', label: 'Dunkelgrau' },
    { hex: '#000000', label: 'Schwarz' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
      <label style={{ width: '80px', flexShrink: 0, fontSize: '12px', color: '#b0b7c3' }}>
        {label}
      </label>

      {/* Trigger: Swatch + Hex */}
      <div
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 6px',
          backgroundColor: '#2d2d3d',
          border: '1px solid #3d3d4d',
          borderRadius: '4px',
          cursor: 'pointer',
          minHeight: '28px',
        }}
      >
        {/* Swatch */}
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '3px',
            border: '1px solid #555',
            backgroundColor: displayColor,
            flexShrink: 0,
            backgroundImage:
              displayColor === 'transparent'
                ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                : undefined,
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          }}
        />
        <span
          style={{
            fontSize: '12px',
            color: '#d1d5db',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value?.kind === 'custom'
            ? value.hex
            : value?.kind === 'tokenRef'
              ? value.ref.split('.').pop()
              : 'Keine'}
        </span>
      </div>

      {/* Popup via Portal */}
      {open &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: 'fixed',
              ...getPosition(),
              zIndex: 10000,
              width: '240px',
              backgroundColor: '#1e1e2e',
              border: '1px solid #3d3d4d',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              padding: '12px',
              color: '#d1d5db',
              fontSize: '12px',
            }}
          >
            {/* No Color */}
            {allowNoColor && (
              <button
                onClick={() => { onChange(null); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  marginBottom: '8px',
                  backgroundColor: !value ? '#2563eb22' : '#2d2d3d',
                  border: !value ? '1px solid #3b82f6' : '1px solid #3d3d4d',
                  borderRadius: '4px',
                  color: '#b0b7c3',
                  cursor: 'pointer',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <X size={12} /> Keine Farbe
              </button>
            )}

            {/* Theme Colors */}
            {swatches.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  Theme-Farben
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {swatches.map((sw) => (
                    <button
                      key={sw.tokenRef}
                      title={`${sw.label} (${sw.hex})`}
                      onClick={() => {
                        onChange({ kind: 'custom', hex: sw.hex });
                        setOpen(false);
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: sw.hex,
                        border:
                          value?.kind === 'custom' && value.hex.toLowerCase() === sw.hex.toLowerCase()
                            ? '2px solid #3b82f6'
                            : '1px solid #555',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Neutral Colors */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', marginBottom: '6px', letterSpacing: '0.05em' }}>
                Neutral
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {neutrals.map((n) => (
                  <button
                    key={n.hex}
                    title={n.label}
                    onClick={() => {
                      onChange({ kind: 'custom', hex: n.hex });
                      setOpen(false);
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      backgroundColor: n.hex,
                      border:
                        value?.kind === 'custom' && value.hex.toLowerCase() === n.hex.toLowerCase()
                          ? '2px solid #3b82f6'
                          : '1px solid #555',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', marginBottom: '6px', letterSpacing: '0.05em' }}>
                Eigene Farbe
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={customHex || '#000000'}
                  onChange={(e) => {
                    setCustomHex(e.target.value);
                    onChange({ kind: 'custom', hex: e.target.value });
                  }}
                  style={{
                    width: '32px',
                    height: '28px',
                    padding: 0,
                    border: '1px solid #555',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                  }}
                />
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => {
                    const hex = e.target.value;
                    setCustomHex(hex);
                    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
                      onChange({ kind: 'custom', hex });
                    }
                  }}
                  placeholder="#000000"
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    backgroundColor: '#2d2d3d',
                    border: '1px solid #3d3d4d',
                    borderRadius: '4px',
                    color: '#d1d5db',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
