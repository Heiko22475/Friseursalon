// =====================================================
// VISUAL EDITOR – NAVBAR PROPERTIES
// Properties Panel for VENavbar elements.
// Allows editing of sticky mode and mobileFrom setting.
// =====================================================

import React from 'react';
import type { VENavbar, NavbarStickyMode } from '../types/elements';
import { useEditor } from '../state/EditorContext';

// ===== SHARED STYLES =====

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  backgroundColor: 'var(--admin-bg-input)',
  border: '1px solid var(--admin-border-strong)',
  borderRadius: '4px',
  color: 'var(--admin-text)',
  fontSize: '12px',
  cursor: 'pointer',
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '90px', flexShrink: 0, fontSize: '11px', color: 'var(--admin-text-icon)' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ===== COMPONENT =====

interface NavbarPropertiesProps {
  element: VENavbar;
}

export const NavbarProperties: React.FC<NavbarPropertiesProps> = ({ element }) => {
  const { dispatch } = useEditor();

  const updateNavbarProp = (key: string, value: any) => {
    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: { [key]: value } as any,
    });
  };

  const mobileFrom = element.mobileFrom ?? 'mobile';
  const children = element.children || [];
  const logoChild = children.length > 0 ? children[0] : null;
  const hamburgerChild = children.length > 1 ? children[children.length - 1] : null;

  return (
    <div>
      {/* Info */}
      <div style={{
        padding: '8px',
        backgroundColor: '#7c5cfc15',
        border: '1px solid #7c5cfc30',
        borderRadius: '6px',
        marginBottom: '12px',
        fontSize: '11px',
        color: '#a78bfa',
        lineHeight: 1.5,
      }}>
        💡 <strong>Aufbau:</strong> 1. Kind = Logo, letztes Kind = Hamburger, dazwischen = Menüpunkte.
        <br />
        Auf Desktop wird der Hamburger ausgeblendet.
        {mobileFrom === 'tablet'
          ? <> Ab <strong>Tablet</strong> erscheint das Hamburger-Menü.</>
          : <> Nur auf <strong>Handy</strong> erscheint das Hamburger-Menü.</>
        }
      </div>

      {/* Sticky Mode */}
      <Row label="Verhalten">
        <select
          value={element.stickyMode}
          onChange={(e) => updateNavbarProp('stickyMode', e.target.value as NavbarStickyMode)}
          style={selectStyle}
        >
          <option value="none">Normal (scrollt mit)</option>
          <option value="sticky">Sticky (haftet oben)</option>
          <option value="fixed">Fixed (immer oben)</option>
        </select>
      </Row>

      {/* Mobile From */}
      <Row label="Mobil ab">
        <select
          value={mobileFrom}
          onChange={(e) => updateNavbarProp('mobileFrom', e.target.value)}
          style={selectStyle}
        >
          <option value="tablet">Tablet + Handy</option>
          <option value="mobile">Nur Handy</option>
        </select>
      </Row>

      {/* Children info */}
      <div style={{
        marginTop: '8px',
        padding: '6px 8px',
        backgroundColor: 'var(--admin-bg-input)',
        borderRadius: '4px',
        fontSize: '11px',
        color: 'var(--admin-text-icon)',
        lineHeight: 1.6,
      }}>
        {children.length} Kind-Element(e)
        {logoChild && (
          <div>
            <span style={{ color: '#60a5fa' }}>🏷️ Logo:</span>{' '}
            „{logoChild.label || logoChild.type}"
          </div>
        )}
        {hamburgerChild && (
          <div>
            <span style={{ color: '#f59e0b' }}>☰ Hamburger:</span>{' '}
            „{hamburgerChild.label || hamburgerChild.type}"
          </div>
        )}
      </div>
    </div>
  );
};
