// =====================================================
// HEADER EDITOR
// Admin-Editor für Header-Konfiguration
// =====================================================

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  Palette,
  Layout,
  Smartphone,
  Type,
  Link as LinkIcon,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import {
  HeaderConfig,
  HeaderCenteredConfig,
  HeaderHamburgerConfig,
  HeaderVariant,
  NavigationItem,
  NavItemType,
  MobileMenuStyle,
  StickyStyle,
  ShadowSize,
  DividerStyle,
  HamburgerIconStyle,
  HamburgerAnimation,
  createDefaultHeaderClassicConfig,
  createDefaultHeaderCenteredConfig,
  createDefaultHeaderHamburgerConfig,
  HEADER_HEIGHT_VALUES
} from '../../types/Header';
import { ColorValue } from '../../types/theme';
import {
  Spacing,
  BorderRadius,
  SPACING_VALUES,
  BORDER_RADIUS_VALUES
} from '../../types/Cards';

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

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: any) => void;
  options: { value: string; label: string }[];
  helpText?: string;
}

const Select: React.FC<SelectProps> = ({ label, value, onChange, options, helpText }) => (
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

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder, helpText }) => (
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

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, min, max, step = 1, helpText }) => (
  <div>
    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="w-full px-3 py-2 border rounded-lg admin-focus"
      style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
    />
    {helpText && <p className="mt-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>{helpText}</p>}
  </div>
);

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, helpText }) => (
  <div className="flex items-center justify-between">
    <div>
      <span className="text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>{label}</span>
      {helpText && <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{helpText}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition`}
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

interface ColorPickerProps {
  label: string;
  value: ColorValue;
  onChange: (value: ColorValue) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
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
// NAVIGATION ITEM EDITOR
// =====================================================

interface NavItemEditorProps {
  item: NavigationItem;
  onUpdate: (updates: Partial<NavigationItem>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const NavItemEditor: React.FC<NavItemEditorProps> = ({
  item,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navTypeOptions = [
    { value: 'scroll', label: 'Scroll zu Abschnitt' },
    { value: 'page', label: 'Seite' },
    { value: 'link', label: 'Externer Link' },
    { value: 'dropdown', label: 'Dropdown-Menü' }
  ];

  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg-card)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
        <GripVertical size={16} className="cursor-move" style={{ color: 'var(--admin-text-muted)' }} />
        
        <button
          onClick={() => onUpdate({ visible: !item.visible })}
          className="p-1 rounded admin-hover-bg"
          title={item.visible ? 'Ausblenden' : 'Einblenden'}
        >
          {item.visible ? <Eye size={16} /> : <EyeOff size={16} style={{ color: 'var(--admin-text-muted)' }} />}
        </button>

        <span className="flex-1 font-medium text-sm">{item.label || 'Neuer Punkt'}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 rounded disabled:opacity-30 admin-hover-bg"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 rounded disabled:opacity-30 admin-hover-bg"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded admin-hover-bg"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-100 text-red-500 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 space-y-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <TextInput
            label="Bezeichnung"
            value={item.label}
            onChange={(label) => onUpdate({ label })}
            placeholder="z.B. Startseite"
          />

          <Select
            label="Typ"
            value={item.type}
            onChange={(type) => onUpdate({ type: type as NavItemType })}
            options={navTypeOptions}
          />

          {item.type !== 'dropdown' && (
            <TextInput
              label={item.type === 'scroll' ? 'Abschnitts-ID' : item.type === 'page' ? 'Seiten-Slug' : 'URL'}
              value={item.target || ''}
              onChange={(target) => onUpdate({ target })}
              placeholder={item.type === 'scroll' ? 'z.B. services' : item.type === 'page' ? 'z.B. kontakt' : 'https://...'}
            />
          )}

          {item.type === 'link' && (
            <Toggle
              label="In neuem Tab öffnen"
              checked={item.openInNewTab || false}
              onChange={(openInNewTab) => onUpdate({ openInNewTab })}
            />
          )}
        </div>
      )}
    </div>
  );
};

// =====================================================
// NAVIGATION EDITOR
// =====================================================

interface NavigationEditorProps {
  items: NavigationItem[];
  onChange: (items: NavigationItem[]) => void;
}

const NavigationEditor: React.FC<NavigationEditorProps> = ({ items, onChange }) => {
  const addItem = () => {
    const newItem: NavigationItem = {
      id: Date.now().toString(),
      label: 'Neuer Punkt',
      type: 'scroll',
      target: '',
      visible: true
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, updates: Partial<NavigationItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange(newItems);
  };

  const deleteItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <NavItemEditor
          key={item.id}
          item={item}
          onUpdate={(updates) => updateItem(index, updates)}
          onDelete={() => deleteItem(index)}
          onMoveUp={() => moveItem(index, 'up')}
          onMoveDown={() => moveItem(index, 'down')}
          isFirst={index === 0}
          isLast={index === items.length - 1}
        />
      ))}

      <button
        onClick={addItem}
        className="w-full py-2 border-2 border-dashed rounded-lg transition flex items-center justify-center gap-2"
        style={{ borderColor: 'var(--admin-border-strong)', color: 'var(--admin-text-muted)' }}
      >
        <Plus size={16} /> Menüpunkt hinzufügen
      </button>
    </div>
  );
};

// =====================================================
// MAIN HEADER EDITOR
// =====================================================

interface HeaderEditorProps {
  config: HeaderConfig;
  onChange: (config: HeaderConfig) => void;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({ config, onChange }) => {
  // Helper to update config
  const updateConfig = (updates: Partial<HeaderConfig>) => {
    onChange({ ...config, ...updates } as HeaderConfig);
  };

  // Variant options
  const variantOptions: { value: HeaderVariant; label: string; description: string }[] = [
    { value: 'classic', label: 'Classic', description: 'Logo links, Navigation rechts' },
    { value: 'centered', label: 'Centered', description: 'Logo und Navigation zentriert' },
    { value: 'hamburger', label: 'Hamburger', description: 'Immer Hamburger-Menü' }
  ];

  // Change variant with proper defaults
  const changeVariant = (variant: HeaderVariant) => {
    switch (variant) {
      case 'classic':
        onChange({ ...createDefaultHeaderClassicConfig(), navigation: config.navigation });
        break;
      case 'centered':
        onChange({ ...createDefaultHeaderCenteredConfig(), navigation: config.navigation });
        break;
      case 'hamburger':
        onChange({ ...createDefaultHeaderHamburgerConfig(), navigation: config.navigation });
        break;
    }
  };

  // Height options
  const heightOptions = Object.entries(HEADER_HEIGHT_VALUES).map(([key, value]) => ({
    value: key,
    label: `${value}px`
  }));

  // Shadow options
  const shadowOptions: { value: ShadowSize; label: string }[] = [
    { value: 'none', label: 'Kein Schatten' },
    { value: 'small', label: 'Klein' },
    { value: 'medium', label: 'Mittel' },
    { value: 'large', label: 'Groß' }
  ];

  // Spacing options
  const spacingOptions = Object.keys(SPACING_VALUES).map((key) => ({
    value: key,
    label: key.toUpperCase()
  }));

  // Border radius options
  const borderRadiusOptions = Object.keys(BORDER_RADIUS_VALUES).map((key) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1)
  }));

  // Mobile menu style options
  const mobileMenuOptions: { value: MobileMenuStyle; label: string }[] = [
    { value: 'fullscreen', label: 'Vollbild' },
    { value: 'slide-right', label: 'Von rechts' },
    { value: 'slide-left', label: 'Von links' },
    { value: 'dropdown', label: 'Dropdown' }
  ];

  // Sticky style options
  const stickyStyleOptions: { value: StickyStyle; label: string }[] = [
    { value: 'solid', label: 'Solide' },
    { value: 'blur', label: 'Glaseffekt (Blur)' }
  ];

  return (
    <div className="space-y-4">
      {/* Variant Selection */}
      <Section title="Header-Variante" icon={<Layout size={18} />} defaultOpen={true}>
        <div className="grid grid-cols-3 gap-3">
          {variantOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => changeVariant(opt.value)}
              className={`p-3 border-2 rounded-lg text-left transition`}
              style={config.variant === opt.value 
                ? { borderColor: 'var(--admin-accent)', backgroundColor: 'var(--admin-accent-bg)' }
                : { borderColor: 'var(--admin-border)' }
              }
            >
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{opt.description}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Logo Settings */}
      <Section title="Logo" icon={<ImageIcon size={18} />}>
        <Select
          label="Logo-Typ"
          value={config.logo.type}
          onChange={(type) => updateConfig({ logo: { ...config.logo, type } })}
          options={[
            { value: 'text', label: 'Text' },
            { value: 'image', label: 'Bild' },
            { value: 'logo-designer', label: 'Logo-Designer' }
          ]}
          helpText="Wählen Sie, wie Ihr Logo angezeigt werden soll."
        />

        {config.logo.type === 'text' && (
          <>
            <TextInput
              label="Logo-Text"
              value={config.logo.text || ''}
              onChange={(text) => updateConfig({ logo: { ...config.logo, text } })}
              placeholder="Ihr Firmenname"
            />
            <Select
              label="Schriftstärke"
              value={config.logo.fontWeight || 'bold'}
              onChange={(fontWeight) => updateConfig({ logo: { ...config.logo, fontWeight } })}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'medium', label: 'Medium' },
                { value: 'semibold', label: 'Halbfett' },
                { value: 'bold', label: 'Fett' }
              ]}
            />
          </>
        )}

        {config.logo.type === 'image' && (
          <TextInput
            label="Logo-URL"
            value={config.logo.imageUrl || ''}
            onChange={(imageUrl) => updateConfig({ logo: { ...config.logo, imageUrl } })}
            placeholder="/images/logo.png"
            helpText="Empfohlen: PNG mit transparentem Hintergrund"
          />
        )}

        <NumberInput
          label="Logo-Höhe (px)"
          value={config.logo.maxHeight}
          onChange={(maxHeight) => updateConfig({ logo: { ...config.logo, maxHeight } })}
          min={20}
          max={80}
          helpText="Maximale Höhe des Logos"
        />
      </Section>

      {/* Navigation */}
      <Section title="Navigation" icon={<LinkIcon size={18} />}>
        <NavigationEditor
          items={config.navigation}
          onChange={(navigation) => updateConfig({ navigation })}
        />
      </Section>

      {/* CTA Button */}
      <Section title="CTA-Button" icon={<ExternalLink size={18} />}>
        <Toggle
          label="CTA-Button anzeigen"
          checked={config.cta?.enabled || false}
          onChange={(enabled) => updateConfig({ 
            cta: { ...config.cta!, enabled } 
          })}
          helpText="Ein auffälliger Button rechts im Header"
        />

        {config.cta?.enabled && (
          <>
            <TextInput
              label="Button-Text"
              value={config.cta.text}
              onChange={(text) => updateConfig({ cta: { ...config.cta!, text } })}
              placeholder="Termin buchen"
            />

            <Select
              label="Aktion"
              value={config.cta.action.type}
              onChange={(type) => updateConfig({ 
                cta: { ...config.cta!, action: { ...config.cta!.action, type } }
              })}
              options={[
                { value: 'scroll', label: 'Scroll zu Abschnitt' },
                { value: 'link', label: 'Link öffnen' },
                { value: 'phone', label: 'Anrufen' },
                { value: 'email', label: 'E-Mail' }
              ]}
            />

            <TextInput
              label="Ziel"
              value={config.cta.action.target}
              onChange={(target) => updateConfig({ 
                cta: { ...config.cta!, action: { ...config.cta!.action, target } }
              })}
              placeholder={config.cta.action.type === 'scroll' ? 'contact' : 'https://...'}
            />

            <div className="grid grid-cols-2 gap-3">
              <ColorPicker
                label="Button-Farbe"
                value={config.cta.style.backgroundColor}
                onChange={(backgroundColor) => updateConfig({ 
                  cta: { ...config.cta!, style: { ...config.cta!.style, backgroundColor } }
                })}
              />
              <ColorPicker
                label="Text-Farbe"
                value={config.cta.style.textColor}
                onChange={(textColor) => updateConfig({ 
                  cta: { ...config.cta!, style: { ...config.cta!.style, textColor } }
                })}
              />
            </div>

            <Select
              label="Button-Radius"
              value={config.cta.style.borderRadius}
              onChange={(borderRadius) => updateConfig({ 
                cta: { ...config.cta!, style: { ...config.cta!.style, borderRadius: borderRadius as BorderRadius } }
              })}
              options={borderRadiusOptions}
            />
          </>
        )}
      </Section>

      {/* Sticky & Transparent */}
      <Section title="Sticky & Transparent" icon={<Settings size={18} />}>
        <Toggle
          label="Sticky Header"
          checked={config.sticky.enabled}
          onChange={(enabled) => updateConfig({ sticky: { ...config.sticky, enabled } })}
          helpText="Header bleibt beim Scrollen oben fixiert"
        />

        {config.sticky.enabled && (
          <>
            <NumberInput
              label="Erscheinen nach (px)"
              value={config.sticky.showAfter}
              onChange={(showAfter) => updateConfig({ sticky: { ...config.sticky, showAfter } })}
              min={0}
              max={500}
              helpText="0 = sofort sichtbar"
            />

            <Select
              label="Sticky-Stil"
              value={config.sticky.style}
              onChange={(style) => updateConfig({ sticky: { ...config.sticky, style: style as StickyStyle } })}
              options={stickyStyleOptions}
            />

            <Toggle
              label="Bei Scroll nach unten verstecken"
              checked={config.sticky.hideOnScrollDown || false}
              onChange={(hideOnScrollDown) => updateConfig({ sticky: { ...config.sticky, hideOnScrollDown } })}
            />
          </>
        )}

        <div className="border-t pt-4 mt-4">
          <Toggle
            label="Transparenter Header"
            checked={config.transparent.enabled}
            onChange={(enabled) => updateConfig({ transparent: { ...config.transparent, enabled } })}
            helpText="Nützlich wenn ein Hero-Bild dahinter liegt"
          />

          {config.transparent.enabled && (
            <Toggle
              label="Helle Schrift"
              checked={config.transparent.textColorLight}
              onChange={(textColorLight) => updateConfig({ transparent: { ...config.transparent, textColorLight } })}
              helpText="Für dunkle Hintergründe"
            />
          )}
        </div>
      </Section>

      {/* Style Settings */}
      <Section title="Design" icon={<Palette size={18} />}>
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker
            label="Hintergrundfarbe"
            value={config.style.backgroundColor}
            onChange={(backgroundColor) => updateConfig({ 
              style: { ...config.style, backgroundColor }
            })}
          />
          <ColorPicker
            label="Textfarbe"
            value={config.style.textColor}
            onChange={(textColor) => updateConfig({ 
              style: { ...config.style, textColor }
            })}
          />
          <ColorPicker
            label="Aktive Farbe"
            value={config.style.activeColor}
            onChange={(activeColor) => updateConfig({ 
              style: { ...config.style, activeColor }
            })}
          />
          <ColorPicker
            label="Hover-Farbe"
            value={config.style.hoverColor}
            onChange={(hoverColor) => updateConfig({ 
              style: { ...config.style, hoverColor }
            })}
          />
        </div>

        <Select
          label="Header-Höhe"
          value={config.style.height}
          onChange={(height) => updateConfig({ style: { ...config.style, height: height as keyof typeof HEADER_HEIGHT_VALUES } })}
          options={heightOptions}
        />

        <Select
          label="Schatten"
          value={config.style.shadow}
          onChange={(shadow) => updateConfig({ style: { ...config.style, shadow: shadow as ShadowSize } })}
          options={shadowOptions}
        />

        <Select
          label="Innenabstand"
          value={config.style.padding}
          onChange={(padding) => updateConfig({ style: { ...config.style, padding: padding as Spacing } })}
          options={spacingOptions}
        />
      </Section>

      {/* Mobile Settings */}
      <Section title="Mobile" icon={<Smartphone size={18} />}>
        <Select
          label="Breakpoint"
          value={config.mobile.breakpoint.toString()}
          onChange={(breakpoint) => updateConfig({ 
            mobile: { ...config.mobile, breakpoint: parseInt(breakpoint) as 768 | 1024 }
          })}
          options={[
            { value: '768', label: 'Tablet (768px)' },
            { value: '1024', label: 'Desktop (1024px)' }
          ]}
          helpText="Ab dieser Breite wird die Desktop-Navigation angezeigt"
        />

        <Select
          label="Menü-Stil"
          value={config.mobile.menuStyle}
          onChange={(menuStyle) => updateConfig({ 
            mobile: { ...config.mobile, menuStyle: menuStyle as MobileMenuStyle }
          })}
          options={mobileMenuOptions}
        />

        <Toggle
          label="Logo im Menü anzeigen"
          checked={config.mobile.showLogo}
          onChange={(showLogo) => updateConfig({ mobile: { ...config.mobile, showLogo } })}
        />

        <Toggle
          label="CTA im Menü anzeigen"
          checked={config.mobile.showCTA}
          onChange={(showCTA) => updateConfig({ mobile: { ...config.mobile, showCTA } })}
        />

        <NumberInput
          label="Animation-Dauer (ms)"
          value={config.mobile.animationDuration}
          onChange={(animationDuration) => updateConfig({ mobile: { ...config.mobile, animationDuration } })}
          min={100}
          max={1000}
          step={50}
        />
      </Section>

      {/* Variant-specific settings */}
      {config.variant === 'centered' && (
        <Section title="Centered-Optionen" icon={<Type size={18} />}>
          <Toggle
            label="Trennlinie"
            checked={(config as HeaderCenteredConfig).divider.enabled}
            onChange={(enabled) => updateConfig({ 
              divider: { ...(config as HeaderCenteredConfig).divider, enabled }
            } as Partial<HeaderCenteredConfig>)}
          />

          {(config as HeaderCenteredConfig).divider.enabled && (
            <>
              <Select
                label="Trennlinien-Stil"
                value={(config as HeaderCenteredConfig).divider.style}
                onChange={(style) => updateConfig({ 
                  divider: { ...(config as HeaderCenteredConfig).divider, style: style as DividerStyle }
                } as Partial<HeaderCenteredConfig>)}
                options={[
                  { value: 'line', label: 'Linie' },
                  { value: 'dots', label: 'Punkte' },
                  { value: 'gradient', label: 'Gradient' },
                  { value: 'none', label: 'Keine' }
                ]}
              />

              <NumberInput
                label="Breite (px)"
                value={(config as HeaderCenteredConfig).divider.width}
                onChange={(width) => updateConfig({ 
                  divider: { ...(config as HeaderCenteredConfig).divider, width }
                } as Partial<HeaderCenteredConfig>)}
                min={20}
                max={200}
              />

              <ColorPicker
                label="Farbe"
                value={(config as HeaderCenteredConfig).divider.color}
                onChange={(color) => updateConfig({ 
                  divider: { ...(config as HeaderCenteredConfig).divider, color }
                } as Partial<HeaderCenteredConfig>)}
              />
            </>
          )}

          <Toggle
            label="Kompakt bei Scroll"
            checked={(config as HeaderCenteredConfig).compactOnScroll}
            onChange={(compactOnScroll) => updateConfig({ compactOnScroll } as Partial<HeaderCenteredConfig>)}
            helpText="Wechselt beim Scrollen zu einzeiliger Ansicht"
          />
        </Section>
      )}

      {config.variant === 'hamburger' && (
        <Section title="Hamburger-Optionen" icon={<Settings size={18} />}>
          <Select
            label="Icon-Stil"
            value={(config as HeaderHamburgerConfig).hamburgerIcon.style}
            onChange={(style) => updateConfig({ 
              hamburgerIcon: { ...(config as HeaderHamburgerConfig).hamburgerIcon, style: style as HamburgerIconStyle }
            } as Partial<HeaderHamburgerConfig>)}
            options={[
              { value: 'lines', label: 'Linien (animiert)' },
              { value: 'dots', label: 'Punkte' },
              { value: 'x-rotate', label: 'X mit Rotation' }
            ]}
          />

          <NumberInput
            label="Icon-Größe (px)"
            value={(config as HeaderHamburgerConfig).hamburgerIcon.size}
            onChange={(size) => updateConfig({ 
              hamburgerIcon: { ...(config as HeaderHamburgerConfig).hamburgerIcon, size }
            } as Partial<HeaderHamburgerConfig>)}
            min={16}
            max={40}
          />

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-sm mb-3">Menü-Styling</h4>
            
            <ColorPicker
              label="Menü-Hintergrund"
              value={(config as HeaderHamburgerConfig).menu.backgroundColor}
              onChange={(backgroundColor) => updateConfig({ 
                menu: { ...(config as HeaderHamburgerConfig).menu, backgroundColor }
              } as Partial<HeaderHamburgerConfig>)}
            />

            <ColorPicker
              label="Menü-Textfarbe"
              value={(config as HeaderHamburgerConfig).menu.textColor}
              onChange={(textColor) => updateConfig({ 
                menu: { ...(config as HeaderHamburgerConfig).menu, textColor }
              } as Partial<HeaderHamburgerConfig>)}
            />

            <Select
              label="Text-Größe"
              value={(config as HeaderHamburgerConfig).menu.textSize}
              onChange={(textSize) => updateConfig({ 
                menu: { ...(config as HeaderHamburgerConfig).menu, textSize: textSize as 'md' | 'lg' | 'xl' | '2xl' }
              } as Partial<HeaderHamburgerConfig>)}
              options={[
                { value: 'md', label: 'Mittel' },
                { value: 'lg', label: 'Groß' },
                { value: 'xl', label: 'Sehr groß' },
                { value: '2xl', label: 'Extra groß' }
              ]}
            />

            <Select
              label="Text-Ausrichtung"
              value={(config as HeaderHamburgerConfig).menu.textAlign}
              onChange={(textAlign) => updateConfig({ 
                menu: { ...(config as HeaderHamburgerConfig).menu, textAlign: textAlign as 'left' | 'center' | 'right' }
              } as Partial<HeaderHamburgerConfig>)}
              options={[
                { value: 'left', label: 'Links' },
                { value: 'center', label: 'Zentriert' },
                { value: 'right', label: 'Rechts' }
              ]}
            />

            <Select
              label="Animation"
              value={(config as HeaderHamburgerConfig).menu.animation}
              onChange={(animation) => updateConfig({ 
                menu: { ...(config as HeaderHamburgerConfig).menu, animation: animation as HamburgerAnimation }
              } as Partial<HeaderHamburgerConfig>)}
              options={[
                { value: 'fade', label: 'Einblenden' },
                { value: 'slide', label: 'Einschieben' },
                { value: 'scale', label: 'Skalieren' }
              ]}
            />

            <Toggle
              label="Social Media im Menü"
              checked={(config as HeaderHamburgerConfig).menu.showSocialMedia}
              onChange={(showSocialMedia) => updateConfig({ 
                menu: { ...(config as HeaderHamburgerConfig).menu, showSocialMedia }
              } as Partial<HeaderHamburgerConfig>)}
            />

            <Toggle
              label="CTA im Menü"
              checked={(config as HeaderHamburgerConfig).menu.showCTA}
              onChange={(showCTA) => updateConfig({ 
                menu: { ...(config as HeaderHamburgerConfig).menu, showCTA }
              } as Partial<HeaderHamburgerConfig>)}
            />
          </div>
        </Section>
      )}
    </div>
  );
};

export default HeaderEditor;
