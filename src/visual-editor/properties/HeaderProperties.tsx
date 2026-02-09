// =====================================================
// VISUAL EDITOR – HEADER PROPERTIES
// Properties Panel section for VEHeader elements
// Allows variant selection + config editing
// =====================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { VEHeader } from '../types/elements';
import { useEditor } from '../state/EditorContext';
import {
  HeaderConfig,
  HeaderVariant,
  NavigationItem,
  NavItemType,
  ShadowSize,
  MobileMenuStyle,
  createDefaultHeaderClassicConfig,
  createDefaultHeaderCenteredConfig,
  createDefaultHeaderHamburgerConfig,
} from '../../types/Header';

// ===== SHARED STYLES =====

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  backgroundColor: '#2d2d3d',
  border: '1px solid #3d3d4d',
  borderRadius: '4px',
  color: '#d1d5db',
  fontSize: '12px',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const btnStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: '#2d2d3d',
  border: '1px solid #3d3d4d',
  borderRadius: '4px',
  color: '#d1d5db',
  fontSize: '11px',
  cursor: 'pointer',
};

// ===== ROW =====

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '70px', flexShrink: 0, fontSize: '11px', color: '#6b7280' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ===== TOGGLE =====

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{label}</span>
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: '32px',
        height: '18px',
        borderRadius: '9px',
        border: 'none',
        backgroundColor: checked ? '#3b82f6' : '#3d3d4d',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s',
      }}
    >
      <span style={{
        position: 'absolute',
        top: '2px',
        left: checked ? '16px' : '2px',
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        backgroundColor: 'white',
        transition: 'left 0.2s',
      }} />
    </button>
  </div>
);

// ===== COLLAPSIBLE =====

const Collapsible: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: '8px', border: '1px solid #3d3d4d', borderRadius: '4px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          backgroundColor: '#2d2d3d',
          border: 'none',
          color: '#9ca3af',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          borderRadius: open ? '4px 4px 0 0' : '4px',
        }}
      >
        {title}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && <div style={{ padding: '8px' }}>{children}</div>}
    </div>
  );
};

// ===== MAIN COMPONENT =====

interface HeaderPropertiesProps {
  element: VEHeader;
}

