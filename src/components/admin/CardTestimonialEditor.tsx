// =====================================================
// CARD TESTIMONIAL EDITOR
// Admin-Editor für Bewertungs-Karten-Konfiguration
// =====================================================

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  GripVertical,
  Image as ImageIcon,
  Star,
  Quote
} from 'lucide-react';
import {
  CardTestimonialConfig,
  TestimonialItem,
  BorderRadius,
  Shadow,
  Spacing,
  FontSize,
  BORDER_RADIUS_VALUES,
  SHADOW_VALUES,
  SPACING_VALUES,
  FONT_SIZE_VALUES
} from '../../types/Cards';
import { ColorValue } from '../../types/theme';

// ===== SECTION COMPONENT =====

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200 space-y-4">
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            className="w-12 h-10 p-1 rounded-lg border border-gray-300 cursor-pointer"
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
        className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <InputComponent
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 4 : undefined}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
      />
    </div>
  );
};

// ===== STAR RATING INPUT =====

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? star - 0.5 : star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="p-0.5 transition"
        >
          <Star
            className={`w-6 h-6 ${
              (hovered !== null ? star <= hovered : star <= value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500">{value}/5</span>
    </div>
  );
};

// ===== TESTIMONIAL ITEM EDITOR =====

interface TestimonialItemEditorProps {
  item: TestimonialItem;
  onChange: (item: TestimonialItem) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const TestimonialItemEditor: React.FC<TestimonialItemEditorProps> = ({
  item,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const update = (updates: Partial<TestimonialItem>) => {
    onChange({ ...item, ...updates });
  };

  const sourceOptions = [
    { value: 'google' as const, label: 'Google' },
    { value: 'facebook' as const, label: 'Facebook' },
    { value: 'yelp' as const, label: 'Yelp' },
    { value: 'custom' as const, label: 'Keine Quelle' }
  ];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-gray-50">
        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
        
        {/* Image Preview */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {item.image ? (
            <img src={item.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <Quote className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.author || 'Neuer Kunde'}</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= (item.rating || 0)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onMoveUp && (
            <button onClick={onMoveUp} className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          {onMoveDown && (
            <button onClick={onMoveDown} className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-gray-200">
          <TextInput
            label="Zitat / Bewertungstext"
            value={item.quote}
            onChange={(quote) => update({ quote })}
            placeholder="Was sagt der Kunde..."
            multiline
          />

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Name"
              value={item.author}
              onChange={(author) => update({ author })}
              placeholder="z.B. Maria S."
            />
            <TextInput
              label="Rolle / Titel"
              value={item.role || ''}
              onChange={(role) => update({ role })}
              placeholder="z.B. Stammkundin"
            />
          </div>

          <TextInput
            label="Firma / Ort"
            value={item.company || ''}
            onChange={(company) => update({ company })}
            placeholder="z.B. Hannover"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bewertung</label>
            <StarRatingInput
              value={item.rating || 5}
              onChange={(rating) => update({ rating })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profilbild</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={item.image || ''}
                onChange={(e) => update({ image: e.target.value })}
                placeholder="Bild-URL"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <button
                onClick={() => {/* TODO: Open media library */}}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Quelle"
              value={item.source || 'custom'}
              onChange={(source) => update({ source })}
              options={sourceOptions}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
              <input
                type="date"
                value={item.date || ''}
                onChange={(e) => update({ date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== MAIN EDITOR =====

interface CardTestimonialEditorProps {
  config: CardTestimonialConfig;
  onChange: (config: CardTestimonialConfig) => void;
}

export const CardTestimonialEditor: React.FC<CardTestimonialEditorProps> = ({ config, onChange }) => {
  // Update helpers
  const updateConfig = (updates: Partial<CardTestimonialConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateCardStyle = (updates: Partial<CardTestimonialConfig['cardStyle']>) => {
    onChange({ ...config, cardStyle: { ...config.cardStyle, ...updates } });
  };

  const updateGrid = (updates: Partial<CardTestimonialConfig['grid']>) => {
    onChange({ ...config, grid: { ...config.grid, ...updates } });
  };

  const updateSectionStyle = (updates: Partial<CardTestimonialConfig['sectionStyle']>) => {
    onChange({ ...config, sectionStyle: { ...config.sectionStyle, ...updates } });
  };

  // Testimonial management
  const addTestimonial = () => {
    const newTestimonial: TestimonialItem = {
      id: crypto.randomUUID(),
      quote: '',
      author: '',
      rating: 5,
      order: config.testimonials.length + 1
    };
    updateConfig({ testimonials: [...config.testimonials, newTestimonial] });
  };

  const updateTestimonial = (id: string, item: TestimonialItem) => {
    updateConfig({
      testimonials: config.testimonials.map((t) => (t.id === id ? item : t))
    });
  };

  const deleteTestimonial = (id: string) => {
    updateConfig({
      testimonials: config.testimonials.filter((t) => t.id !== id)
    });
  };

  const moveTestimonial = (id: string, direction: 'up' | 'down') => {
    const index = config.testimonials.findIndex((t) => t.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.testimonials.length) return;

    const newTestimonials = [...config.testimonials];
    [newTestimonials[index], newTestimonials[newIndex]] = [newTestimonials[newIndex], newTestimonials[index]];
    newTestimonials.forEach((t, i) => (t.order = i + 1));
    updateConfig({ testimonials: newTestimonials });
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

  const layoutOptions = [
    { value: 'grid' as const, label: 'Raster' },
    { value: 'carousel' as const, label: 'Karussell' },
    { value: 'single' as const, label: 'Einzeln (Featured)' },
    { value: 'masonry' as const, label: 'Masonry' }
  ];

  const hoverEffectOptions = [
    { value: 'none' as const, label: 'Keiner' },
    { value: 'lift' as const, label: 'Anheben' },
    { value: 'glow' as const, label: 'Glühen' },
    { value: 'scale' as const, label: 'Skalieren' },
    { value: 'border' as const, label: 'Rahmen' }
  ];

  const quoteStyleOptions = [
    { value: 'simple' as const, label: 'Einfach' },
    { value: 'with-icon' as const, label: 'Mit Icon' },
    { value: 'highlighted' as const, label: 'Hervorgehoben' }
  ];

  const ratingStyleOptions = [
    { value: 'stars' as const, label: 'Sterne' },
    { value: 'numbers' as const, label: 'Zahlen' },
    { value: 'both' as const, label: 'Beides' }
  ];

  const authorLayoutOptions = [
    { value: 'inline' as const, label: 'Inline' },
    { value: 'stacked' as const, label: 'Gestapelt' },
    { value: 'left-aligned' as const, label: 'Linksbündig' }
  ];

  const authorImageSizeOptions = [
    { value: 'sm' as const, label: 'Klein (40px)' },
    { value: 'md' as const, label: 'Mittel (56px)' },
    { value: 'lg' as const, label: 'Groß (72px)' }
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
      {/* Testimonials Section */}
      <Section title="Bewertungen" defaultOpen={true}>
        <div className="space-y-3">
          {config.testimonials
            .sort((a, b) => a.order - b.order)
            .map((testimonial, idx) => (
              <TestimonialItemEditor
                key={testimonial.id}
                item={testimonial}
                onChange={(item) => updateTestimonial(testimonial.id, item)}
                onDelete={() => deleteTestimonial(testimonial.id)}
                onMoveUp={idx > 0 ? () => moveTestimonial(testimonial.id, 'up') : undefined}
                onMoveDown={
                  idx < config.testimonials.length - 1
                    ? () => moveTestimonial(testimonial.id, 'down')
                    : undefined
                }
              />
            ))}
        </div>
        <button
          onClick={addTestimonial}
          className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-rose-500 hover:text-rose-500 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Bewertung hinzufügen
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

        {config.layout === 'grid' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput
                label="Spalten (Desktop)"
                value={config.grid.columns.desktop}
                onChange={(v) =>
                  updateGrid({ columns: { ...config.grid.columns, desktop: v } })
                }
                min={1}
                max={4}
              />
              <NumberInput
                label="Spalten (Tablet)"
                value={config.grid.columns.tablet ?? config.grid.columns.desktop}
                onChange={(v) =>
                  updateGrid({ columns: { ...config.grid.columns, tablet: v } })
                }
                min={1}
                max={3}
              />
              <NumberInput
                label="Spalten (Mobile)"
                value={config.grid.columns.mobile ?? 1}
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
          </>
        )}

        {config.layout === 'carousel' && (
          <>
            <Checkbox
              label="Autoplay aktivieren"
              checked={config.autoplay || false}
              onChange={(autoplay) => updateConfig({ autoplay })}
            />
            {config.autoplay && (
              <NumberInput
                label="Autoplay-Intervall (ms)"
                value={config.autoplayInterval || 5000}
                onChange={(autoplayInterval) => updateConfig({ autoplayInterval })}
                min={2000}
                max={15000}
                step={500}
              />
            )}
          </>
        )}
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
            max={8}
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
            min={0}
            max={1000}
            step={50}
          />
        </div>
      </Section>

      {/* Quote Style Section */}
      <Section title="Zitat-Styling">
        <Select
          label="Zitat-Stil"
          value={config.quoteStyle}
          onChange={(quoteStyle) => updateConfig({ quoteStyle })}
          options={quoteStyleOptions}
        />

        {config.quoteStyle !== 'simple' && (
          <ColorPicker
            label="Icon-Farbe"
            value={config.quoteIconColor}
            onChange={(quoteIconColor) => updateConfig({ quoteIconColor })}
          />
        )}

        <Select
          label="Zitat-Größe"
          value={config.quoteSize}
          onChange={(quoteSize) => updateConfig({ quoteSize })}
          options={fontSizeOptions}
        />

        <ColorPicker
          label="Zitat-Farbe"
          value={config.quoteColor}
          onChange={(quoteColor) => updateConfig({ quoteColor })}
        />

        <Checkbox
          label="Kursiv"
          checked={config.quoteItalic}
          onChange={(quoteItalic) => updateConfig({ quoteItalic })}
        />
      </Section>

      {/* Author Style Section */}
      <Section title="Autor-Styling">
        <Checkbox
          label="Autor-Bild anzeigen"
          checked={config.showAuthorImage}
          onChange={(showAuthorImage) => updateConfig({ showAuthorImage })}
        />

        {config.showAuthorImage && (
          <>
            <Select
              label="Bild-Größe"
              value={config.authorImageSize}
              onChange={(authorImageSize) => updateConfig({ authorImageSize })}
              options={authorImageSizeOptions}
            />
            <Select
              label="Bild-Radius"
              value={config.authorImageBorderRadius}
              onChange={(authorImageBorderRadius) => updateConfig({ authorImageBorderRadius })}
              options={borderRadiusOptions}
            />
          </>
        )}

        <Select
          label="Autor-Layout"
          value={config.authorLayout}
          onChange={(authorLayout) => updateConfig({ authorLayout })}
          options={authorLayoutOptions}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Name-Größe"
            value={config.authorNameSize}
            onChange={(authorNameSize) => updateConfig({ authorNameSize })}
            options={fontSizeOptions}
          />
          <ColorPicker
            label="Name-Farbe"
            value={config.authorNameColor}
            onChange={(authorNameColor) => updateConfig({ authorNameColor })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Rolle-Größe"
            value={config.authorRoleSize}
            onChange={(authorRoleSize) => updateConfig({ authorRoleSize })}
            options={fontSizeOptions}
          />
          <ColorPicker
            label="Rolle-Farbe"
            value={config.authorRoleColor}
            onChange={(authorRoleColor) => updateConfig({ authorRoleColor })}
          />
        </div>
      </Section>

      {/* Rating Style Section */}
      <Section title="Bewertungs-Styling">
        <Checkbox
          label="Bewertung anzeigen"
          checked={config.showRating}
          onChange={(showRating) => updateConfig({ showRating })}
        />

        {config.showRating && (
          <>
            <Select
              label="Bewertungs-Stil"
              value={config.ratingStyle}
              onChange={(ratingStyle) => updateConfig({ ratingStyle })}
              options={ratingStyleOptions}
            />

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Stern-Farbe"
                value={config.ratingColor}
                onChange={(ratingColor) => updateConfig({ ratingColor })}
              />
              <ColorPicker
                label="Leere-Stern-Farbe"
                value={config.ratingEmptyColor}
                onChange={(ratingEmptyColor) => updateConfig({ ratingEmptyColor })}
              />
            </div>
          </>
        )}

        <Checkbox
          label="Quelle anzeigen (Google, Facebook, etc.)"
          checked={config.showSource}
          onChange={(showSource) => updateConfig({ showSource })}
        />
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
              placeholder="z.B. Das sagen unsere Kunden"
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
              placeholder="z.B. Echte Bewertungen von zufriedenen Kunden"
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

export default CardTestimonialEditor;
