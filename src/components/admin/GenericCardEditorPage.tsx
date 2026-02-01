// =====================================================
// GENERIC CARD EDITOR PAGE
// Editor für flexible Generic Cards mit Live-Preview
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  ChevronDown, ChevronUp, Image as ImageIcon, Type, Palette,
  Layout, DollarSign, Star, List, Share2, MousePointer, Settings
} from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';
import { MediaLibrary, MediaFile } from './MediaLibrary';
import { IconPicker } from './IconPicker';
import { RichTextInput } from './RichTextInput';
import {
  GenericCardConfig,
  GenericCardItem,
  createDefaultGenericCardConfig,
  createDefaultGenericCardItem,
} from '../../types/GenericCard';
import { GenericCard } from '../blocks/GenericCard';
import { ColorValue } from '../../types/theme';

// ===== COLOR PICKER =====

interface ColorPickerProps {
  label: string;
  value: ColorValue;
  onChange: (value: ColorValue) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const currentColor = value.kind === 'custom' ? value.hex : '#000000';

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={currentColor}
          onChange={(e) => onChange({ kind: 'custom', hex: e.target.value })}
          className="w-10 h-10 rounded border cursor-pointer"
        />
        <input
          type="text"
          value={currentColor}
          onChange={(e) => onChange({ kind: 'custom', hex: e.target.value })}
          className="flex-1 px-2 py-1 border rounded text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

// ===== SECTION COMPONENT =====

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2 font-medium text-gray-700">
          {icon}
          {title}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && <div className="p-4 space-y-4 border-t">{children}</div>}
    </div>
  );
};

// ===== SELECT COMPONENT =====

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

// ===== TEXT INPUT =====

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
    />
  </div>
);

// ===== NUMBER INPUT =====

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

