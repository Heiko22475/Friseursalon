// =====================================================
// VISUAL EDITOR – FOOTER PROPERTIES
// Properties Panel section for VEFooter elements
// Allows variant selection + config editing
// =====================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Type, Link as LinkIcon, Phone, Clock, FileText } from 'lucide-react';
import type { VEFooter } from '../types/elements';
import { useEditor } from '../state/EditorContext';
import {
  FooterConfig,
  FooterVariant,
  FooterColumn,
  FooterColumnType,
  FooterLinksColumn,
  FooterTextColumn,
  FooterContactColumn,
  FooterLegalLink,
  FooterLayout,
  FooterAlignment,
  SocialIconSize,
  SocialIconVariant,
  isMinimalFooter,
  isFourColumnFooter,
  createDefaultFooterMinimalConfig,
  createDefaultFooterFourColumnConfig,
  FooterFourColumnConfig,
} from '../../types/Footer';

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

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#6b7280',
  marginBottom: '4px',
  display: 'block',
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

interface FooterPropertiesProps {
  element: VEFooter;
}

export const FooterProperties: React.FC<FooterPropertiesProps> = ({ element }) => {
  const { dispatch } = useEditor();
  const config = element.config;

  const updateConfig = (newConfig: FooterConfig) => {
    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: { config: newConfig } as any,
    });
  };

  const handleVariantChange = (variant: FooterVariant) => {
    if (variant === 'minimal') {
      updateConfig(createDefaultFooterMinimalConfig());
    } else {
      updateConfig(createDefaultFooterFourColumnConfig());
    }
  };

  return (
    <div>
      {/* Variant Selector */}
      <Row label="Variante">
        <select
          value={config.variant}
          onChange={(e) => handleVariantChange(e.target.value as FooterVariant)}
          style={selectStyle}
        >
          <option value="minimal">Minimal</option>
          <option value="four-column">4-Spalten</option>
        </select>
      </Row>

      {/* Copyright */}
      <Collapsible title="Copyright" defaultOpen>
        <Row label="Text">
          <input
            type="text"
            value={config.copyright.text}
            onChange={(e) => updateConfig({ ...config, copyright: { ...config.copyright, text: e.target.value } })}
            style={inputStyle}
            placeholder="© {year} Salon Name"
          />
        </Row>
        <Toggle
          label="Jahr automatisch"
          checked={config.copyright.showYear}
          onChange={(v) => updateConfig({ ...config, copyright: { ...config.copyright, showYear: v } })}
        />
      </Collapsible>

      {/* Legal Links */}
      <Collapsible title="Rechtliche Links">
        <LegalLinksEditor
          links={config.legal.links}
          onChange={(links) => updateConfig({ ...config, legal: { ...config.legal, links } })}
        />
      </Collapsible>

      {/* Social Media */}
      <Collapsible title="Social Media">
        <Toggle
          label="Aktiviert"
          checked={config.socialMedia.enabled}
          onChange={(v) => updateConfig({ ...config, socialMedia: { ...config.socialMedia, enabled: v } })}
        />
        {config.socialMedia.enabled && (
          <>
            <Row label="Größe">
              <select
                value={config.socialMedia.size}
                onChange={(e) => updateConfig({ ...config, socialMedia: { ...config.socialMedia, size: e.target.value as SocialIconSize } })}
                style={selectStyle}
              >
                <option value="small">Klein</option>
                <option value="medium">Mittel</option>
                <option value="large">Groß</option>
              </select>
            </Row>
            <Row label="Stil">
              <select
                value={config.socialMedia.variant}
                onChange={(e) => updateConfig({ ...config, socialMedia: { ...config.socialMedia, variant: e.target.value as SocialIconVariant } })}
                style={selectStyle}
              >
                <option value="icons-only">Nur Icons</option>
                <option value="with-background">Mit Hintergrund</option>
                <option value="with-border">Mit Rahmen</option>
              </select>
            </Row>
          </>
        )}
      </Collapsible>

      {/* Minimal-specific: Layout & Alignment */}
      {isMinimalFooter(config) && (
        <Collapsible title="Layout">
          <Row label="Layout">
            <select
              value={config.layout}
              onChange={(e) => updateConfig({ ...config, layout: e.target.value as FooterLayout })}
              style={selectStyle}
            >
              <option value="single-line">Einzeilig</option>
              <option value="stacked">Gestapelt</option>
            </select>
          </Row>
          <Row label="Ausrichtung">
            <select
              value={config.alignment}
              onChange={(e) => updateConfig({ ...config, alignment: e.target.value as FooterAlignment })}
              style={selectStyle}
            >
              <option value="left">Links</option>
              <option value="center">Zentriert</option>
              <option value="space-between">Verteilt</option>
            </select>
          </Row>
        </Collapsible>
      )}

      {/* Four-column-specific: Columns */}
      {isFourColumnFooter(config) && (
        <Collapsible title="Spalten" defaultOpen>
          <ColumnsEditor
            config={config}
            onChange={(newConfig) => updateConfig(newConfig)}
          />
        </Collapsible>
      )}

      {/* Style */}
      <Collapsible title="Farben">
        <Row label="Hintergrund">
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="color"
              value={config.style.backgroundColor?.kind === 'custom' ? config.style.backgroundColor.hex : '#1f2937'}
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
              placeholder="Token oder Hex"
            />
          </div>
        </Row>
        <Row label="Text">
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="color"
              value={config.style.textColor?.kind === 'custom' ? config.style.textColor.hex : '#ffffff'}
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
              placeholder="Token oder Hex"
            />
          </div>
        </Row>
      </Collapsible>
    </div>
  );
};