export const HeaderProperties: React.FC<HeaderPropertiesProps> = ({ element }) => {
  const { dispatch } = useEditor();
  const config = element.config;

  const updateConfig = (newConfig: HeaderConfig) => {
    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: { config: newConfig } as any,
    });
  };

  const handleVariantChange = (variant: HeaderVariant) => {
    // Preserve navigation and logo when switching variants
    const base = {
      logo: config.logo,
      navigation: config.navigation,
      cta: config.cta,
      socialMedia: config.socialMedia,
      sticky: config.sticky,
      transparent: config.transparent,
      mobile: config.mobile,
      style: config.style,
    };

    switch (variant) {
      case 'classic':
        updateConfig({ ...createDefaultHeaderClassicConfig(), ...base, variant: 'classic' });
        break;
      case 'centered':
        updateConfig({ ...createDefaultHeaderCenteredConfig(), ...base, variant: 'centered' });
        break;
      case 'hamburger':
        updateConfig({ ...createDefaultHeaderHamburgerConfig(), ...base, variant: 'hamburger' });
        break;
    }
  };

  return (
    <div>
      {/* Variant Selector */}
      <Row label="Variante">
        <select
          value={config.variant}
          onChange={(e) => handleVariantChange(e.target.value as HeaderVariant)}
          style={selectStyle}
        >
          <option value="classic">Klassisch</option>
          <option value="centered">Zentriert</option>
          <option value="hamburger">Hamburger</option>
        </select>
      </Row>

      {/* Logo */}
      <Collapsible title="Logo" defaultOpen>
        <Row label="Typ">
          <select
            value={config.logo.type}
            onChange={(e) => updateConfig({ ...config, logo: { ...config.logo, type: e.target.value as any } })}
            style={selectStyle}
          >
            <option value="text">Text</option>
            <option value="image">Bild</option>
          </select>
        </Row>
        {config.logo.type === 'text' && (
          <Row label="Text">
            <input
              type="text"
              value={config.logo.text || ''}
              onChange={(e) => updateConfig({ ...config, logo: { ...config.logo, text: e.target.value } })}
              style={inputStyle}
              placeholder="Salon Name"
            />
          </Row>
        )}
        {config.logo.type === 'image' && (
          <Row label="URL">
            <input
              type="text"
              value={config.logo.imageUrl || ''}
              onChange={(e) => updateConfig({ ...config, logo: { ...config.logo, imageUrl: e.target.value } })}
              style={inputStyle}
              placeholder="https://..."
            />
          </Row>
        )}
        <Row label="Max. Höhe">
          <input
            type="number"
            value={config.logo.maxHeight}
            onChange={(e) => updateConfig({ ...config, logo: { ...config.logo, maxHeight: parseInt(e.target.value) || 40 } })}
            style={{ ...inputStyle, width: '80px' }}
            min={20}
            max={100}
          />
        </Row>
      </Collapsible>

      {/* Navigation */}
      <Collapsible title="Navigation">
        <NavigationEditor
          items={config.navigation}
          onChange={(navigation) => updateConfig({ ...config, navigation })}
        />
      </Collapsible>

      {/* CTA Button */}
      <Collapsible title="CTA Button">
        <Toggle
          label="Aktiviert"
          checked={config.cta?.enabled ?? false}
          onChange={(v) => updateConfig({ ...config, cta: { ...(config.cta || { text: 'Termin buchen', action: { type: 'link', target: '#' }, style: { backgroundColor: { kind: 'custom', hex: '#3b82f6' }, textColor: { kind: 'custom', hex: '#ffffff' }, borderRadius: 'md', size: 'md' } }), enabled: v } })}
        />
        {config.cta?.enabled && (
          <>
            <Row label="Text">
              <input
                type="text"
                value={config.cta.text}
                onChange={(e) => updateConfig({ ...config, cta: { ...config.cta!, text: e.target.value } })}
                style={inputStyle}
              />
            </Row>
            <Row label="Ziel">
              <input
                type="text"
                value={config.cta.action.target}
                onChange={(e) => updateConfig({ ...config, cta: { ...config.cta!, action: { ...config.cta!.action, target: e.target.value } } })}
                style={inputStyle}
                placeholder="#contact"
              />
            </Row>
          </>
        )}
      </Collapsible>

      {/* Sticky */}
      <Collapsible title="Sticky Header">
        <Toggle
          label="Sticky"
          checked={config.sticky.enabled}
          onChange={(v) => updateConfig({ ...config, sticky: { ...config.sticky, enabled: v } })}
        />
        {config.sticky.enabled && (
          <Row label="Stil">
            <select
              value={config.sticky.style}
              onChange={(e) => updateConfig({ ...config, sticky: { ...config.sticky, style: e.target.value as any } })}
              style={selectStyle}
            >
              <option value="solid">Solid</option>
              <option value="blur">Blur</option>
            </select>
          </Row>
        )}
      </Collapsible>

      {/* Mobile */}
      <Collapsible title="Mobile">
        <Row label="Menüstil">
          <select
            value={config.mobile.menuStyle}
            onChange={(e) => updateConfig({ ...config, mobile: { ...config.mobile, menuStyle: e.target.value as MobileMenuStyle } })}
            style={selectStyle}
          >
            <option value="fullscreen">Vollbild</option>
            <option value="slide-right">Slide Rechts</option>
            <option value="slide-left">Slide Links</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </Row>
        <Toggle
          label="Logo zeigen"
          checked={config.mobile.showLogo}
          onChange={(v) => updateConfig({ ...config, mobile: { ...config.mobile, showLogo: v } })}
        />
        <Toggle
          label="CTA zeigen"
          checked={config.mobile.showCTA}
          onChange={(v) => updateConfig({ ...config, mobile: { ...config.mobile, showCTA: v } })}
        />
      </Collapsible>

      {/* Colors */}
      <Collapsible title="Farben">
        <Row label="Hintergrund">
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="color"
              value={config.style.backgroundColor?.kind === 'custom' ? config.style.backgroundColor.hex : '#ffffff'}
              onChange={(e) => updateConfig({
                ...config,
                style: { ...config.style, backgroundColor: { kind: 'custom', hex: e.target.value } }
              })}
              style={{ width: '28px', height: '28px', border: '1px solid #3d3d4d', borderRadius: '4px', cursor: 'pointer', padding: 0 }}
            />
            <input
              type="text"
              value={config.style.backgroundColor?.kind === 'custom' ? config.style.backgroundColor.hex : ''}
              onChange={(e) => updateConfig({
                ...config,
                style: { ...config.style, backgroundColor: { kind: 'custom', hex: e.target.value } }
              })}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Hex"
            />
          </div>
        </Row>
        <Row label="Text">
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="color"
              value={config.style.textColor?.kind === 'custom' ? config.style.textColor.hex : '#000000'}
              onChange={(e) => updateConfig({
                ...config,
                style: { ...config.style, textColor: { kind: 'custom', hex: e.target.value } }
              })}
              style={{ width: '28px', height: '28px', border: '1px solid #3d3d4d', borderRadius: '4px', cursor: 'pointer', padding: 0 }}
            />
            <input
              type="text"
              value={config.style.textColor?.kind === 'custom' ? config.style.textColor.hex : ''}
              onChange={(e) => updateConfig({
                ...config,
                style: { ...config.style, textColor: { kind: 'custom', hex: e.target.value } }
              })}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Hex"
            />
          </div>
        </Row>
        <Row label="Schatten">
          <select
            value={config.style.shadow}
            onChange={(e) => updateConfig({ ...config, style: { ...config.style, shadow: e.target.value as ShadowSize } })}
            style={selectStyle}
          >
            <option value="none">Keiner</option>
            <option value="small">Klein</option>
            <option value="medium">Mittel</option>
            <option value="large">Groß</option>
          </select>
        </Row>
      </Collapsible>
    </div>
  );
};