// ===== TOGGLE =====

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

  // Features management
  const addFeature = () => {
    update({ features: [...(item.features || []), ''] });
  };

  const updateFeature = (idx: number, value: string) => {
    const newFeatures = [...(item.features || [])];
    newFeatures[idx] = value;
    update({ features: newFeatures });
  };

  const removeFeature = (idx: number) => {
    update({ features: (item.features || []).filter((_, i) => i !== idx) });
  };

  // Social links management
  const addSocialLink = () => {
    update({
      socialLinks: [...(item.socialLinks || []), { type: 'instagram', url: '' }],
    });
  };

  const updateSocialLink = (idx: number, updates: Partial<NonNullable<GenericCardItem['socialLinks']>[number]>) => {
    const newLinks = [...(item.socialLinks || [])];
    newLinks[idx] = { ...newLinks[idx], ...updates };
    update({ socialLinks: newLinks });
  };

  const removeSocialLink = (idx: number) => {
    update({ socialLinks: (item.socialLinks || []).filter((_, i) => i !== idx) });
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
        
        {/* Preview */}
        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
          {item.image ? (
            <img src={item.image} alt="" className="w-full h-full object-cover" />
          ) : item.icon ? (
            <span className="text-xs text-gray-500">{item.icon.slice(0, 3)}</span>
          ) : (
            <ImageIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.title || 'Neue Karte'}</p>
          <p className="text-xs text-gray-500 truncate">{item.subtitle || 'Kein Untertitel'}</p>
        </div>

        {item.highlighted && (
          <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs rounded">Hervorgehoben</span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Titel"
              value={item.title}
              onChange={(title) => update({ title })}
              placeholder="z.B. Premium Service"
            />
            <TextInput
              label="Untertitel"
              value={item.subtitle || ''}
              onChange={(subtitle) => update({ subtitle })}
              placeholder="z.B. Unser Bestseller"
            />
          </div>

          {/* Description with WYSIWYG */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Beschreibung</label>
            <RichTextInput
              value={item.description || ''}
              onChange={(description) => update({ description })}
              placeholder="Beschreibung eingeben..."
            />
          </div>

          {/* Media */}
          <div className="grid grid-cols-2 gap-4">
            {/* Image */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bild</label>
              {item.image ? (
                <div className="relative group">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setShowMediaLibrary(true)}
                      className="px-2 py-1 bg-white text-gray-800 rounded text-xs"
                    >
                      Ändern
                    </button>
                    <button
                      type="button"
                      onClick={() => update({ image: undefined })}
                      className="p-1 bg-red-500 text-white rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-rose-500 transition"
                >
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500">Bild auswählen</span>
                </button>
              )}
            </div>

            {/* Icon */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Icon (alternativ)</label>
              <IconPicker
                value={item.icon || 'Star'}
                onChange={(icon) => update({ icon })}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <NumberInput
              label="Preis (€)"
              value={item.price}
              onChange={(price) => update({ price })}
              placeholder="z.B. 49"
              min={0}
              step={0.01}
            />
            <TextInput
              label="Preis-Einheit"
              value={item.priceUnit || ''}
              onChange={(priceUnit) => update({ priceUnit })}
              placeholder="z.B. ab"
            />
            <NumberInput
              label="Alter Preis (€)"
              value={item.originalPrice}
              onChange={(originalPrice) => update({ originalPrice })}
              placeholder="z.B. 69"
              min={0}
            />
          </div>

          {/* Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bewertung (1-5)</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={item.rating || 0}
                onChange={(e) => update({ rating: Number(e.target.value) || undefined })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{item.rating || 'Keine'} Sterne</span>
            </div>
            <NumberInput
              label="Anzahl Bewertungen"
              value={item.ratingCount}
              onChange={(ratingCount) => update({ ratingCount })}
              placeholder="z.B. 42"
              min={0}
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Features/Vorteile</label>
            <div className="space-y-2">
              {(item.features || []).map((feature, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder="z.B. Kostenlose Beratung"
                    className="flex-1 px-3 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={() => removeFeature(idx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addFeature}
                className="text-sm text-rose-500 hover:text-rose-600"
              >
                + Feature hinzufügen
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Button-Text"
              value={item.ctaText || ''}
              onChange={(ctaText) => update({ ctaText })}
              placeholder="z.B. Jetzt buchen"
            />
            <TextInput
              label="Button-Link"
              value={item.ctaUrl || ''}
              onChange={(ctaUrl) => update({ ctaUrl })}
              placeholder="z.B. /kontakt"
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Social Links</label>
            <div className="space-y-2">
              {(item.socialLinks || []).map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <select
                    value={link.type}
                    onChange={(e) => updateSocialLink(idx, { type: e.target.value as any })}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="email">E-Mail</option>
                    <option value="phone">Telefon</option>
                    <option value="website">Website</option>
                  </select>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateSocialLink(idx, { url: e.target.value })}
                    placeholder="URL/Adresse"
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={() => removeSocialLink(idx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addSocialLink}
                className="text-sm text-rose-500 hover:text-rose-600"
              >
                + Social Link hinzufügen
              </button>
            </div>
          </div>

          {/* Highlight */}
          <Toggle
            label="Als hervorgehoben markieren"
            value={item.highlighted || false}
            onChange={(highlighted) => update({ highlighted })}
          />
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] overflow-hidden">
            <MediaLibrary
              mode="select"
              singleSelect={true}
              onSelect={handleMediaSelect}
              onCancel={() => setShowMediaLibrary(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ===== MAIN EDITOR =====

export const GenericCardEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { pageId, blockId } = useParams<{ pageId: string; blockId: string }>();
  const { website, updatePages, loading } = useWebsite();

  const [config, setConfig] = useState<GenericCardConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialConfig, setInitialConfig] = useState<string>('');

  // Load config
  useEffect(() => {
    if (!loading && website && pageId && blockId) {
      const page = website.pages.find((p) => p.id === pageId);
      const block = page?.blocks.find((b) => b.id === blockId);

      const loadedConfig = block?.config
        ? { ...createDefaultGenericCardConfig(), ...block.config }
        : createDefaultGenericCardConfig();

      setConfig(loadedConfig);
      setInitialConfig(JSON.stringify(loadedConfig));
    }
  }, [loading, website, pageId, blockId]);

  // Track changes
  useEffect(() => {
    if (config && initialConfig) {
      setHasChanges(JSON.stringify(config) !== initialConfig);
    }
  }, [config, initialConfig]);

  // Update helpers
  const updateConfig = (updates: Partial<GenericCardConfig>) => {
    setConfig((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updateCardStyle = (updates: Partial<GenericCardConfig['cardStyle']>) => {
    setConfig((prev) =>
      prev ? { ...prev, cardStyle: { ...prev.cardStyle, ...updates } } : null
    );
  };

  const _updateTextStyle = (updates: Partial<GenericCardConfig['textStyle']>) => {
    setConfig((prev) =>
      prev ? { ...prev, textStyle: { ...prev.textStyle, ...updates } } : null
    );
  };
  // Keep for future use
  void _updateTextStyle;

  const updateSectionStyle = (updates: Partial<GenericCardConfig['sectionStyle']>) => {
    setConfig((prev) =>
      prev ? { ...prev, sectionStyle: { ...prev.sectionStyle, ...updates } } : null
    );
  };

  const updateIconStyle = (updates: Partial<GenericCardConfig['iconStyle']>) => {
    setConfig((prev) =>
      prev ? { ...prev, iconStyle: { ...prev.iconStyle, ...updates } } : null
    );
  };

  const updatePriceStyle = (updates: Partial<GenericCardConfig['priceStyle']>) => {
    setConfig((prev) =>
      prev ? { ...prev, priceStyle: { ...prev.priceStyle, ...updates } } : null
    );
  };

  const updateRatingStyle = (updates: Partial<GenericCardConfig['ratingStyle']>) => {
    setConfig((prev) =>
      prev ? { ...prev, ratingStyle: { ...prev.ratingStyle, ...updates } } : null
    );
  };

  const updateFeaturesStyle = (updates: Partial<GenericCardConfig['featuresStyle']>) => {
    setConfig((prev) =>
      prev ? { ...prev, featuresStyle: { ...prev.featuresStyle, ...updates } } : null
    );
  };

  const updateSocialStyle = (updates: Partial<GenericCardConfig['socialStyle']>) => {
    setConfig((prev) =>
      prev ? { ...prev, socialStyle: { ...prev.socialStyle, ...updates } } : null
    );
  };

  const updateButtonStyle = (updates: Partial<GenericCardConfig['buttonStyle']>) => {
    setConfig((prev) =>
      prev ? { ...prev, buttonStyle: { ...prev.buttonStyle, ...updates } } : null
    );
  };

  const updateGrid = (updates: Partial<GenericCardConfig['grid']>) => {
    setConfig((prev) =>
      prev ? { ...prev, grid: { ...prev.grid, ...updates } } : null
    );
  };

  // Item management
  const addItem = () => {
    if (!config) return;
    const newItem = {
      ...createDefaultGenericCardItem(),
      order: config.items.length,
    };
    updateConfig({ items: [...config.items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<GenericCardItem>) => {
    if (!config) return;
    updateConfig({
      items: config.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const deleteItem = (id: string) => {
    if (!config) return;
    updateConfig({
      items: config.items.filter((item) => item.id !== id),
    });
  };

  // Save
  const handleSave = async () => {
    if (!config || !website || !pageId || !blockId) return;

    setSaving(true);
    try {
      const updatedPages = website.pages.map((page) => {
        if (page.id !== pageId) return page;
        return {
          ...page,
          blocks: page.blocks.map((block) => {
            if (block.id !== blockId) return block;
            return { ...block, config };
          }),
        };
      });

      await updatePages(updatedPages);
      setInitialConfig(JSON.stringify(config));
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/admin/pages/${pageId}/blocks`)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Generic Card Editor</h1>
              <p className="text-sm text-gray-500">Flexible Karten für jeden Zweck</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
              hasChanges && !saving
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Speichern
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 140px)' }}>
            {/* Editor Panel - 55% */}
            <div className="w-[55%] space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
              {/* Section Settings */}
              <Section title="Bereich-Einstellungen" icon={<Settings className="w-4 h-4" />}>
                <Toggle
                  label="Header anzeigen"
                  value={config.sectionStyle.showHeader}
                  onChange={(showHeader) => updateSectionStyle({ showHeader })}
                />
                {config.sectionStyle.showHeader && (
                  <>
                    <TextInput
                      label="Titel"
                      value={config.sectionStyle.title || ''}
                      onChange={(title) => updateSectionStyle({ title })}
                    />
                    <TextInput
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
                <ColorPicker
                  label="Hintergrundfarbe"
                  value={config.sectionStyle.backgroundColor}
                  onChange={(backgroundColor) => updateSectionStyle({ backgroundColor })}
                />
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

              {/* Card Style */}
              <Section title="Karten-Styling" icon={<Palette className="w-4 h-4" />}>
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker
                    label="Hintergrundfarbe"
                    value={config.cardStyle.backgroundColor}
                    onChange={(backgroundColor) => updateCardStyle({ backgroundColor })}
                  />
                  <ColorPicker
                    label="Rahmenfarbe"
                    value={config.cardStyle.borderColor}
                    onChange={(borderColor) => updateCardStyle({ borderColor })}
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
                <Select
                  label="Hover-Effekt"
                  value={config.cardStyle.hoverEffect}
                  options={[
                    { value: 'none', label: 'Keiner' },
                    { value: 'lift', label: 'Anheben' },
                    { value: 'glow', label: 'Leuchten' },
                    { value: 'scale', label: 'Vergrößern' },
                    { value: 'border', label: 'Rahmen' },
                  ]}
                  onChange={(hoverEffect: any) => updateCardStyle({ hoverEffect })}
                />
              </Section>

              {/* Content Options */}
              <Section title="Inhalt anzeigen" icon={<Type className="w-4 h-4" />}>
                <div className="grid grid-cols-2 gap-4">
                  <Toggle
                    label="Bild anzeigen"
                    value={config.showImage}
                    onChange={(showImage) => updateConfig({ showImage })}
                  />
                  <Toggle
                    label="Untertitel anzeigen"
                    value={config.showSubtitle}
                    onChange={(showSubtitle) => updateConfig({ showSubtitle })}
                  />
                  <Toggle
                    label="Beschreibung anzeigen"
                    value={config.showDescription}
                    onChange={(showDescription) => updateConfig({ showDescription })}
                  />
                  <Toggle
                    label="Button anzeigen"
                    value={config.showButton}
                    onChange={(showButton) => updateConfig({ showButton })}
                  />
                </div>
              </Section>

              {/* Icon Style */}
              <Section title="Icon-Styling" icon={<Star className="w-4 h-4" />}>
                <Toggle
                  label="Icon aktivieren"
                  value={config.iconStyle.enabled}
                  onChange={(enabled) => updateIconStyle({ enabled })}
                />
                {config.iconStyle.enabled && (
                  <>
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
                    <ColorPicker
                      label="Farbe"
                      value={config.iconStyle.color}
                      onChange={(color) => updateIconStyle({ color })}
                    />
                    <Toggle
                      label="Hintergrund aktivieren"
                      value={config.iconStyle.backgroundEnabled}
                      onChange={(backgroundEnabled) => updateIconStyle({ backgroundEnabled })}
                    />
                  </>
                )}
              </Section>

              {/* Price Style */}
              <Section title="Preis-Styling" icon={<DollarSign className="w-4 h-4" />}>
                <Toggle
                  label="Preis anzeigen"
                  value={config.priceStyle.enabled}
                  onChange={(enabled) => updatePriceStyle({ enabled })}
                />
                {config.priceStyle.enabled && (
                  <>
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
                    <ColorPicker
                      label="Farbe"
                      value={config.priceStyle.color}
                      onChange={(color) => updatePriceStyle({ color })}
                    />
                    <Toggle
                      label="Alten Preis anzeigen"
                      value={config.priceStyle.showOriginalPrice}
                      onChange={(showOriginalPrice) => updatePriceStyle({ showOriginalPrice })}
                    />
                  </>
                )}
              </Section>

              {/* Rating Style */}
              <Section title="Bewertungs-Styling" icon={<Star className="w-4 h-4" />}>
                <Toggle
                  label="Bewertung anzeigen"
                  value={config.ratingStyle.enabled}
                  onChange={(enabled) => updateRatingStyle({ enabled })}
                />
                {config.ratingStyle.enabled && (
                  <>
                    <Select
                      label="Stil"
                      value={config.ratingStyle.style}
                      options={[
                        { value: 'stars', label: 'Sterne' },
                        { value: 'hearts', label: 'Herzen' },
                        { value: 'numbers', label: 'Zahlen' },
                      ]}
                      onChange={(style: any) => updateRatingStyle({ style })}
                    />
                    <ColorPicker
                      label="Gefüllte Farbe"
                      value={config.ratingStyle.filledColor}
                      onChange={(filledColor) => updateRatingStyle({ filledColor })}
                    />
                  </>
                )}
              </Section>

              {/* Features Style */}
              <Section title="Features-Styling" icon={<List className="w-4 h-4" />}>
                <Toggle
                  label="Features anzeigen"
                  value={config.featuresStyle.enabled}
                  onChange={(enabled) => updateFeaturesStyle({ enabled })}
                />
                {config.featuresStyle.enabled && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Feature-Icon</label>
                      <IconPicker
                        value={config.featuresStyle.icon}
                        onChange={(icon) => updateFeaturesStyle({ icon })}
                      />
                    </div>
                    <ColorPicker
                      label="Icon-Farbe"
                      value={config.featuresStyle.iconColor}
                      onChange={(iconColor) => updateFeaturesStyle({ iconColor })}
                    />
                  </>
                )}
              </Section>

              {/* Social Style */}
              <Section title="Social-Styling" icon={<Share2 className="w-4 h-4" />}>
                <Toggle
                  label="Social Links anzeigen"
                  value={config.socialStyle.enabled}
                  onChange={(enabled) => updateSocialStyle({ enabled })}
                />
                {config.socialStyle.enabled && (
                  <>
                    <Select
                      label="Stil"
                      value={config.socialStyle.iconStyle}
                      options={[
                        { value: 'filled', label: 'Gefüllt' },
                        { value: 'outline', label: 'Umrandet' },
                        { value: 'ghost', label: 'Transparent' },
                      ]}
                      onChange={(iconStyle: any) => updateSocialStyle({ iconStyle })}
                    />
                    <ColorPicker
                      label="Farbe"
                      value={config.socialStyle.iconColor}
                      onChange={(iconColor) => updateSocialStyle({ iconColor })}
                    />
                  </>
                )}
              </Section>

              {/* Button Style */}
              {config.showButton && (
                <Section title="Button-Styling" icon={<MousePointer className="w-4 h-4" />}>
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
                  <ColorPicker
                    label="Hintergrundfarbe"
                    value={config.buttonStyle.backgroundColor}
                    onChange={(backgroundColor) => updateButtonStyle({ backgroundColor })}
                  />
                  <ColorPicker
                    label="Textfarbe"
                    value={config.buttonStyle.textColor}
                    onChange={(textColor) => updateButtonStyle({ textColor })}
                  />
                  <Toggle
                    label="Volle Breite"
                    value={config.buttonStyle.fullWidth}
                    onChange={(fullWidth) => updateButtonStyle({ fullWidth })}
                  />
                </Section>
              )}

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

            {/* Preview Panel - 45% */}
            <div className="w-[45%]">
              <div className="sticky top-24 bg-white rounded-xl shadow-lg border overflow-hidden">
                <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">Live-Vorschau</h3>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Aktualisiert automatisch
                  </span>
                </div>
                <div
                  className="overflow-y-auto bg-gray-100"
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                >
                  <div className="transform scale-[0.85] origin-top">
                    <GenericCard config={config} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericCardEditorPage;
