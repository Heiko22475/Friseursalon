// =====================================================
// FOOTER EDITOR
// Admin-Editor for footer configuration
// =====================================================

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  Palette,
  Layout,
  Type,
  Link as LinkIcon,
  Phone,
  Clock,
  FileText,
  Eye,
  Save,
} from 'lucide-react';
import {
  FooterConfig,
  FooterFourColumnConfig,
  FooterVariant,
  FooterColumn,
  FooterLinksColumn,
  FooterTextColumn,
  FooterContactColumn,
  FooterHoursColumn,
  FooterColumnType,
  FooterLegalLink,
  FooterLayout,
  FooterAlignment,
  SocialIconSize,
  SocialIconVariant,
  isMinimalFooter,
  isFourColumnFooter,
  createDefaultFooterMinimalConfig,
  createDefaultFooterFourColumnConfig,
} from '../../types/Footer';
import { ColorValue } from '../../types/theme';
import { useWebsite } from '../../contexts/WebsiteContext';
import { FooterBlock } from '../blocks/FooterBlock';
import { AdminHeader } from './AdminHeader';

// =====================================================
// SHARED UI COMPONENTS
// =====================================================

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--admin-border)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between transition"
        style={{ backgroundColor: 'var(--admin-bg-surface)' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg-surface)'}
      >
        <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--admin-text-secondary)' }}>
          {icon}
          {title}
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
};

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  helpText?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options, helpText }) => (
  <div>
    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg admin-focus"
      style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {helpText && <p className="mt-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>{helpText}</p>}
  </div>
);

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
}

