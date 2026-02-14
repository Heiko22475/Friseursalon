// =====================================================
// VISUAL EDITOR – NAVBAR PROPERTIES
// Properties Panel for VENavbar elements.
// Allows editing of sticky mode, mobile breakpoint,
// and preset switching.
// =====================================================

import React from 'react';
import type { VENavbar, NavbarStickyMode } from '../types/elements';
import { useEditor } from '../state/EditorContext';

// ===== SHARED STYLES =====

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  backgroundColor: '#2d2d3d',
  border: '1px solid #3d3d4d',
  borderRadius: '4px',
  color: '#d1d5db',
  fontSize: '12px',
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  backgroundColor: '#2d2d3d',
  border: '1px solid #3d3d4d',
  borderRadius: '4px',
  color: '#d1d5db',
  fontSize: '12px',
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '90px', flexShrink: 0, fontSize: '11px', color: '#b0b7c3' }}>{label}</label>
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
        💡 Die Navbar ist ein Kompositions-Element. Füge Logo, Links und Buttons als Kinder hinzu.
        Nutze <strong>Viewport-Sichtbarkeit</strong> an den Kind-Elementen um Desktop- und Mobile-Ansicht zu steuern.
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

      {/* Mobile Breakpoint */}
      <Row label="Mobile ab">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number"
            value={element.mobileBreakpoint}
            onChange={(e) => updateNavbarProp('mobileBreakpoint', parseInt(e.target.value) || 768)}
            min={320}
            max={1200}
            step={1}
            style={{ ...inputStyle, width: '80px' }}
          />
          <span style={{ fontSize: '11px', color: '#b0b7c3' }}>px</span>
        </div>
      </Row>

      {/* Children count */}
      <div style={{
        marginTop: '8px',
        padding: '6px 8px',
        backgroundColor: '#2d2d3d',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#b0b7c3',
      }}>
        {element.children?.length || 0} Kind-Element(e)
      </div>
    </div>
  );
};