// ===== LEGAL LINKS EDITOR =====

const LegalLinksEditor: React.FC<{
  links: FooterLegalLink[];
  onChange: (links: FooterLegalLink[]) => void;
}> = ({ links, onChange }) => {
  const addLink = () => {
    onChange([...links, { id: Date.now().toString(), label: 'Neuer Link', url: '/' }]);
  };

  const updateLink = (id: string, updates: Partial<FooterLegalLink>) => {
    onChange(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLink = (id: string) => {
    onChange(links.filter(l => l.id !== id));
  };

  return (
    <div>
      {links.map((link) => (
        <div key={link.id} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
          <input
            type="text"
            value={link.label}
            onChange={(e) => updateLink(link.id, { label: e.target.value })}
            placeholder="Label"
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="text"
            value={link.url}
            onChange={(e) => updateLink(link.id, { url: e.target.value })}
            placeholder="/seite"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={() => removeLink(link.id)} style={{ ...btnStyle, color: '#ef4444' }}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button onClick={addLink} style={{ ...btnStyle, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Plus size={12} /> Hinzufügen
      </button>
    </div>
  );
};

// ===== COLUMNS EDITOR (for four-column variant) =====

const ColumnsEditor: React.FC<{
  config: FooterFourColumnConfig;
  onChange: (config: FooterFourColumnConfig) => void;
}> = ({ config, onChange }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const updateColumn = (index: number, column: FooterColumn) => {
    const columns = [...config.columns];
    columns[index] = column;
    onChange({ ...config, columns });
  };

  const removeColumn = (index: number) => {
    const columns = config.columns.filter((_, i) => i !== index);
    onChange({ ...config, columns });
  };

  const addColumn = (type: FooterColumnType) => {
    const newCol: FooterColumn = {
      id: Date.now().toString(),
      title: '',
      type,
      ...(type === 'links' ? { links: [] } : {}),
      ...(type === 'text' ? { content: '' } : {}),
      ...(type === 'contact' ? { showAddress: true, showPhone: true, showEmail: true } : {}),
    } as FooterColumn;
    onChange({ ...config, columns: [...config.columns, newCol] });
    setShowAddMenu(false);
  };

  const columnTypeLabels: Record<FooterColumnType, string> = {
    text: 'Text',
    links: 'Links',
    contact: 'Kontakt',
    hours: 'Zeiten',
    custom: 'Custom',
  };

  const columnTypeIcons: Record<FooterColumnType, React.ReactNode> = {
    text: <Type size={10} />,
    links: <LinkIcon size={10} />,
    contact: <Phone size={10} />,
    hours: <Clock size={10} />,
    custom: <FileText size={10} />,
  };

  return (
    <div>
      {config.columns.map((col, i) => (
        <ColumnItem
          key={col.id}
          column={col}
          onUpdate={(c) => updateColumn(i, c)}
          onDelete={() => removeColumn(i)}
        />
      ))}

      {!showAddMenu ? (
        <button
          onClick={() => setShowAddMenu(true)}
          style={{ ...btnStyle, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center', marginTop: '4px' }}
        >
          <Plus size={12} /> Spalte hinzufügen
        </button>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {(['text', 'links', 'contact', 'hours', 'custom'] as FooterColumnType[]).map(type => (
            <button
              key={type}
              onClick={() => addColumn(type)}
              style={{ ...btnStyle, display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}
            >
              {columnTypeIcons[type]} {columnTypeLabels[type]}
            </button>
          ))}
          <button onClick={() => setShowAddMenu(false)} style={{ ...btnStyle, color: '#ef4444', fontSize: '10px' }}>✕</button>
        </div>
      )}
    </div>
  );
};

// ===== COLUMN ITEM =====

const ColumnItem: React.FC<{
  column: FooterColumn;
  onUpdate: (col: FooterColumn) => void;
  onDelete: () => void;
}> = ({ column, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ border: '1px solid #3d3d4d', borderRadius: '4px', marginBottom: '4px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 8px',
          backgroundColor: '#2d2d3d',
          cursor: 'pointer',
          fontSize: '11px',
          color: '#9ca3af',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span>{column.title || column.type}</span>
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ ...btnStyle, padding: '2px', color: '#ef4444', border: 'none', backgroundColor: 'transparent' }}>
            <Trash2 size={10} />
          </button>
          {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '8px' }}>
          <Row label="Titel">
            <input
              type="text"
              value={column.title}
              onChange={(e) => onUpdate({ ...column, title: e.target.value })}
              style={inputStyle}
              placeholder="Spaltenüberschrift"
            />
          </Row>

          {column.type === 'text' && (
            <>
              <label style={labelStyle}>Inhalt</label>
              <textarea
                value={(column as FooterTextColumn).content || ''}
                onChange={(e) => onUpdate({ ...column, content: e.target.value } as FooterTextColumn)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Freitext..."
              />
              <Toggle
                label="Logo anzeigen"
                checked={(column as FooterTextColumn).showLogo ?? false}
                onChange={(v) => onUpdate({ ...column, showLogo: v } as FooterTextColumn)}
              />
              <Toggle
                label="Social Media"
                checked={(column as FooterTextColumn).showSocialMedia ?? false}
                onChange={(v) => onUpdate({ ...column, showSocialMedia: v } as FooterTextColumn)}
              />
            </>
          )}

          {column.type === 'links' && (
            <ColumnLinksEditor
              links={(column as FooterLinksColumn).links}
              onChange={(links) => onUpdate({ ...column, links } as FooterLinksColumn)}
            />
          )}

          {column.type === 'contact' && (
            <>
              <Toggle label="Adresse" checked={(column as FooterContactColumn).showAddress} onChange={(v) => onUpdate({ ...column, showAddress: v } as FooterContactColumn)} />
              <Toggle label="Telefon" checked={(column as FooterContactColumn).showPhone} onChange={(v) => onUpdate({ ...column, showPhone: v } as FooterContactColumn)} />
              <Toggle label="E-Mail" checked={(column as FooterContactColumn).showEmail} onChange={(v) => onUpdate({ ...column, showEmail: v } as FooterContactColumn)} />
              <p style={{ fontSize: '10px', color: '#6b7280' }}>Daten aus Kontakt-Einstellungen.</p>
            </>
          )}

          {column.type === 'hours' && (
            <p style={{ fontSize: '10px', color: '#6b7280' }}>Zeiten aus Kontakt-Einstellungen.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ===== COLUMN LINKS EDITOR =====

const ColumnLinksEditor: React.FC<{
  links: { id: string; label: string; url: string }[];
  onChange: (links: { id: string; label: string; url: string }[]) => void;
}> = ({ links, onChange }) => {
  const addLink = () => {
    onChange([...links, { id: Date.now().toString(), label: 'Link', url: '/' }]);
  };

  return (
    <div>
      <label style={labelStyle}>Links</label>
      {links.map((link) => (
        <div key={link.id} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
          <input
            type="text"
            value={link.label}
            onChange={(e) => onChange(links.map(l => l.id === link.id ? { ...l, label: e.target.value } : l))}
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Label"
          />
          <input
            type="text"
            value={link.url}
            onChange={(e) => onChange(links.map(l => l.id === link.id ? { ...l, url: e.target.value } : l))}
            style={{ ...inputStyle, flex: 1 }}
            placeholder="/url"
          />
          <button onClick={() => onChange(links.filter(l => l.id !== link.id))} style={{ ...btnStyle, color: '#ef4444' }}>
            <Trash2 size={10} />
          </button>
        </div>
      ))}
      <button onClick={addLink} style={{ ...btnStyle, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}>
        <Plus size={10} /> Link
      </button>
    </div>
  );
};