const TextField: React.FC<TextFieldProps> = ({ label, value, onChange, placeholder, helpText }) => (
  <div>
    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border rounded-lg admin-focus"
      style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
    />
    {helpText && <p className="mt-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>{helpText}</p>}
  </div>
);

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ label, checked, onChange, helpText }) => (
  <div className="flex items-center justify-between">
    <div>
      <span className="text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>{label}</span>
      {helpText && <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{helpText}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition"
      style={{ backgroundColor: checked ? 'var(--admin-accent)' : 'var(--admin-border-strong)' }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

interface ColorFieldProps {
  label: string;
  value: ColorValue;
  onChange: (value: ColorValue) => void;
}

const ColorField: React.FC<ColorFieldProps> = ({ label, value, onChange }) => {
  const hexValue = value.kind === 'custom' ? value.hex || '#000000' : '#000000';

  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={hexValue}
          onChange={(e) => onChange({ kind: 'custom', hex: e.target.value })}
          className="w-10 h-10 rounded border cursor-pointer"
          style={{ borderColor: 'var(--admin-border-strong)' }}
        />
        <input
          type="text"
          value={hexValue}
          onChange={(e) => onChange({ kind: 'custom', hex: e.target.value })}
          className="flex-1 px-3 py-2 border rounded-lg admin-focus"
          style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
        />
      </div>
    </div>
  );
};

// =====================================================
// LEGAL LINKS EDITOR
// =====================================================

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

  const moveLink = (index: number, direction: -1 | 1) => {
    const newLinks = [...links];
    const target = index + direction;
    if (target < 0 || target >= newLinks.length) return;
    [newLinks[index], newLinks[target]] = [newLinks[target], newLinks[index]];
    onChange(newLinks);
  };

  return (
    <div className="space-y-2">
      {links.map((link, index) => (
        <div
          key={link.id}
          className="flex items-center gap-2 p-2 border rounded-lg"
          style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg-card)' }}
        >
          <GripVertical size={14} className="flex-shrink-0" style={{ color: 'var(--admin-text-muted)' }} />
          <input
            type="text"
            value={link.label}
            onChange={(e) => updateLink(link.id, { label: e.target.value })}
            placeholder="Bezeichnung"
            className="flex-1 px-2 py-1 border rounded text-sm admin-focus"
            style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
          />
          <input
            type="text"
            value={link.url}
            onChange={(e) => updateLink(link.id, { url: e.target.value })}
            placeholder="/impressum"
            className="flex-1 px-2 py-1 border rounded text-sm admin-focus"
            style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
          />
          <div className="flex items-center gap-1">
            <button
              onClick={() => moveLink(index, -1)}
              disabled={index === 0}
              className="p-1 rounded disabled:opacity-30 admin-hover-bg"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={() => moveLink(index, 1)}
              disabled={index === links.length - 1}
              className="p-1 rounded disabled:opacity-30 admin-hover-bg"
            >
              <ChevronDown size={14} />
            </button>
            <button
              onClick={() => removeLink(link.id)}
              className="p-1 hover:bg-red-100 text-red-500 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={addLink}
        className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg transition admin-hover-bg"
        style={{ color: 'var(--admin-accent)' }}
      >
        <Plus size={14} /> Link hinzufügen
      </button>
    </div>
  );
};

// =====================================================
// COLUMN EDITOR (for four-column variant)
// =====================================================

const ColumnEditor: React.FC<{
  column: FooterColumn;
  onUpdate: (column: FooterColumn) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({ column, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const columnTypeLabels: Record<FooterColumnType, string> = {
    text: 'Text / Über uns',
    links: 'Links',
    contact: 'Kontaktdaten',
    hours: 'Öffnungszeiten',
    custom: 'Benutzerdefiniert',
  };

  const columnTypeIcons: Record<FooterColumnType, React.ReactNode> = {
    text: <Type size={14} />,
    links: <LinkIcon size={14} />,
    contact: <Phone size={14} />,
    hours: <Clock size={14} />,
    custom: <FileText size={14} />,
  };

  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg-card)' }}>
      {/* Column header row */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
        <GripVertical size={16} className="cursor-move" style={{ color: 'var(--admin-text-muted)' }} />

        <div className="flex items-center gap-1.5" style={{ color: 'var(--admin-text-muted)' }}>
          {columnTypeIcons[column.type]}
        </div>

        <span className="flex-1 font-medium text-sm">
          {column.title || columnTypeLabels[column.type]}
        </span>

        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--admin-bg-hover)', color: 'var(--admin-text-muted)' }}>
          {columnTypeLabels[column.type]}
        </span>

        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={isFirst} className="p-1 rounded disabled:opacity-30 admin-hover-bg"><ChevronUp size={16} /></button>
          <button onClick={onMoveDown} disabled={isLast} className="p-1 rounded disabled:opacity-30 admin-hover-bg"><ChevronDown size={16} /></button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded admin-hover-bg">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-red-100 text-red-500 rounded"><Trash2 size={16} /></button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-3 space-y-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <TextField
            label="Titel"
            value={column.title}
            onChange={(title) => onUpdate({ ...column, title })}
            placeholder="Spaltenüberschrift"
          />

          {/* Type-specific fields */}
          {column.type === 'text' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>Inhalt (HTML)</label>
                <textarea
                  value={(column as FooterTextColumn).content}
                  onChange={(e) => onUpdate({ ...column, content: e.target.value } as FooterTextColumn)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg admin-focus text-sm"
                  style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
                  placeholder="<p>Beschreibungstext...</p>"
                />
              </div>
              <ToggleField
                label="Logo anzeigen"
                checked={(column as FooterTextColumn).showLogo ?? false}
                onChange={(showLogo) => onUpdate({ ...column, showLogo } as FooterTextColumn)}
              />
              <ToggleField
                label="Social Media anzeigen"
                checked={(column as FooterTextColumn).showSocialMedia ?? false}
                onChange={(showSocialMedia) => onUpdate({ ...column, showSocialMedia } as FooterTextColumn)}
              />
            </>
          )}

          {column.type === 'links' && (
            <LinksColumnEditor
              links={(column as FooterLinksColumn).links}
              onChange={(links) => onUpdate({ ...column, links } as FooterLinksColumn)}
            />
          )}

          {column.type === 'contact' && (
            <>
              <ToggleField
                label="Adresse anzeigen"
                checked={(column as FooterContactColumn).showAddress}
                onChange={(showAddress) => onUpdate({ ...column, showAddress } as FooterContactColumn)}
              />
              <ToggleField
                label="Telefon anzeigen"
                checked={(column as FooterContactColumn).showPhone}
                onChange={(showPhone) => onUpdate({ ...column, showPhone } as FooterContactColumn)}
              />
              <ToggleField
                label="E-Mail anzeigen"
                checked={(column as FooterContactColumn).showEmail}
                onChange={(showEmail) => onUpdate({ ...column, showEmail } as FooterContactColumn)}
              />
              <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                Die Daten werden automatisch aus den Kontakt-Einstellungen übernommen.
              </p>
            </>
          )}

          {column.type === 'hours' && (
            <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
              Die Öffnungszeiten werden automatisch aus den Kontakt-Einstellungen übernommen.
            </p>
          )}

          {column.type === 'custom' && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>HTML</label>
              <textarea
                value={(column as any).html || ''}
                onChange={(e) => onUpdate({ ...column, html: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg admin-focus text-sm font-mono"
                style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
                placeholder="<div>...</div>"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =====================================================
// LINKS COLUMN EDITOR (sub-editor for links in a column)
// =====================================================

const LinksColumnEditor: React.FC<{
  links: { id: string; label: string; url: string }[];
  onChange: (links: { id: string; label: string; url: string }[]) => void;
}> = ({ links, onChange }) => {
  const addLink = () => {
    onChange([...links, { id: Date.now().toString(), label: 'Neuer Link', url: '/' }]);
  };

  const updateLink = (id: string, updates: Partial<{ label: string; url: string }>) => {
    onChange(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLink = (id: string) => {
    onChange(links.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Links</label>
      {links.map((link) => (
        <div
          key={link.id}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={link.label}
            onChange={(e) => updateLink(link.id, { label: e.target.value })}
            placeholder="Bezeichnung"
            className="flex-1 px-2 py-1.5 border rounded text-sm admin-focus"
            style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
          />
          <input
            type="text"
            value={link.url}
            onChange={(e) => updateLink(link.id, { url: e.target.value })}
            placeholder="/seite"
            className="flex-1 px-2 py-1.5 border rounded text-sm admin-focus"
            style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
          />
          <button
            onClick={() => removeLink(link.id)}
            className="p-1 hover:bg-red-100 text-red-500 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={addLink}
        className="flex items-center gap-1 text-sm px-2 py-1 rounded transition admin-hover-bg"
        style={{ color: 'var(--admin-accent)' }}
      >
        <Plus size={14} /> Link hinzufügen
      </button>
    </div>
  );
};

// =====================================================
// ADD COLUMN DIALOG
// =====================================================

const AddColumnDialog: React.FC<{
  onAdd: (type: FooterColumnType) => void;
  onCancel: () => void;
}> = ({ onAdd, onCancel }) => {
  const columnTypes: { type: FooterColumnType; label: string; description: string; icon: React.ReactNode }[] = [
    { type: 'text', label: 'Text / Über uns', description: 'Freitext mit optionalem Logo', icon: <Type size={20} /> },
    { type: 'links', label: 'Schnelllinks', description: 'Liste von Links zu Seiten', icon: <LinkIcon size={20} /> },
    { type: 'contact', label: 'Kontaktdaten', description: 'Adresse, Telefon, E-Mail', icon: <Phone size={20} /> },
    { type: 'hours', label: 'Öffnungszeiten', description: 'Automatisch aus Einstellungen', icon: <Clock size={20} /> },
    { type: 'custom', label: 'Benutzerdefiniert', description: 'Eigenes HTML', icon: <FileText size={20} /> },
  ];

  return (
    <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: 'var(--admin-accent)', backgroundColor: 'var(--admin-bg-surface)' }}>
      <h4 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>Spaltentyp wählen</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {columnTypes.map(({ type, label, description, icon }) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className="flex items-start gap-3 p-3 border rounded-lg text-left transition admin-hover-bg"
            style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg-card)' }}
          >
            <div className="mt-0.5" style={{ color: 'var(--admin-accent)' }}>{icon}</div>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>{label}</div>
              <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{description}</div>
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={onCancel}
        className="text-sm px-3 py-1 rounded admin-hover-bg"
        style={{ color: 'var(--admin-text-muted)' }}
      >
        Abbrechen
      </button>
    </div>
  );
};

// =====================================================
// MAIN FOOTER EDITOR PAGE
// =====================================================

export const FooterEditorPage: React.FC = () => {
  const { website, updateWebsite } = useWebsite();
  const [config, setConfig] = useState<FooterConfig>(createDefaultFooterFourColumnConfig());
  const [showPreview, setShowPreview] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load footer config from website JSON
  useEffect(() => {
    if (website) {
      const footerConfig = (website as any).footer as FooterConfig | undefined;
      if (footerConfig) {
        setConfig(footerConfig);
      }
    }
  }, [website]);

  // Track changes
  const updateConfig = (updates: Partial<FooterConfig>) => {
    setConfig(prev => ({ ...prev, ...updates } as FooterConfig));
    setHasChanges(true);
  };

  // Save to website JSON
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateWebsite({ footer: config } as any);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving footer:', error);
    } finally {
      setSaving(false);
    }
  };

  // Switch variant
  const switchVariant = (variant: FooterVariant) => {
    if (variant === config.variant) return;

    // Preserve shared config when switching
    const shared = {
      logo: config.logo,
      socialMedia: config.socialMedia,
      copyright: config.copyright,
      legal: config.legal,
      style: config.style,
    };

    if (variant === 'minimal') {
      setConfig({
        ...createDefaultFooterMinimalConfig(),
        ...shared,
        variant: 'minimal',
      });
    } else {
      setConfig({
        ...createDefaultFooterFourColumnConfig(),
        ...shared,
        variant: 'four-column',
      });
    }
    setHasChanges(true);
  };

  // Add column (four-column variant only)
  const addColumn = (type: FooterColumnType) => {
    if (!isFourColumnFooter(config)) return;

    const id = `col-${Date.now()}`;
    let newColumn: FooterColumn;

    switch (type) {
      case 'text':
        newColumn = { id, title: '', type: 'text', content: '<p>Beschreibung...</p>', showLogo: false, showSocialMedia: false } as FooterTextColumn;
        break;
      case 'links':
        newColumn = { id, title: 'Links', type: 'links', links: [{ id: '1', label: 'Beispiel', url: '/' }] } as FooterLinksColumn;
        break;
      case 'contact':
        newColumn = { id, title: 'Kontakt', type: 'contact', showAddress: true, showPhone: true, showEmail: true } as FooterContactColumn;
        break;
      case 'hours':
        newColumn = { id, title: 'Öffnungszeiten', type: 'hours' } as FooterHoursColumn;
        break;
      default:
        newColumn = { id, title: 'Benutzerdefiniert', type: 'custom', html: '' } as any;
    }

    updateConfig({
      columns: [...config.columns, newColumn],
    } as Partial<FooterFourColumnConfig>);
    setShowAddColumn(false);
  };

  // Update column
  const updateColumn = (index: number, column: FooterColumn) => {
    if (!isFourColumnFooter(config)) return;
    const newColumns = [...config.columns];
    newColumns[index] = column;
    updateConfig({ columns: newColumns } as Partial<FooterFourColumnConfig>);
  };

  // Delete column
  const deleteColumn = (index: number) => {
    if (!isFourColumnFooter(config)) return;
    const newColumns = config.columns.filter((_, i) => i !== index);
    updateConfig({ columns: newColumns } as Partial<FooterFourColumnConfig>);
  };

  // Move column
  const moveColumn = (index: number, direction: -1 | 1) => {
    if (!isFourColumnFooter(config)) return;
    const target = index + direction;
    if (target < 0 || target >= config.columns.length) return;
    const newColumns = [...config.columns];
    [newColumns[index], newColumns[target]] = [newColumns[target], newColumns[index]];
    updateConfig({ columns: newColumns } as Partial<FooterFourColumnConfig>);
  };

  // Variant selector cards
  const variantOptions: { value: FooterVariant; label: string; description: string }[] = [
    { value: 'minimal', label: 'Minimal', description: 'Kompakt mit Copyright und Links' },
    { value: 'four-column', label: '4-Spalten', description: 'Umfangreicher Footer mit Spalten' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', minHeight: '100vh' }}>
      <AdminHeader
        title="Footer bearbeiten"
        backTo="/admin"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition admin-hover-bg"
              style={{ borderColor: 'var(--admin-border-strong)', color: 'var(--admin-text-secondary)' }}
            >
              <Eye size={16} />
              {showPreview ? 'Editor' : 'Vorschau'}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition disabled:opacity-50"
              style={{ backgroundColor: 'var(--admin-accent)' }}
            >
              <Save size={16} />
              {saving ? 'Speichert...' : 'Speichern'}
            </button>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Preview */}
        {showPreview && (
          <Section title="Vorschau" icon={<Eye size={18} />} defaultOpen={true}>
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--admin-border)' }}>
              <FooterBlock config={config} isPreview />
            </div>
          </Section>
        )}

        {/* Variant Selector */}
        <Section title="Variante" icon={<Layout size={18} />} defaultOpen={true}>
          <div className="grid grid-cols-2 gap-3">
            {variantOptions.map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => switchVariant(value)}
                className="p-4 border-2 rounded-lg text-left transition"
                style={{
                  borderColor: config.variant === value ? 'var(--admin-accent)' : 'var(--admin-border)',
                  backgroundColor: config.variant === value ? 'var(--admin-bg-surface)' : 'var(--admin-bg-card)',
                }}
              >
                <div className="font-medium text-sm" style={{ color: 'var(--admin-text)' }}>{label}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>{description}</div>
                {config.variant === value && (
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--admin-accent)' }} />
                )}
              </button>
            ))}
          </div>

          {/* Minimal-specific options */}
          {isMinimalFooter(config) && (
            <div className="mt-4 space-y-3">
              <SelectField
                label="Layout"
                value={config.layout}
                onChange={(v) => updateConfig({ layout: v as FooterLayout })}
                options={[
                  { value: 'single-line', label: 'Einzeilig' },
                  { value: 'stacked', label: 'Gestapelt' },
                ]}
              />
              <SelectField
                label="Ausrichtung"
                value={config.alignment}
                onChange={(v) => updateConfig({ alignment: v as FooterAlignment })}
                options={[
                  { value: 'left', label: 'Links' },
                  { value: 'center', label: 'Zentriert' },
                  { value: 'space-between', label: 'Gleichmäßig verteilt' },
                ]}
              />
            </div>
          )}

          {/* Four-column grid settings */}
          {isFourColumnFooter(config) && (
            <div className="mt-4">
              <SelectField
                label="Spalten (Desktop)"
                value={config.columnLayout.desktop.toString()}
                onChange={(v) => updateConfig({
                  columnLayout: { ...config.columnLayout, desktop: parseInt(v) },
                } as Partial<FooterFourColumnConfig>)}
                options={[
                  { value: '2', label: '2 Spalten' },
                  { value: '3', label: '3 Spalten' },
                  { value: '4', label: '4 Spalten' },
                ]}
              />
            </div>
          )}
        </Section>

        {/* Columns Editor (four-column variant) */}
        {isFourColumnFooter(config) && (
          <Section title="Spalten" icon={<Layout size={18} />} defaultOpen={true}>
            <div className="space-y-3">
              {config.columns.map((column, index) => (
                <ColumnEditor
                  key={column.id}
                  column={column}
                  onUpdate={(updated) => updateColumn(index, updated)}
                  onDelete={() => deleteColumn(index)}
                  onMoveUp={() => moveColumn(index, -1)}
                  onMoveDown={() => moveColumn(index, 1)}
                  isFirst={index === 0}
                  isLast={index === config.columns.length - 1}
                />
              ))}

              {showAddColumn ? (
                <AddColumnDialog
                  onAdd={addColumn}
                  onCancel={() => setShowAddColumn(false)}
                />
              ) : (
                <button
                  onClick={() => setShowAddColumn(true)}
                  className="flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg text-sm transition admin-hover-bg"
                  style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}
                >
                  <Plus size={18} /> Spalte hinzufügen
                </button>
              )}
            </div>
          </Section>
        )}

        {/* Logo */}
        <Section title="Logo" icon={<Type size={18} />}>
          <ToggleField
            label="Logo anzeigen"
            checked={config.logo.enabled}
            onChange={(enabled) => updateConfig({ logo: { ...config.logo, enabled } })}
          />
          {config.logo.enabled && (
            <>
              <SelectField
                label="Typ"
                value={config.logo.type}
                onChange={(type) => updateConfig({ logo: { ...config.logo, type: type as 'image' | 'text' | 'logo-designer' } })}
                options={[
                  { value: 'text', label: 'Text' },
                  { value: 'image', label: 'Bild' },
                  { value: 'logo-designer', label: 'Logo-Designer' },
                ]}
              />
              {config.logo.type === 'text' && (
                <TextField
                  label="Text"
                  value={config.logo.text || ''}
                  onChange={(text) => updateConfig({ logo: { ...config.logo, text } })}
                  placeholder="Salon Name"
                />
              )}
              {config.logo.type === 'image' && (
                <TextField
                  label="Bild-URL"
                  value={config.logo.imageUrl || ''}
                  onChange={(imageUrl) => updateConfig({ logo: { ...config.logo, imageUrl } })}
                  placeholder="https://..."
                  helpText="Später: Bild aus Mediathek wählen"
                />
              )}
            </>
          )}
        </Section>

        {/* Copyright */}
        <Section title="Copyright" icon={<FileText size={18} />}>
          <TextField
            label="Text"
            value={config.copyright.text}
            onChange={(text) => updateConfig({ copyright: { ...config.copyright, text } })}
            placeholder="© {year} Salon Name"
            helpText="Verwende {year} als Platzhalter für das aktuelle Jahr"
          />
          <ToggleField
            label="Jahr automatisch aktualisieren"
            checked={config.copyright.showYear}
            onChange={(showYear) => updateConfig({ copyright: { ...config.copyright, showYear } })}
          />
        </Section>

        {/* Legal Links */}
        <Section title="Rechtliche Links" icon={<LinkIcon size={18} />}>
          <LegalLinksEditor
            links={config.legal.links}
            onChange={(links) => updateConfig({ legal: { ...config.legal, links } })}
          />
        </Section>

        {/* Social Media */}
        <Section title="Social Media" icon={<Layout size={18} />}>
          <ToggleField
            label="Social-Media-Icons anzeigen"
            checked={config.socialMedia.enabled}
            onChange={(enabled) => updateConfig({ socialMedia: { ...config.socialMedia, enabled } })}
            helpText="Die Links werden automatisch aus den Kontakt-Einstellungen übernommen"
          />
          {config.socialMedia.enabled && (
            <>
              <SelectField
                label="Größe"
                value={config.socialMedia.size}
                onChange={(size) => updateConfig({ socialMedia: { ...config.socialMedia, size: size as SocialIconSize } })}
                options={[
                  { value: 'small', label: 'Klein' },
                  { value: 'medium', label: 'Mittel' },
                  { value: 'large', label: 'Groß' },
                ]}
              />
              <SelectField
                label="Stil"
                value={config.socialMedia.variant}
                onChange={(variant) => updateConfig({ socialMedia: { ...config.socialMedia, variant: variant as SocialIconVariant } })}
                options={[
                  { value: 'icons-only', label: 'Nur Icons' },
                  { value: 'with-background', label: 'Mit Hintergrund' },
                  { value: 'with-border', label: 'Mit Rahmen' },
                ]}
              />
            </>
          )}
        </Section>

        {/* Style / Colors */}
        <Section title="Farben & Stil" icon={<Palette size={18} />}>
          <ColorField
            label="Hintergrundfarbe"
            value={config.style.backgroundColor}
            onChange={(backgroundColor) => updateConfig({ style: { ...config.style, backgroundColor } })}
          />
          <ColorField
            label="Textfarbe"
            value={config.style.textColor}
            onChange={(textColor) => updateConfig({ style: { ...config.style, textColor } })}
          />
          <ColorField
            label="Link-Farbe"
            value={config.style.linkColor}
            onChange={(linkColor) => updateConfig({ style: { ...config.style, linkColor } })}
          />
          <ColorField
            label="Überschriften-Farbe"
            value={config.style.headingColor}
            onChange={(headingColor) => updateConfig({ style: { ...config.style, headingColor } })}
          />
          <ColorField
            label="Trennlinien-Farbe"
            value={config.style.dividerColor}
            onChange={(dividerColor) => updateConfig({ style: { ...config.style, dividerColor } })}
          />
          <SelectField
            label="Abstand"
            value={config.style.padding}
            onChange={(padding) => updateConfig({ style: { ...config.style, padding: padding as 'sm' | 'md' | 'lg' | 'xl' } })}
            options={[
              { value: 'sm', label: 'Klein' },
              { value: 'md', label: 'Mittel' },
              { value: 'lg', label: 'Groß' },
              { value: 'xl', label: 'Sehr groß' },
            ]}
          />
        </Section>
      </div>
    </div>
  );
};

export default FooterEditorPage;
