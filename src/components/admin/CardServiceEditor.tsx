// =====================================================
// CARD SERVICE EDITOR
// Admin-Editor für Service-Karten-Konfiguration
// =====================================================

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  GripVertical,
  Image as ImageIcon,
  X
} from 'lucide-react';
import {
  CardServiceConfig,
  ServiceItem,
  BorderRadius,
  Shadow,
  Spacing,
  FontSize,
  FontWeight,
  BORDER_RADIUS_VALUES,
  SHADOW_VALUES,
  SPACING_VALUES,
  FONT_SIZE_VALUES,
  FONT_WEIGHT_VALUES
} from '../../types/Cards';
import { ColorValue } from '../../types/theme';
import { IconPicker } from './IconPicker';

// ===== SECTION COMPONENT =====

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--admin-border)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 transition"
        style={{ backgroundColor: 'var(--admin-bg-surface)' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg-surface)'}
      >
        <span className="font-medium" style={{ color: 'var(--admin-text-heading)' }}>{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" style={{ color: 'var(--admin-text-muted)' }} />
        ) : (
          <ChevronDown className="w-5 h-5" style={{ color: 'var(--admin-text-muted)' }} />
        )}
      </button>
      {isOpen && (
        <div className="p-4 border-t space-y-4" style={{ borderColor: 'var(--admin-border)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ===== SELECT COMPONENT =====

interface SelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

function Select<T extends string>({ label, value, onChange, options }: SelectProps<T>) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-3 py-2 border rounded-lg admin-focus"
        style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ===== COLOR PICKER COMPONENT =====

interface ColorPickerProps {
  label: string;
  value: ColorValue;
  onChange: (value: ColorValue) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const isCustom = value.kind === 'custom';
  const currentColor = isCustom ? value.hex : '#000000';

  const tokenOptions = [
    { ref: 'semantic.cardBg', label: 'Karten-Hintergrund' },
    { ref: 'semantic.pageBg', label: 'Seiten-Hintergrund' },
    { ref: 'semantic.headingText', label: 'Überschrift' },
    { ref: 'semantic.bodyText', label: 'Fließtext' },
    { ref: 'semantic.mutedText', label: 'Gedämpfter Text' },
    { ref: 'semantic.border', label: 'Rahmen' },
    { ref: 'semantic.buttonPrimaryBg', label: 'Primär-Button' },
    { ref: 'semantic.buttonPrimaryText', label: 'Button-Text' }
  ];

  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
      <div className="flex gap-2">
        <select
          value={isCustom ? 'custom' : value.ref}
          onChange={(e) => {
            if (e.target.value === 'custom') {
              onChange({ kind: 'custom', hex: currentColor });
            } else {
              onChange({ kind: 'tokenRef', ref: e.target.value });
            }
          }}
          className="flex-1 px-3 py-2 border rounded-lg admin-focus"
          style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
        >
          <option value="custom">Benutzerdefiniert</option>
          <optgroup label="Theme-Farben">
            {tokenOptions.map((opt) => (
              <option key={opt.ref} value={opt.ref}>{opt.label}</option>
            ))}
          </optgroup>
        </select>
        {isCustom && (
          <input
            type="color"
            value={value.hex}
            onChange={(e) => onChange({ kind: 'custom', hex: e.target.value })}
            className="w-12 h-10 p-1 rounded-lg border cursor-pointer"
            style={{ borderColor: 'var(--admin-border-strong)' }}
          />
        )}
      </div>
    </div>
  );
};

// ===== NUMBER INPUT =====

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({ 
  label, value, onChange, min = 0, max = 100, step = 1 
}) => {
  return (
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
    </div>
  );
};

// ===== CHECKBOX INPUT =====

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded"
        style={{ borderColor: 'var(--admin-border-strong)', accentColor: 'var(--admin-accent)' }}
      />
      <span className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>{label}</span>
    </label>
  );
};

// ===== TEXT INPUT =====

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ 
  label, value, onChange, placeholder, multiline 
}) => {
  const InputComponent = multiline ? 'textarea' : 'input';
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
      <InputComponent
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
        className="w-full px-3 py-2 border rounded-lg admin-focus"
        style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
      />
    </div>
  );
};

// ===== FEATURE EDITOR =====

interface FeatureEditorProps {
  features: string[];
  onChange: (features: string[]) => void;
}

