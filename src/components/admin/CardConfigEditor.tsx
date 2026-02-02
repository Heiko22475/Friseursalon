// =====================================================
// CARD CONFIG EDITOR
// Wiederverwendbarer Editor für GenericCardConfig
// Verwendet von CardTemplateEditorPage und GenericCardEditorPage
// =====================================================

import React, { useState } from 'react';
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  Image as ImageIcon, Type, Palette, Layout, DollarSign,
  Star, MousePointer, Settings
} from 'lucide-react';
import {
  GenericCardConfig,
  GenericCardItem,
  CardTypographyConfig,
  ImageElementStyle,
  OverlineStyle,
  TitleStyle,
  SubtitleStyle,
  DescriptionStyle,
  createDefaultGenericCardItem,
  createDefaultCardTypography,
  createDefaultImageElementStyle,
  createDefaultOverlineStyle,
  createDefaultTitleStyle,
  createDefaultSubtitleStyle,
  createDefaultDescriptionStyle,
} from '../../types/GenericCard';
import { MediaLibrary, MediaFile } from './MediaLibrary';
import { IconPicker } from './IconPicker';
import { RichTextInput } from './RichTextInput';
import { ThemeColorPicker } from './ThemeColorPicker';
import { FontPicker } from './FontPicker';
import { FontPickerWithSize } from './FontPickerWithSize';

// ===== HELPER COMPONENTS =====

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  nested?: boolean;
  toggleEnabled?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  toggleLabel?: string;
}

const Section: React.FC<SectionProps> = ({ 
  title, 
  icon, 
  defaultOpen = false, 
  children, 
  nested = false,
  toggleEnabled = false,
  toggleValue = false,
  onToggleChange,
  toggleLabel
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleChange) {
      onToggleChange(!toggleValue);
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${nested ? 'bg-gray-50' : 'bg-white'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 ${nested ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 hover:bg-gray-100'} transition`}
      >
        <div className={`flex items-center gap-2 ${nested ? 'text-sm' : ''} font-medium text-gray-700`}>
          {icon}
          {title}
        </div>
        <div className="flex items-center gap-3">
          {toggleEnabled && (
            <div 
              className="flex items-center gap-2"
              onClick={handleToggleClick}
            >
              {toggleLabel && <span className="text-xs text-gray-500">{toggleLabel}</span>}
              <div
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                  toggleValue ? 'bg-rose-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                    toggleValue ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </div>
            </div>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {isOpen && <div className={`p-4 space-y-4 border-t ${nested ? 'bg-white' : ''}`}>{children}</div>}
    </div>
  );
};

interface CollapsibleGroupProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({ title, icon, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition"
      >
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          {icon}
          {title}
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && <div className="p-4 space-y-3 border-t bg-gray-50/50">{children}</div>}
    </div>
  );
};

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface NumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  min?: number;
  step?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, placeholder, min, step }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      placeholder={placeholder}
      min={min}
      step={step}
      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
    />
  </div>
);

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, value, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-sm text-gray-700">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        value ? 'bg-rose-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </label>
);

// ===== CARD ITEM EDITOR =====

interface CardItemEditorProps {
  item: GenericCardItem;
  onChange: (item: GenericCardItem) => void;
  onDelete: () => void;
  index: number;
}

