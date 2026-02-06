// =====================================================
// GENERIC CARD EDITOR PAGE
// Editor für flexible Generic Cards mit Live-Preview
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  ChevronDown, ChevronUp, Image as ImageIcon, Type, Palette,
  Layout, DollarSign, Star, List, Share2, MousePointer, Settings, Maximize2,
  Info, RefreshCw
} from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';
import { supabase } from '../../lib/supabase';
import { MediaLibrary, MediaFile } from './MediaLibrary';
import { IconPicker } from './IconPicker';
import { RichTextInput } from './RichTextInput';
import { ThemeColorPicker } from './ThemeColorPicker';
import { FontPicker } from './FontPicker';
import { FontPickerWithSize } from './FontPickerWithSize';
import { CardPreviewModal } from './CardPreviewModal';
import { useConfirmDialog } from './ConfirmDialog';
import {
  GenericCardConfig,
  GenericCardItem,
  CardTypographyConfig,
  ImageElementStyle,
  OverlineStyle,
  TitleStyle,
  SubtitleStyle,
  DescriptionStyle,
  createDefaultGenericCardConfig,
  createDefaultGenericCardItem,
  createDefaultCardTypography,
  createDefaultImageElementStyle,
  createDefaultOverlineStyle,
  createDefaultTitleStyle,
  createDefaultSubtitleStyle,
  createDefaultDescriptionStyle,
} from '../../types/GenericCard';
import { GenericCard } from '../blocks/GenericCard';

// ===== SECTION COMPONENT =====

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  nested?: boolean;
  // Optional toggle in header
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