const FeatureEditor: React.FC<FeatureEditorProps> = ({ features, onChange }) => {
  const addFeature = () => {
    onChange([...features, '']);
  };

  const updateFeature = (index: number, text: string) => {
    const newFeatures = [...features];
    newFeatures[index] = text;
    onChange(newFeatures);
  };

  const removeFeature = (index: number) => {
    onChange(features.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>Features</label>
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={feature}
            onChange={(e) => updateFeature(index, e.target.value)}
            placeholder="Feature-Text"
            className="flex-1 px-3 py-1.5 border rounded-lg text-sm admin-focus"
            style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
          />
          <button
            onClick={() => removeFeature(index)}
            className="p-1 hover:text-red-500 transition" style={{ color: 'var(--admin-text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addFeature}
        className="text-sm flex items-center gap-1"
        style={{ color: 'var(--admin-accent)' }}
      >
        <Plus className="w-4 h-4" /> Feature hinzufügen
      </button>
    </div>
  );
};

// ===== SERVICE ITEM EDITOR =====

interface ServiceItemEditorProps {
  item: ServiceItem;
  onChange: (item: ServiceItem) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const ServiceItemEditor: React.FC<ServiceItemEditorProps> = ({
  item,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const update = (updates: Partial<ServiceItem>) => {
    onChange({ ...item, ...updates });
  };

  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--admin-border)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
        <GripVertical className="w-4 h-4 cursor-move" style={{ color: 'var(--admin-text-muted)' }} />
        
        {/* Icon/Image Preview */}
        <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--admin-bg-input)' }}>
          {item.image ? (
            <img src={item.image} alt="" className="w-full h-full object-cover" />
          ) : item.icon ? (
            <span className="text-xs font-mono">{item.icon}</span>
          ) : (
            <ImageIcon className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.title || 'Neuer Service'}</p>
          {item.price && (
            <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>€{item.price}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onMoveUp && (
            <button onClick={onMoveUp} className="p-1" style={{ color: 'var(--admin-text-muted)' }}>
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          {onMoveDown && (
            <button onClick={onMoveDown} className="p-1" style={{ color: 'var(--admin-text-muted)' }}>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1" style={{ color: 'var(--admin-text-muted)' }}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:text-red-500" style={{ color: 'var(--admin-text-muted)' }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Titel"
              value={item.title}
              onChange={(title) => update({ title })}
              placeholder="z.B. Herrenschnitt"
            />
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--admin-text-muted)' }}>Icon</label>
              <IconPicker
                value={item.icon || 'Scissors'}
                onChange={(icon) => update({ icon })}
              />
            </div>
          </div>

          <TextInput
            label="Beschreibung"
            value={item.description || ''}
            onChange={(description) => update({ description })}
            placeholder="Kurze Beschreibung des Services..."
            multiline
          />

          <div className="grid grid-cols-3 gap-4">
            <NumberInput
              label="Preis (€)"
              value={item.price || 0}
              onChange={(price) => update({ price })}
              min={0}
              step={0.5}
            />
            <TextInput
              label="Preis-Einheit"
              value={item.priceUnit || ''}
              onChange={(priceUnit) => update({ priceUnit })}
              placeholder="z.B. ab, pro Stunde"
            />
            <TextInput
              label="Dauer"
              value={item.duration || ''}
              onChange={(duration) => update({ duration })}
              placeholder="z.B. 30 min"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>Bild</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={item.image || ''}
                onChange={(e) => update({ image: e.target.value })}
                placeholder="Bild-URL"
                className="flex-1 px-3 py-2 border rounded-lg admin-focus"
                style={{ borderColor: 'var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text)' }}
              />
              <button
                onClick={() => {/* TODO: Open media library */}}
                className="px-4 py-2 rounded-lg transition"
                style={{ backgroundColor: 'var(--admin-bg-input)', color: 'var(--admin-text-secondary)' }}
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <FeatureEditor
            features={item.features || []}
            onChange={(features) => update({ features })}
          />

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="CTA-Button Text"
              value={item.ctaText || ''}
              onChange={(ctaText) => update({ ctaText })}
              placeholder="z.B. Jetzt buchen"
            />
            <TextInput
              label="CTA-Link"
              value={item.ctaLink || ''}
              onChange={(ctaLink) => update({ ctaLink })}
              placeholder="/kontakt"
            />
          </div>

          <Checkbox
            label="Als 'Highlight' markieren"
            checked={item.highlighted || false}
            onChange={(highlighted) => update({ highlighted })}
          />
        </div>
      )}
    </div>
  );
};

// ===== MAIN EDITOR =====

interface CardServiceEditorProps {
  config: CardServiceConfig;
  onChange: (config: CardServiceConfig) => void;
}

export const CardServiceEditor: React.FC<CardServiceEditorProps> = ({ config, onChange }) => {
  // Update helpers
  const updateConfig = (updates: Partial<CardServiceConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateCardStyle = (updates: Partial<CardServiceConfig['cardStyle']>) => {
    onChange({ ...config, cardStyle: { ...config.cardStyle, ...updates } });
  };

  const updateImageStyle = (updates: Partial<CardServiceConfig['imageStyle']>) => {
    onChange({ ...config, imageStyle: { ...config.imageStyle, ...updates } });
  };

  const updateTextStyle = (updates: Partial<CardServiceConfig['textStyle']>) => {
    onChange({ ...config, textStyle: { ...config.textStyle, ...updates } });
  };

  const updatePriceStyle = (updates: Partial<CardServiceConfig['priceStyle']>) => {
    onChange({ ...config, priceStyle: { ...config.priceStyle, ...updates } });
  };

  const updateButtonStyle = (updates: Partial<CardServiceConfig['buttonStyle']>) => {
    onChange({ ...config, buttonStyle: { ...config.buttonStyle, ...updates } });
  };

  const updateGrid = (updates: Partial<CardServiceConfig['grid']>) => {
    onChange({ ...config, grid: { ...config.grid, ...updates } });
  };

  const updateSectionStyle = (updates: Partial<CardServiceConfig['sectionStyle']>) => {
    onChange({ ...config, sectionStyle: { ...config.sectionStyle, ...updates } });
  };

  // Service management
  const addService = () => {
    const newService: ServiceItem = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      order: config.services.length + 1
    };
    updateConfig({ services: [...config.services, newService] });
  };

  const updateService = (id: string, item: ServiceItem) => {
    updateConfig({
      services: config.services.map((s) => (s.id === id ? item : s))
    });
  };

  const deleteService = (id: string) => {
    updateConfig({
      services: config.services.filter((s) => s.id !== id)
    });
  };

  const moveService = (id: string, direction: 'up' | 'down') => {
    const index = config.services.findIndex((s) => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.services.length) return;

    const newServices = [...config.services];
    [newServices[index], newServices[newIndex]] = [newServices[newIndex], newServices[index]];
    newServices.forEach((s, i) => (s.order = i + 1));
    updateConfig({ services: newServices });
  };

  // Options
  const borderRadiusOptions = Object.keys(BORDER_RADIUS_VALUES).map((k) => ({
    value: k as BorderRadius,
    label: k === 'none' ? 'Keine' : k.toUpperCase()
  }));

  const shadowOptions = Object.keys(SHADOW_VALUES).map((k) => ({
    value: k as Shadow,
    label: k === 'none' ? 'Keiner' : k.toUpperCase()
  }));

  const spacingOptions = Object.keys(SPACING_VALUES).map((k) => ({
    value: k as Spacing,
    label: k === 'none' ? 'Keiner' : k.toUpperCase()
  }));

  const fontSizeOptions = Object.keys(FONT_SIZE_VALUES).map((k) => ({
    value: k as FontSize,
    label: k.toUpperCase()
  }));

  const fontWeightOptions = Object.keys(FONT_WEIGHT_VALUES).map((k) => ({
    value: k as FontWeight,
    label: k.charAt(0).toUpperCase() + k.slice(1)
  }));

  const layoutOptions = [
    { value: 'grid' as const, label: 'Raster' },
    { value: 'list' as const, label: 'Liste' },
    { value: 'masonry' as const, label: 'Masonry' }
  ];

  const hoverEffectOptions = [
    { value: 'none' as const, label: 'Keiner' },
    { value: 'lift' as const, label: 'Anheben' },
    { value: 'glow' as const, label: 'Glühen' },
    { value: 'scale' as const, label: 'Skalieren' },
    { value: 'border' as const, label: 'Rahmen' }
  ];

  const imagePositionOptions = [
    { value: 'top' as const, label: 'Oben' },
    { value: 'left' as const, label: 'Links' },
    { value: 'background' as const, label: 'Hintergrund' },
    { value: 'none' as const, label: 'Kein Bild' }
  ];

  const pricePositionOptions = [
    { value: 'top' as const, label: 'Oben' },
    { value: 'title' as const, label: 'Neben Titel' },
    { value: 'bottom' as const, label: 'Unten' }
  ];

  const maxWidthOptions = [
    { value: 'sm' as const, label: 'Klein (672px)' },
    { value: 'md' as const, label: 'Mittel (896px)' },
    { value: 'lg' as const, label: 'Groß (1024px)' },
    { value: 'xl' as const, label: 'Sehr groß (1280px)' },
    { value: '2xl' as const, label: 'XXL (1536px)' },
    { value: 'full' as const, label: 'Volle Breite' }
  ];

  const alignOptions = [
    { value: 'left' as const, label: 'Links' },
    { value: 'center' as const, label: 'Zentriert' },
    { value: 'right' as const, label: 'Rechts' }
  ];

  return (
    <div className="space-y-4">
      {/* Services Section */}
      <Section title="Services" defaultOpen={true}>
        <div className="space-y-3">
          {config.services
            .sort((a, b) => a.order - b.order)
            .map((service, idx) => (
              <ServiceItemEditor
                key={service.id}
                item={service}
                onChange={(item) => updateService(service.id, item)}
                onDelete={() => deleteService(service.id)}
                onMoveUp={idx > 0 ? () => moveService(service.id, 'up') : undefined}
                onMoveDown={
                  idx < config.services.length - 1
                    ? () => moveService(service.id, 'down')
                    : undefined
                }
              />
            ))}
        </div>
        <button
          onClick={addService}
          className="mt-4 w-full py-2 border-2 border-dashed rounded-lg transition flex items-center justify-center gap-2"
          style={{ borderColor: 'var(--admin-border-strong)', color: 'var(--admin-text-muted)' }}
        >
          <Plus className="w-5 h-5" />
          Service hinzufügen
        </button>
      </Section>

      {/* Layout Section */}
      <Section title="Layout">
        <Select
          label="Layout-Typ"
          value={config.layout}
          onChange={(layout) => updateConfig({ layout })}
          options={layoutOptions}
        />

        <div className="grid grid-cols-3 gap-4">
          <NumberInput
            label="Spalten (Desktop)"
            value={config.grid.columns.desktop}
            onChange={(v) =>
              updateGrid({ columns: { ...config.grid.columns, desktop: v } })
            }
            min={1}
            max={6}
          />
          <NumberInput
            label="Spalten (Tablet)"
            value={config.grid.columns.tablet || 2}
            onChange={(v) =>
              updateGrid({ columns: { ...config.grid.columns, tablet: v } })
            }
            min={1}
            max={4}
          />
          <NumberInput
            label="Spalten (Mobile)"
            value={config.grid.columns.mobile || 1}
            onChange={(v) =>
              updateGrid({ columns: { ...config.grid.columns, mobile: v } })
            }
            min={1}
            max={2}
          />
        </div>

        <Select
          label="Abstand"
          value={config.grid.gap}
          onChange={(gap) => updateGrid({ gap })}
          options={spacingOptions}
        />
      </Section>

      {/* Card Style Section */}
      <Section title="Karten-Styling">
        <ColorPicker
          label="Hintergrundfarbe"
          value={config.cardStyle.backgroundColor}
          onChange={(backgroundColor) => updateCardStyle({ backgroundColor })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Ecken-Radius"
            value={config.cardStyle.borderRadius}
            onChange={(borderRadius) => updateCardStyle({ borderRadius })}
            options={borderRadiusOptions}
          />
          <Select
            label="Schatten"
            value={config.cardStyle.shadow}
            onChange={(shadow) => updateCardStyle({ shadow })}
            options={shadowOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Rahmenbreite"
            value={config.cardStyle.borderWidth}
            onChange={(borderWidth) => updateCardStyle({ borderWidth: borderWidth as 0 | 1 | 2 | 3 | 4 })}
            min={0}
            max={4}
          />
          <ColorPicker
            label="Rahmenfarbe"
            value={config.cardStyle.borderColor}
            onChange={(borderColor) => updateCardStyle({ borderColor })}
          />
        </div>

        <Select
          label="Innenabstand"
          value={config.cardStyle.padding}
          onChange={(padding) => updateCardStyle({ padding })}
          options={spacingOptions}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Hover-Effekt"
            value={config.cardStyle.hoverEffect}
            onChange={(hoverEffect) => updateCardStyle({ hoverEffect })}
            options={hoverEffectOptions}
          />
          <NumberInput
            label="Transition (ms)"
            value={config.cardStyle.transitionDuration}
            onChange={(transitionDuration) => updateCardStyle({ transitionDuration: transitionDuration as 150 | 200 | 300 | 500 })}
            min={150}
            max={500}
            step={50}
          />
        </div>
      </Section>

      {/* Image Style Section */}
      <Section title="Bild-Styling">
        <Select
          label="Bild-Position"
          value={config.imageStyle.position || 'top'}
          onChange={(position) => updateImageStyle({ position: position as 'top' | 'left' | 'background' | 'none' })}
          options={imagePositionOptions}
        />

        <Select
          label="Bild-Radius"
          value={config.imageStyle.borderRadius}
          onChange={(borderRadius) => updateImageStyle({ borderRadius })}
          options={borderRadiusOptions}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Bild-Breite"
            value={config.imageStyle.width || 'full'}
            onChange={(width) => updateImageStyle({ width: width as 'full' | 'fixed' })}
            options={[
              { value: 'full' as const, label: 'Volle Breite' },
              { value: 'fixed' as const, label: 'Fest' }
            ]}
          />
          {config.imageStyle.width === 'fixed' && (
            <NumberInput
              label="Feste Höhe (px)"
              value={config.imageStyle.height || 200}
              onChange={(height) => updateImageStyle({ height })}
              min={50}
              max={500}
            />
          )}
        </div>

        <Select
          label="Seitenverhältnis"
          value={config.imageStyle.aspectRatio || 'auto'}
          onChange={(aspectRatio) => updateImageStyle({ aspectRatio })}
          options={[
            { value: 'auto' as const, label: 'Automatisch' },
            { value: '1:1' as const, label: 'Quadrat (1:1)' },
            { value: '4:3' as const, label: 'Standard (4:3)' },
            { value: '16:9' as const, label: 'Breitbild (16:9)' },
            { value: '3:2' as const, label: 'Foto (3:2)' }
          ]}
        />
      </Section>

      {/* Text Style Section */}
      <Section title="Text-Styling">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Titel-Größe"
            value={config.textStyle.titleSize}
            onChange={(titleSize) => updateTextStyle({ titleSize })}
            options={fontSizeOptions}
          />
          <Select
            label="Titel-Gewicht"
            value={config.textStyle.titleWeight}
            onChange={(titleWeight) => updateTextStyle({ titleWeight })}
            options={fontWeightOptions}
          />
        </div>

        <ColorPicker
          label="Titel-Farbe"
          value={config.textStyle.titleColor}
          onChange={(titleColor) => updateTextStyle({ titleColor })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Beschreibung-Größe"
            value={config.textStyle.descriptionSize}
            onChange={(descriptionSize) => updateTextStyle({ descriptionSize })}
            options={fontSizeOptions}
          />
          <ColorPicker
            label="Beschreibung-Farbe"
            value={config.textStyle.descriptionColor}
            onChange={(descriptionColor) => updateTextStyle({ descriptionColor })}
          />
        </div>
      </Section>

      {/* Price Style Section */}
      <Section title="Preis-Styling">
        <Checkbox
          label="Preis anzeigen"
          checked={config.showPrice}
          onChange={(showPrice) => updateConfig({ showPrice })}
        />

        {config.showPrice && (
          <>
            <Select
              label="Preis-Position"
              value={config.priceStyle.position}
              onChange={(position) => updatePriceStyle({ position })}
              options={pricePositionOptions}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Preis-Größe"
                value={config.priceStyle.size}
                onChange={(size) => updatePriceStyle({ size })}
                options={fontSizeOptions}
              />
              <Select
                label="Preis-Gewicht"
                value={config.priceStyle.weight}
                onChange={(weight) => updatePriceStyle({ weight })}
                options={fontWeightOptions}
              />
            </div>

            <ColorPicker
              label="Preis-Farbe"
              value={config.priceStyle.color}
              onChange={(color) => updatePriceStyle({ color })}
            />

            <Checkbox
              label="Preis-Badge mit Hintergrund"
              checked={config.priceStyle.showBadge}
              onChange={(showBadge) => updatePriceStyle({ showBadge })}
            />

            {config.priceStyle.showBadge && (
              <ColorPicker
                label="Badge-Hintergrund"
                value={config.priceStyle.badgeBackground}
                onChange={(badgeBackground) => updatePriceStyle({ badgeBackground })}
              />
            )}
          </>
        )}

        <Checkbox
          label="Dauer anzeigen"
          checked={config.showDuration}
          onChange={(showDuration) => updateConfig({ showDuration })}
        />

        <Checkbox
          label="Features anzeigen"
          checked={config.showFeatures}
          onChange={(showFeatures) => updateConfig({ showFeatures })}
        />
      </Section>

      {/* Button Style Section */}
      <Section title="Button-Styling">
        <Checkbox
          label="CTA-Button anzeigen"
          checked={config.showCTA}
          onChange={(showCTA) => updateConfig({ showCTA })}
        />

        {config.showCTA && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Button-Hintergrund"
                value={config.buttonStyle.backgroundColor}
                onChange={(backgroundColor) => updateButtonStyle({ backgroundColor })}
              />
              <ColorPicker
                label="Button-Textfarbe"
                value={config.buttonStyle.textColor}
                onChange={(textColor) => updateButtonStyle({ textColor })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Button-Radius"
                value={config.buttonStyle.borderRadius}
                onChange={(borderRadius) => updateButtonStyle({ borderRadius })}
                options={borderRadiusOptions}
              />
              <Select
                label="Button-Padding"
                value={config.buttonStyle.padding || 'md'}
                onChange={(padding) => updateButtonStyle({ padding: padding as Spacing })}
                options={spacingOptions}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Button-Rahmenbreite"
                value={config.buttonStyle.borderWidth || 0}
                onChange={(borderWidth) => updateButtonStyle({ borderWidth: borderWidth as 0 | 1 | 2 | 3 | 4 })}
                min={0}
                max={4}
              />
              <ColorPicker
                label="Button-Rahmenfarbe"
                value={config.buttonStyle.borderColor}
                onChange={(borderColor) => updateButtonStyle({ borderColor })}
              />
            </div>

            <Select
              label="Volle Breite"
              value={config.buttonStyle.fullWidth ? 'yes' : 'no'}
              onChange={(v) => updateButtonStyle({ fullWidth: v === 'yes' })}
              options={[
                { value: 'yes', label: 'Ja' },
                { value: 'no', label: 'Nein' }
              ]}
            />
          </>
        )}
      </Section>

      {/* Section Style */}
      <Section title="Sektion-Styling">
        <ColorPicker
          label="Sektion-Hintergrund"
          value={config.sectionStyle.backgroundColor}
          onChange={(backgroundColor) => updateSectionStyle({ backgroundColor })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Vertikaler Abstand"
            value={config.sectionStyle.paddingY}
            onChange={(paddingY) => updateSectionStyle({ paddingY })}
            options={spacingOptions}
          />
          <Select
            label="Horizontaler Abstand"
            value={config.sectionStyle.paddingX}
            onChange={(paddingX) => updateSectionStyle({ paddingX })}
            options={spacingOptions}
          />
        </div>

        <Select
          label="Maximale Breite"
          value={config.sectionStyle.maxWidth}
          onChange={(maxWidth) => updateSectionStyle({ maxWidth })}
          options={maxWidthOptions}
        />

        <Checkbox
          label="Header anzeigen"
          checked={config.sectionStyle.showHeader}
          onChange={(showHeader) => updateSectionStyle({ showHeader })}
        />

        {config.sectionStyle.showHeader && (
          <>
            <Select
              label="Header-Ausrichtung"
              value={config.sectionStyle.headerAlign}
              onChange={(headerAlign) => updateSectionStyle({ headerAlign })}
              options={alignOptions}
            />

            <TextInput
              label="Titel"
              value={config.sectionStyle.title || ''}
              onChange={(title) => updateSectionStyle({ title })}
              placeholder="z.B. Unsere Services"
            />

            <ColorPicker
              label="Titel-Farbe"
              value={config.sectionStyle.titleColor}
              onChange={(titleColor) => updateSectionStyle({ titleColor })}
            />

            <TextInput
              label="Untertitel"
              value={config.sectionStyle.subtitle || ''}
              onChange={(subtitle) => updateSectionStyle({ subtitle })}
              placeholder="z.B. Professionelle Dienstleistungen für Sie"
            />

            <ColorPicker
              label="Untertitel-Farbe"
              value={config.sectionStyle.subtitleColor}
              onChange={(subtitleColor) => updateSectionStyle({ subtitleColor })}
            />
          </>
        )}
      </Section>
    </div>
  );
};

export default CardServiceEditor;