const CardItemEditor: React.FC<CardItemEditorProps> = ({ item, onChange, onDelete, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const update = (updates: Partial<GenericCardItem>) => {
    onChange({ ...item, ...updates });
  };

  const handleMediaSelect = (files: MediaFile[]) => {
    if (files.length > 0) {
      update({ image: files[0].file_url });
    }
    setShowMediaLibrary(false);
  };

  return (
    <div className="border rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 border-b">
        <button className="cursor-move p-1 hover:bg-gray-200 rounded">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 text-left font-medium text-sm"
        >
          {item.title || item.overline || `Karte ${index + 1}`}
        </button>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-100 rounded text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Image */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bild</label>
            {item.image ? (
              <div className="relative">
                <img src={item.image} alt="" className="w-full h-32 object-cover rounded-lg" />
                <button
                  onClick={() => update({ image: undefined })}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowMediaLibrary(true)}
                className="w-full py-2 border-2 border-dashed rounded-lg hover:border-rose-500 transition text-sm text-gray-500"
              >
                Bild auswählen
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Icon</label>
            <IconPicker
              value={item.icon || ''}
              onChange={(icon) => update({ icon })}
            />
          </div>

          {/* Overline, Title, Subtitle */}
          <div className="grid grid-cols-3 gap-3">
            <RichTextInput
              label="Overline"
              value={item.overline || ''}
              onChange={(overline) => update({ overline })}
            />
            <RichTextInput
              label="Titel"
              value={item.title}
              onChange={(title) => update({ title })}
            />
            <RichTextInput
              label="Untertitel"
              value={item.subtitle || ''}
              onChange={(subtitle) => update({ subtitle })}
            />
          </div>

          {/* Description */}
          <RichTextInput
            label="Beschreibung"
            value={item.description || ''}
            onChange={(description) => update({ description })}
          />

          {/* Button - Simplified to just one text field as button is set in config globally */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Button-Text (optional)</label>
            <input
              type="text"
              value={item.title}
              placeholder="Wird durch Karten-Konfiguration gesteuert"
              disabled
              className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Button-Styling wird global in der Karten-Konfiguration festgelegt</p>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Mediathek</h3>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MediaLibrary
                onSelect={handleMediaSelect}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== MAIN CARD CONFIG EDITOR =====

export interface CardConfigEditorProps {
  config: GenericCardConfig;
  onChange: (config: GenericCardConfig) => void;
}

export const CardConfigEditor: React.FC<CardConfigEditorProps> = ({ config, onChange }) => {
  const updateConfig = (updates: Partial<GenericCardConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateCardStyle = (updates: Partial<GenericCardConfig['cardStyle']>) => {
    onChange({ ...config, cardStyle: { ...config.cardStyle, ...updates } });
  };

  const updateGrid = (updates: Partial<GenericCardConfig['grid']>) => {
    onChange({ ...config, grid: { ...config.grid, ...updates } });
  };

  const updateTypography = (updates: Partial<CardTypographyConfig>) => {
    onChange({ 
      ...config, 
      typography: { 
        ...(config.typography || createDefaultCardTypography()), 
        ...updates 
      } 
    });
  };

  const updateImageElementStyle = (updates: Partial<ImageElementStyle>) => {
    onChange({ 
      ...config, 
      imageElementStyle: { 
        ...(config.imageElementStyle || createDefaultImageElementStyle()), 
        ...updates 
      } 
    });
  };

  const updateOverlineStyle = (updates: Partial<OverlineStyle>) => {
    onChange({ 
      ...config, 
      overlineStyle: { 
        ...(config.overlineStyle || createDefaultOverlineStyle()), 
        ...updates 
      } 
    });
  };

  const updateTitleStyle = (updates: Partial<TitleStyle>) => {
    onChange({ 
      ...config, 
      titleStyle: { 
        ...(config.titleStyle || createDefaultTitleStyle()), 
        ...updates 
      } 
    });
  };

  const updateSubtitleStyle = (updates: Partial<SubtitleStyle>) => {
    onChange({ 
      ...config, 
      subtitleStyle: { 
        ...(config.subtitleStyle || createDefaultSubtitleStyle()), 
        ...updates 
      } 
    });
  };

  const updateDescriptionStyle = (updates: Partial<DescriptionStyle>) => {
    onChange({ 
      ...config, 
      descriptionStyle: { 
        ...(config.descriptionStyle || createDefaultDescriptionStyle()), 
        ...updates 
      } 
    });
  };

  const updateIconStyle = (updates: Partial<GenericCardConfig['iconStyle']>) => {
    onChange({ ...config, iconStyle: { ...config.iconStyle, ...updates } });
  };

  const updatePriceStyle = (updates: Partial<GenericCardConfig['priceStyle']>) => {
    onChange({ ...config, priceStyle: { ...config.priceStyle, ...updates } });
  };

  const updateSectionStyle = (updates: Partial<GenericCardConfig['sectionStyle']>) => {
    onChange({ ...config, sectionStyle: { ...config.sectionStyle, ...updates } });
  };

  const updateButtonStyle = (updates: Partial<GenericCardConfig['buttonStyle']>) => {
    onChange({ ...config, buttonStyle: { ...config.buttonStyle, ...updates } });
  };

  const addItem = () => {
    const newItem = {
      ...createDefaultGenericCardItem(),
      order: config.items.length,
    };
    updateConfig({ items: [...config.items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<GenericCardItem>) => {
    updateConfig({
      items: config.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const deleteItem = (id: string) => {
    updateConfig({
      items: config.items.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      {/* Section Settings */}
      <Section title="Bereich-Einstellungen" icon={<Settings className="w-4 h-4" />}>
        <Toggle
          label="Header anzeigen"
          value={config.sectionStyle.showHeader}
          onChange={(showHeader) => updateSectionStyle({ showHeader })}
        />
        {config.sectionStyle.showHeader && (
          <>
            <RichTextInput
              label="Titel"
              value={config.sectionStyle.title || ''}
              onChange={(title) => updateSectionStyle({ title })}
            />
            <RichTextInput
              label="Untertitel"
              value={config.sectionStyle.subtitle || ''}
              onChange={(subtitle) => updateSectionStyle({ subtitle })}
            />
            <Select
              label="Ausrichtung"
              value={config.sectionStyle.headerAlign}
              options={[
                { value: 'left', label: 'Links' },
                { value: 'center', label: 'Zentriert' },
                { value: 'right', label: 'Rechts' },
              ]}
              onChange={(headerAlign: any) => updateSectionStyle({ headerAlign })}
            />
          </>
        )}
        <ThemeColorPicker
          label="Hintergrundfarbe"
          value={config.sectionStyle.backgroundColor}
          onChange={(backgroundColor) => updateSectionStyle({ backgroundColor: backgroundColor === null ? undefined : backgroundColor })}
          allowNoColor
        />

        {/* Typography */}
        <div className="pt-4 border-t border-gray-200">
          <Toggle
            label="Eigene Typografie verwenden"
            value={config.typography?.enabled ?? false}
            onChange={(enabled) => updateTypography({ enabled })}
          />
          {config.typography?.enabled && (
            <div className="mt-3 space-y-3">
              <FontPicker
                label="Titel-Schriftart"
                value={config.typography.titleFont || 'inter'}
                onChange={(titleFont) => updateTypography({ titleFont })}
              />
              <Select
                label="Titel-Schriftstärke"
                value={String(config.typography.titleWeight || 600)}
                options={[
                  { value: '300', label: 'Light (300)' },
                  { value: '400', label: 'Normal (400)' },
                  { value: '500', label: 'Medium (500)' },
                  { value: '600', label: 'Semibold (600)' },
                  { value: '700', label: 'Bold (700)' },
                  { value: '800', label: 'Extrabold (800)' },
                ]}
                onChange={(val) => updateTypography({ titleWeight: Number(val) })}
              />
              <FontPicker
                label="Text-Schriftart"
                value={config.typography.bodyFont || 'inter'}
                onChange={(bodyFont) => updateTypography({ bodyFont })}
              />
            </div>
          )}
        </div>
      </Section>

      {/* Layout Settings */}
      <Section title="Layout" icon={<Layout className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Anordnung"
            value={config.layout}
            options={[
              { value: 'grid', label: 'Raster' },
              { value: 'list', label: 'Liste' },
              { value: 'carousel', label: 'Karussell' },
            ]}
            onChange={(layout: any) => updateConfig({ layout })}
          />
          <Select
            label="Karten-Layout"
            value={config.cardLayoutVariant}
            options={[
              { value: 'vertical', label: 'Vertikal' },
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'overlay', label: 'Overlay' },
              { value: 'minimal', label: 'Minimal' },
            ]}
            onChange={(cardLayoutVariant: any) => updateConfig({ cardLayoutVariant })}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <NumberInput
            label="Spalten (Desktop)"
            value={config.grid.columns.desktop}
            onChange={(desktop) => updateGrid({ columns: { ...config.grid.columns, desktop: desktop || 3 } })}
            min={1}
          />
          <NumberInput
            label="Spalten (Tablet)"
            value={config.grid.columns.tablet}
            onChange={(tablet) => updateGrid({ columns: { ...config.grid.columns, tablet: tablet || 2 } })}
            min={1}
          />
          <NumberInput
            label="Spalten (Mobil)"
            value={config.grid.columns.mobile}
            onChange={(mobile) => updateGrid({ columns: { ...config.grid.columns, mobile: mobile || 1 } })}
            min={1}
          />
        </div>
        <Select
          label="Abstand"
          value={config.grid.gap}
          options={[
            { value: 'none', label: 'Kein' },
            { value: 'xs', label: 'Extra klein' },
            { value: 'sm', label: 'Klein' },
            { value: 'md', label: 'Mittel' },
            { value: 'lg', label: 'Groß' },
            { value: 'xl', label: 'Sehr groß' },
          ]}
          onChange={(gap: any) => updateGrid({ gap })}
        />
      </Section>

      {/* Styling Group */}
      <CollapsibleGroup title="Styling-Optionen" icon={<Palette className="w-5 h-5" />} defaultOpen>
        {/* Card Style */}
        <Section title="Karten-Styling" icon={<Palette className="w-4 h-4" />} nested>
          <div className="grid grid-cols-2 gap-4">
            <ThemeColorPicker
              label="Hintergrundfarbe"
              value={config.cardStyle.backgroundColor}
              onChange={(backgroundColor) => updateCardStyle({ backgroundColor: backgroundColor === null ? undefined : backgroundColor })}
              allowNoColor
            />
            <ThemeColorPicker
              label="Rahmenfarbe"
              value={config.cardStyle.borderColor}
              onChange={(borderColor) => updateCardStyle({ borderColor: borderColor === null ? undefined : borderColor })}
              allowNoColor
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Ecken-Radius"
              value={config.cardStyle.borderRadius}
              options={[
                { value: 'none', label: 'Keine' },
                { value: 'sm', label: 'Klein' },
                { value: 'md', label: 'Mittel' },
                { value: 'lg', label: 'Groß' },
                { value: 'xl', label: 'Sehr groß' },
                { value: '2xl', label: 'Extra groß' },
              ]}
              onChange={(borderRadius: any) => updateCardStyle({ borderRadius })}
            />
            <Select
              label="Schatten"
              value={config.cardStyle.shadow}
              options={[
                { value: 'none', label: 'Kein' },
                { value: 'sm', label: 'Klein' },
                { value: 'md', label: 'Mittel' },
                { value: 'lg', label: 'Groß' },
                { value: 'xl', label: 'Sehr groß' },
              ]}
              onChange={(shadow: any) => updateCardStyle({ shadow })}
            />
          </div>
        </Section>

        {/* Image Style */}
        <Section 
          title="Bild" 
          icon={<ImageIcon className="w-4 h-4" />} 
          nested
          toggleEnabled
          toggleValue={config.imageElementStyle?.enabled ?? config.showImage}
          onToggleChange={(enabled) => {
            updateImageElementStyle({ enabled });
            updateConfig({ showImage: enabled });
          }}
        >
          <NumberInput
            label="Innenabstand (Padding in px)"
            value={config.imageElementStyle?.padding ?? 0}
            onChange={(padding) => updateImageElementStyle({ padding: padding ?? 0 })}
            min={0}
            placeholder="0"
          />
          <NumberInput
            label="Abstand nach unten (Margin in px)"
            value={config.imageElementStyle?.marginBottom ?? 16}
            onChange={(marginBottom) => updateImageElementStyle({ marginBottom: marginBottom ?? 16 })}
            min={0}
            placeholder="16"
          />
        </Section>

        {/* Overline Style */}
        <Section 
          title="Overline" 
          icon={<Type className="w-4 h-4" />} 
          nested
          toggleEnabled
          toggleValue={config.overlineStyle?.enabled ?? false}
          onToggleChange={(enabled) => updateOverlineStyle({ enabled })}
        >
          <ThemeColorPicker
            label="Textfarbe"
            value={config.overlineStyle?.color ?? null}
            onChange={(color) => updateOverlineStyle({ color: color === null ? undefined : color })}
            allowNoColor
          />
          <FontPickerWithSize
            label="Schriftart und Größe"
            fontValue={config.overlineStyle?.font || config.typography?.bodyFont || 'inter'}
            onFontChange={(font) => updateOverlineStyle({ font })}
            sizeValue={config.overlineStyle?.fontSize}
            onSizeChange={(fontSize) => updateOverlineStyle({ fontSize })}
            defaultSize={12}
          />
        </Section>

        {/* Title Style */}
        <Section title="Überschrift" icon={<Type className="w-4 h-4" />} nested>
          <ThemeColorPicker
            label="Textfarbe"
            value={config.titleStyle?.color ?? null}
            onChange={(color) => updateTitleStyle({ color: color === null ? undefined : color })}
            allowNoColor
          />
          <FontPickerWithSize
            label="Schriftart und Größe"
            fontValue={config.titleStyle?.font || config.typography?.titleFont || 'inter'}
            onFontChange={(font) => updateTitleStyle({ font })}
            sizeValue={config.titleStyle?.fontSize}
            onSizeChange={(fontSize) => updateTitleStyle({ fontSize })}
            defaultSize={24}
          />
        </Section>

        {/* Subtitle Style */}
        <Section 
          title="Untertitel" 
          icon={<Type className="w-4 h-4" />} 
          nested
          toggleEnabled
          toggleValue={config.subtitleStyle?.enabled ?? config.showSubtitle}
          onToggleChange={(enabled) => {
            updateSubtitleStyle({ enabled });
            updateConfig({ showSubtitle: enabled });
          }}
        >
          <ThemeColorPicker
            label="Textfarbe"
            value={config.subtitleStyle?.color ?? null}
            onChange={(color) => updateSubtitleStyle({ color: color === null ? undefined : color })}
            allowNoColor
          />
        </Section>

        {/* Description Style */}
        <Section 
          title="Beschreibung" 
          icon={<Type className="w-4 h-4" />} 
          nested
          toggleEnabled
          toggleValue={config.descriptionStyle?.enabled ?? config.showDescription}
          onToggleChange={(enabled) => {
            updateDescriptionStyle({ enabled });
            updateConfig({ showDescription: enabled });
          }}
        >
          <ThemeColorPicker
            label="Textfarbe"
            value={config.descriptionStyle?.color ?? null}
            onChange={(color) => updateDescriptionStyle({ color: color === null ? undefined : color })}
            allowNoColor
          />
          <FontPickerWithSize
            label="Schriftart und Größe"
            fontValue={config.descriptionStyle?.font || config.typography?.bodyFont || 'inter'}
            onFontChange={(font) => updateDescriptionStyle({ font })}
            sizeValue={config.descriptionStyle?.fontSize}
            onSizeChange={(fontSize) => updateDescriptionStyle({ fontSize })}
            defaultSize={14}
          />
        </Section>

        {/* Icon Style */}
        <Section 
          title="Icon-Styling" 
          icon={<Star className="w-4 h-4" />} 
          nested
          toggleEnabled
          toggleValue={config.iconStyle.enabled}
          onToggleChange={(enabled) => updateIconStyle({ enabled })}
        >
          <Select
            label="Größe"
            value={config.iconStyle.size}
            options={[
              { value: 'sm', label: 'Klein' },
              { value: 'md', label: 'Mittel' },
              { value: 'lg', label: 'Groß' },
              { value: 'xl', label: 'Sehr groß' },
              { value: '2xl', label: 'Extra groß' },
            ]}
            onChange={(size: any) => updateIconStyle({ size })}
          />
          <ThemeColorPicker
            label="Icon-Farbe"
            value={config.iconStyle.color}
            onChange={(color) => updateIconStyle({ color: color || { kind: 'custom', hex: '#000000' } })}
          />
          <Toggle
            label="Hintergrund aktivieren"
            value={config.iconStyle.backgroundEnabled}
            onChange={(backgroundEnabled) => updateIconStyle({ backgroundEnabled })}
          />
          {config.iconStyle.backgroundEnabled && (
            <>
              <ThemeColorPicker
                label="Hintergrundfarbe"
                value={config.iconStyle.backgroundColor ?? null}
                onChange={(backgroundColor) => updateIconStyle({ backgroundColor: backgroundColor === null ? undefined : backgroundColor })}
                allowNoColor
              />
              <Select
                label="Form"
                value={config.iconStyle.backgroundShape}
                options={[
                  { value: 'circle', label: 'Rund' },
                  { value: 'rounded', label: 'Rechteckig (abgerundet)' },
                  { value: 'square', label: 'Rechteckig' },
                ]}
                onChange={(backgroundShape: any) => updateIconStyle({ backgroundShape })}
              />
            </>
          )}
        </Section>

        {/* Price Style */}
        <Section 
          title="Preis-Styling" 
          icon={<DollarSign className="w-4 h-4" />} 
          nested
          toggleEnabled
          toggleValue={config.priceStyle.enabled}
          onToggleChange={(enabled) => updatePriceStyle({ enabled })}
        >
          <Select
            label="Position"
            value={config.priceStyle.position}
            options={[
              { value: 'top-right', label: 'Oben rechts (Badge)' },
              { value: 'below-title', label: 'Unter dem Titel' },
              { value: 'bottom', label: 'Unten' },
            ]}
            onChange={(position: any) => updatePriceStyle({ position })}
          />
          <ThemeColorPicker
            label="Farbe"
            value={config.priceStyle.color}
            onChange={(color) => updatePriceStyle({ color: color || { kind: 'custom', hex: '#000000' } })}
          />
        </Section>

        {/* Button Style */}
        <Section 
          title="Button-Styling" 
          icon={<MousePointer className="w-4 h-4" />} 
          nested
          toggleEnabled
          toggleValue={config.showButton}
          onToggleChange={(showButton) => updateConfig({ showButton })}
        >
          <Select
            label="Variante"
            value={config.buttonStyle.variant}
            options={[
              { value: 'filled', label: 'Gefüllt' },
              { value: 'outline', label: 'Umrandet' },
              { value: 'ghost', label: 'Transparent' },
              { value: 'link', label: 'Link' },
            ]}
            onChange={(variant: any) => updateButtonStyle({ variant })}
          />
          <ThemeColorPicker
            label="Hintergrundfarbe"
            value={config.buttonStyle.backgroundColor}
            onChange={(backgroundColor) => updateButtonStyle({ backgroundColor: backgroundColor === null ? undefined : backgroundColor })}
            allowNoColor
          />
          <Toggle
            label="Volle Breite"
            value={config.buttonStyle.fullWidth}
            onChange={(fullWidth) => updateButtonStyle({ fullWidth })}
          />
        </Section>
      </CollapsibleGroup>

      {/* Cards */}
      <Section title={`Karten (${config.items.length})`} icon={<Layout className="w-4 h-4" />} defaultOpen>
        <div className="space-y-3">
          {config.items.map((item, index) => (
            <CardItemEditor
              key={item.id}
              item={item}
              index={index}
              onChange={(updated) => updateItem(item.id, updated)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
          <button
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-rose-500 hover:text-rose-500 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Neue Karte hinzufügen
          </button>
        </div>
      </Section>
    </div>
  );
};