// ===== COLLAPSIBLE GROUP =====

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
            <RichTextInput
              label="Overline"
              value={item.overline || ''}
              onChange={(overline) => update({ overline })}
              placeholder="z.B. PREMIUM"
            />
            <RichTextInput
              label="Titel"
              value={item.title}
              onChange={(title) => update({ title })}
              placeholder="z.B. Premium Service"
            />
          </div>
          <RichTextInput
            label="Untertitel"
            value={item.subtitle || ''}
            onChange={(subtitle) => update({ subtitle })}
            placeholder="z.B. Unser Bestseller"
          />

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
            <RichTextInput
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
            <RichTextInput
              label="Button-Text"
              value={item.ctaText || ''}
              onChange={(ctaText) => update({ ctaText })}
              placeholder="z.B. Jetzt buchen"
            />
            <RichTextInput
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
  const { Dialog, confirm, success: showSuccess, error: showError } = useConfirmDialog();

  const [config, setConfig] = useState<GenericCardConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialConfig, setInitialConfig] = useState<string>('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [templateInfo, setTemplateInfo] = useState<{ id: string; name: string; category: string } | null>(null);
  const [customized, setCustomized] = useState(false);
  const [resetting, setResetting] = useState(false);

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

      // Load template info if available
      if (block?.templateId && block?.templateName) {
        setTemplateInfo({
          id: block.templateId,
          name: block.templateName,
          category: block.templateCategory || '',
        });
        setCustomized(block.customized !== false); // Default to false if not set
      } else {
        setTemplateInfo(null);
        setCustomized(true); // No template = custom
      }
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

  const updateTypography = (updates: Partial<CardTypographyConfig>) => {
    setConfig((prev) =>
      prev ? { 
        ...prev, 
        typography: { 
          ...(prev.typography || createDefaultCardTypography()), 
          ...updates 
        } 
      } : null
    );
  };

  const updateImageElementStyle = (updates: Partial<ImageElementStyle>) => {
    setConfig((prev) =>
      prev ? { 
        ...prev, 
        imageElementStyle: { 
          ...(prev.imageElementStyle || createDefaultImageElementStyle()), 
          ...updates 
        } 
      } : null
    );
  };

  const updateOverlineStyle = (updates: Partial<OverlineStyle>) => {
    setConfig((prev) =>
      prev ? { 
        ...prev, 
        overlineStyle: { 
          ...(prev.overlineStyle || createDefaultOverlineStyle()), 
          ...updates 
        } 
      } : null
    );
  };

  const updateTitleStyle = (updates: Partial<TitleStyle>) => {
    setConfig((prev) =>
      prev ? { 
        ...prev, 
        titleStyle: { 
          ...(prev.titleStyle || createDefaultTitleStyle()), 
          ...updates 
        } 
      } : null
    );
  };

  const updateSubtitleStyle = (updates: Partial<SubtitleStyle>) => {
    setConfig((prev) =>
      prev ? { 
        ...prev, 
        subtitleStyle: { 
          ...(prev.subtitleStyle || createDefaultSubtitleStyle()), 
          ...updates 
        } 
      } : null
    );
  };

  const updateDescriptionStyle = (updates: Partial<DescriptionStyle>) => {
    setConfig((prev) =>
      prev ? { 
        ...prev, 
        descriptionStyle: { 
          ...(prev.descriptionStyle || createDefaultDescriptionStyle()), 
          ...updates 
        } 
      } : null
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

  // Reset to template
  const handleResetToTemplate = async () => {
    if (!templateInfo || !website || !pageId || !blockId) return;

    await confirm(
      'Zur Vorlage zurückkehren',
      `Möchten Sie alle Änderungen verwerfen und zur Vorlage "${templateInfo.name}" zurückkehren? Dies kann nicht rückgängig gemacht werden.`,
      async () => {
        setResetting(true);
        try {
          // Fetch template from database
          const { data: template, error } = await supabase
            .from('card_templates')
            .select('*')
            .eq('id', templateInfo.id)
            .single();

          if (error || !template) {
            console.error('Error fetching template:', error);
            await showError('Fehler', 'Fehler beim Laden der Vorlage!');
            return;
          }

          // Update config with template config
          const templateConfig = template.config as GenericCardConfig;
          setConfig(templateConfig);

          // Update the block with template config and reset customized flag
          const updatedPages = website.pages.map((page) => {
            if (page.id !== pageId) return page;
            return {
              ...page,
              blocks: page.blocks.map((block) => {
                if (block.id !== blockId) return block;
                return {
                  ...block,
                  config: templateConfig,
                  customized: false,
                };
              }),
            };
          });

          await updatePages(updatedPages);
          setInitialConfig(JSON.stringify(templateConfig));
          setCustomized(false);
          setHasChanges(false);
          await showSuccess('Erfolgreich', 'Erfolgreich zur Vorlage zurückgesetzt!');
        } catch (error) {
          console.error('Error resetting to template:', error);
          await showError('Fehler', 'Fehler beim Zurücksetzen!');
        } finally {
          setResetting(false);
        }
      },
      { isDangerous: true, confirmText: 'Zurücksetzen' }
    );
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
            return {
              ...block,
              config,
              // Mark as customized if template exists and changes are made
              ...(templateInfo && { customized: true }),
            };
          }),
        };
      });

      await updatePages(updatedPages);
      setInitialConfig(JSON.stringify(config));
      setHasChanges(false);
      // Mark as customized locally after save
      if (templateInfo) {
        setCustomized(true);
      }
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
      <Dialog />
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/pages')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Generic Card Editor</h1>
              <p className="text-sm text-gray-500">Flexible Karten für jeden Zweck</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Maximize2 className="w-4 h-4" />
              Responsive Vorschau
            </button>
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
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="max-w-[1800px] mx-auto px-6">
          {/* Template Info Banner */}
          {templateInfo && (
            <div className={`mb-4 p-4 rounded-lg border-2 flex items-start gap-3 ${
              customized 
                ? 'bg-amber-50 border-amber-300' 
                : 'bg-blue-50 border-blue-300'
            }`}>
              <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                customized ? 'text-amber-600' : 'text-blue-600'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${
                    customized ? 'text-amber-900' : 'text-blue-900'
                  }`}>
                    {customized ? 'Angepasste Karte' : 'Basiert auf Vorlage'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    customized 
                      ? 'bg-amber-200 text-amber-800' 
                      : 'bg-blue-200 text-blue-800'
                  }`}>
                    {templateInfo.name}
                  </span>
                  {templateInfo.category && (
                    <span className="text-xs text-gray-500">
                      ({templateInfo.category})
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-1 ${
                  customized ? 'text-amber-700' : 'text-blue-700'
                }`}>
                  {customized 
                    ? 'Diese Karte basiert auf einer Vorlage, wurde aber angepasst. Sie k\u00f6nnen alle \u00c4nderungen verwerfen und zur urspr\u00fcnglichen Vorlage zur\u00fcckkehren.'
                    : 'Diese Karte verwendet die Vorlage ohne \u00c4nderungen. \u00c4nderungen werden beim Speichern als Anpassung markiert.'}
                </p>
              </div>
              {customized && (
                <button
                  onClick={handleResetToTemplate}
                  disabled={resetting}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
                >
                  {resetting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Zur\u00fccksetzen...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Zur Vorlage zur\u00fccksetzen
                    </>
                  )}
                </button>
              )}
            </div>
          )}

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

                {/* Section Typography */}
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
                      <Select
                        label="Text-Schriftstärke"
                        value={String(config.typography.bodyWeight || 400)}
                        options={[
                          { value: '300', label: 'Light (300)' },
                          { value: '400', label: 'Normal (400)' },
                          { value: '500', label: 'Medium (500)' },
                          { value: '600', label: 'Semibold (600)' },
                          { value: '700', label: 'Bold (700)' },
                        ]}
                        onChange={(val) => updateTypography({ bodyWeight: Number(val) })}
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

              {/* ===== STYLING GROUP ===== */}
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
                      label="Rahmenbreite"
                      value={String(config.cardStyle.borderWidth ?? 0)}
                      options={[
                        { value: '0', label: '0px (Keine)' },
                        { value: '1', label: '1px' },
                        { value: '2', label: '2px' },
                        { value: '3', label: '3px' },
                        { value: '4', label: '4px' },
                      ]}
                      onChange={(borderWidth: any) => updateCardStyle({ borderWidth: Number(borderWidth) as 0 | 1 | 2 | 3 | 4 })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                  <NumberInput
                    label="Abstand nach unten (Margin in px)"
                    value={config.overlineStyle?.marginBottom ?? 8}
                    onChange={(marginBottom) => updateOverlineStyle({ marginBottom: marginBottom ?? 8 })}
                    min={0}
                    placeholder="8"
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
                  <NumberInput
                    label="Abstand nach unten (Margin in px)"
                    value={config.titleStyle?.marginBottom ?? 8}
                    onChange={(marginBottom) => updateTitleStyle({ marginBottom: marginBottom ?? 8 })}
                    min={0}
                    placeholder="8"
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
                  <NumberInput
                    label="Abstand nach unten (Margin in px)"
                    value={config.subtitleStyle?.marginBottom ?? 12}
                    onChange={(marginBottom) => updateSubtitleStyle({ marginBottom: marginBottom ?? 12 })}
                    min={0}
                    placeholder="12"
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
                  <NumberInput
                    label="Abstand nach unten (Margin in px)"
                    value={config.descriptionStyle?.marginBottom ?? 16}
                    onChange={(marginBottom) => updateDescriptionStyle({ marginBottom: marginBottom ?? 16 })}
                    min={0}
                    placeholder="16"
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
                      <Select
                        label="Hintergrund-Padding"
                        value={config.iconStyle.backgroundPadding}
                        options={[
                          { value: 'xs', label: 'Sehr klein' },
                          { value: 'sm', label: 'Klein' },
                          { value: 'md', label: 'Mittel' },
                          { value: 'lg', label: 'Groß' },
                          { value: 'xl', label: 'Sehr groß' },
                        ]}
                        onChange={(backgroundPadding: any) => updateIconStyle({ backgroundPadding })}
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
                  <Toggle
                    label="Alten Preis anzeigen"
                    value={config.priceStyle.showOriginalPrice}
                    onChange={(showOriginalPrice) => updatePriceStyle({ showOriginalPrice })}
                  />
                </Section>

                {/* Rating Style */}
                <Section 
                  title="Bewertungs-Styling" 
                  icon={<Star className="w-4 h-4" />} 
                  nested
                  toggleEnabled
                  toggleValue={config.ratingStyle.enabled}
                  onToggleChange={(enabled) => updateRatingStyle({ enabled })}
                >
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
                  <ThemeColorPicker
                    label="Gefüllte Farbe"
                    value={config.ratingStyle.filledColor}
                    onChange={(filledColor) => updateRatingStyle({ filledColor: filledColor || { kind: 'custom', hex: '#FBBF24' } })}
                  />
                </Section>

                {/* Features Style */}
                <Section 
                  title="Features-Styling" 
                  icon={<List className="w-4 h-4" />} 
                  nested
                  toggleEnabled
                  toggleValue={config.featuresStyle.enabled}
                  onToggleChange={(enabled) => updateFeaturesStyle({ enabled })}
                >
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Feature-Icon</label>
                    <IconPicker
                      value={config.featuresStyle.icon}
                      onChange={(icon) => updateFeaturesStyle({ icon })}
                    />
                  </div>
                  <ThemeColorPicker
                    label="Icon-Farbe"
                    value={config.featuresStyle.iconColor}
                    onChange={(iconColor) => updateFeaturesStyle({ iconColor: iconColor || { kind: 'custom', hex: '#10B981' } })}
                  />
                </Section>

                {/* Social Style */}
                <Section 
                  title="Social-Styling" 
                  icon={<Share2 className="w-4 h-4" />} 
                  nested
                  toggleEnabled
                  toggleValue={config.socialStyle.enabled}
                  onToggleChange={(enabled) => updateSocialStyle({ enabled })}
                >
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
                  <ThemeColorPicker
                    label="Farbe"
                    value={config.socialStyle.iconColor}
                    onChange={(iconColor) => updateSocialStyle({ iconColor: iconColor || { kind: 'custom', hex: '#6B7280' } })}
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
                  <ThemeColorPicker
                    label="Textfarbe"
                    value={config.buttonStyle.textColor}
                    onChange={(textColor) => updateButtonStyle({ textColor: textColor || { kind: 'custom', hex: '#FFFFFF' } })}
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

      {/* Preview Modal */}
      {showPreviewModal && (
        <CardPreviewModal
          config={config}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

export default GenericCardEditorPage;