// ===== NAVIGATION EDITOR =====

const NavigationEditor: React.FC<{
  items: NavigationItem[];
  onChange: (items: NavigationItem[]) => void;
}> = ({ items, onChange }) => {
  const addItem = () => {
    onChange([...items, {
      id: Date.now().toString(),
      label: 'Neuer Link',
      type: 'link' as NavItemType,
      target: '/',
      visible: true,
    }]);
  };

  const updateItem = (id: string, updates: Partial<NavigationItem>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    onChange(newItems);
  };

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id} style={{ border: '1px solid #3d3d4d', borderRadius: '4px', padding: '6px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            <input
              type="text"
              value={item.label}
              onChange={(e) => updateItem(item.id, { label: e.target.value })}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Label"
            />
            <select
              value={item.type}
              onChange={(e) => updateItem(item.id, { type: e.target.value as NavItemType })}
              style={{ ...selectStyle, width: '80px' }}
            >
              <option value="link">Link</option>
              <option value="scroll">Scroll</option>
              <option value="page">Seite</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              type="text"
              value={item.target || ''}
              onChange={(e) => updateItem(item.id, { target: e.target.value })}
              style={{ ...inputStyle, flex: 1 }}
              placeholder={item.type === 'scroll' ? 'section-id' : '/url'}
            />
            <button onClick={() => moveItem(index, -1)} disabled={index === 0} style={{ ...btnStyle, padding: '2px', opacity: index === 0 ? 0.3 : 1 }}>
              <ChevronUp size={10} />
            </button>
            <button onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} style={{ ...btnStyle, padding: '2px', opacity: index === items.length - 1 ? 0.3 : 1 }}>
              <ChevronDown size={10} />
            </button>
            <Toggle
              label=""
              checked={item.visible}
              onChange={(v) => updateItem(item.id, { visible: v })}
            />
            <button onClick={() => removeItem(item.id)} style={{ ...btnStyle, padding: '2px', color: '#ef4444' }}>
              <Trash2 size={10} />
            </button>
          </div>
        </div>
      ))}
      <button onClick={addItem} style={{ ...btnStyle, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}>
        <Plus size={12} /> Menüpunkt
      </button>
    </div>
  );
};
