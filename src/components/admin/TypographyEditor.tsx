import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Check,
  Type,
  Search,
} from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { useWebsite } from '../../contexts/WebsiteContext';
import {
  TypographyConfig,
  TypographyStyle,
  ResponsiveSize,
  createDefaultTypographyConfig,
  generateTypographyCSSVariables,
} from '../../types/typography';
import {
  ALL_FONTS,
  TYPOGRAPHY_PRESETS,
  getFontById,
  getFontsByCategory,
  FONT_CATEGORY_LABELS,
} from '../../data/fonts';
import type { FontCategory } from '../../types/typography';

// ===== TYPES =====

type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type EditorTab = 'fonts' | 'headings' | 'body' | 'special';

type TypographyStyleKey = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'button';

// ===== FONT PICKER COMPONENT =====

interface FontPickerProps {
  value: string;
  onChange: (fontId: string) => void;
  label: string;
}

const FontPicker: React.FC<FontPickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<FontCategory[]>(['sans-serif', 'serif']);

  const selectedFont = getFontById(value);

  const filteredFonts = useMemo(() => {
    if (!search) return ALL_FONTS;
    const lower = search.toLowerCase();
    return ALL_FONTS.filter(f => 
      f.name.toLowerCase().includes(lower) ||
      f.category.toLowerCase().includes(lower)
    );
  }, [search]);

  const toggleCategory = (category: FontCategory) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const categories: FontCategory[] = ['sans-serif', 'serif', 'display', 'handwriting', 'monospace'];

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition"
        style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
      >
        <span
          style={{ fontFamily: selectedFont ? `'${selectedFont.name}', ${selectedFont.fallback}` : 'inherit', color: 'var(--admin-text-heading)' }}
        >
          {selectedFont?.name || 'Schrift wählen...'}
        </span>
        <ChevronDown className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-1 w-full max-h-80 overflow-auto rounded-lg" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-lg)' }}>
            {/* Search */}
            <div className="sticky top-0 p-2" style={{ backgroundColor: 'var(--admin-bg-card)', borderBottom: '1px solid var(--admin-border)' }}>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--admin-text-faint)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Schrift suchen..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded"
                  style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                />
              </div>
            </div>

            {/* Font list by category */}
            <div className="py-1">
              {categories.map(category => {
                const fonts = search
                  ? filteredFonts.filter(f => f.category === category)
                  : getFontsByCategory(category);
                
                if (fonts.length === 0) return null;

                const isExpanded = expandedCategories.includes(category);

                return (
                  <div key={category}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium"
                      style={{ backgroundColor: 'var(--admin-bg-surface)', color: 'var(--admin-text)' }}
                    >
                      <span>{FONT_CATEGORY_LABELS[category]}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {isExpanded && (
                      <div>
                        {fonts.map(font => (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() => {
                              onChange(font.id);
                              setIsOpen(false);
                              setSearch('');
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2 transition`}
                            style={value === font.id ? { backgroundColor: 'var(--admin-accent-bg)' } : {}}
                            onMouseEnter={e => { if (value !== font.id) e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'; }}
                            onMouseLeave={e => { if (value !== font.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <div className="flex flex-col items-start">
                              <span
                                style={{ fontFamily: `'${font.name}', ${font.fallback}`, color: 'var(--admin-text-heading)' }}
                              >
                                {font.name}
                              </span>
                              <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{font.preview}</span>
                            </div>
                            {value === font.id && (
                              <Check className="w-4 h-4" style={{ color: 'var(--admin-accent)' }} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ===== RESPONSIVE INPUT COMPONENT =====

interface ResponsiveInputProps {
  label: string;
  value: ResponsiveSize;
  onChange: (value: ResponsiveSize) => void;
  viewport: ViewportMode;
  placeholder?: string;
}

const ResponsiveInput: React.FC<ResponsiveInputProps> = ({
  label,
  value,
  onChange,
  viewport,
  placeholder,
}) => {
  const handleChange = (newValue: string) => {
    onChange({
      ...value,
      [viewport]: newValue,
    });
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
      <input
        type="text"
        value={value[viewport]}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 text-sm rounded"
        style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
      />
    </div>
  );
};

// ===== TYPOGRAPHY STYLE EDITOR =====

interface TypographyStyleEditorProps {
  styleName: string;
  style: TypographyStyle;
  onChange: (style: TypographyStyle) => void;
  viewport: ViewportMode;
  showFontFamily?: boolean;
}

const TypographyStyleEditor: React.FC<TypographyStyleEditorProps> = ({
  styleName,
  style,
  onChange,
  viewport,
  showFontFamily = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const fontWeights = [300, 400, 500, 600, 700, 800, 900];
  const textTransforms: Array<'none' | 'uppercase' | 'lowercase' | 'capitalize'> = [
    'none', 'uppercase', 'lowercase', 'capitalize'
  ];

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--admin-border)' }}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 transition"
        style={{ backgroundColor: 'var(--admin-bg-surface)', color: 'var(--admin-text)' }}
      >
        <span className="font-medium">{styleName}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
            {style.fontSize[viewport]} / {style.fontWeight}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4" style={{ backgroundColor: 'var(--admin-bg-card)' }}>
          {showFontFamily && (
            <FontPicker
              label="Schriftart"
              value={style.fontFamily}
              onChange={(fontId) => onChange({ ...style, fontFamily: fontId })}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <ResponsiveInput
              label="Schriftgröße"
              value={style.fontSize}
              onChange={(fontSize) => onChange({ ...style, fontSize })}
              viewport={viewport}
              placeholder="1rem"
            />
            <ResponsiveInput
              label="Zeilenhöhe"
              value={style.lineHeight}
              onChange={(lineHeight) => onChange({ ...style, lineHeight })}
              viewport={viewport}
              placeholder="1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>Schriftstärke</label>
              <select
                value={style.fontWeight}
                onChange={(e) => onChange({ ...style, fontWeight: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-sm rounded"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              >
                {fontWeights.map(weight => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>Zeichenabstand</label>
              <input
                type="text"
                value={style.letterSpacing}
                onChange={(e) => onChange({ ...style, letterSpacing: e.target.value })}
                placeholder="-0.02em"
                className="w-full px-2 py-1.5 text-sm rounded"
                style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--admin-text-secondary)' }}>Text-Transformation</label>
            <select
              value={style.textTransform || 'none'}
              onChange={(e) => onChange({ ...style, textTransform: e.target.value as any })}
              className="w-full px-2 py-1.5 text-sm rounded"
              style={{ backgroundColor: 'var(--admin-bg-input)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
            >
              {textTransforms.map(transform => (
                <option key={transform} value={transform}>
                  {transform === 'none' ? 'Normal' :
                   transform === 'uppercase' ? 'GROSSBUCHSTABEN' :
                   transform === 'lowercase' ? 'kleinbuchstaben' :
                   'Erste Buchstaben Groß'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== PRESET SELECTOR =====

interface PresetSelectorProps {
  onSelect: (config: TypographyConfig) => void;
  currentHeadingFont: string;
  currentBodyFont: string;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelect,
  currentHeadingFont,
  currentBodyFont,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Schnellauswahl (Presets)</h3>
      <div className="grid grid-cols-1 gap-2">
        {TYPOGRAPHY_PRESETS.map(preset => {
          const isActive =
            preset.config.headingFont === currentHeadingFont &&
            preset.config.bodyFont === currentBodyFont;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.config)}
              className="flex items-center justify-between p-3 rounded-lg transition"
              style={{
                border: `1px solid ${isActive ? 'var(--admin-accent)' : 'var(--admin-border)'}`,
                backgroundColor: isActive ? 'var(--admin-accent-bg)' : 'transparent',
              }}
            >
              <div className="text-left">
                <div className="font-medium" style={{ color: 'var(--admin-text-heading)' }}>{preset.name}</div>
                <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{preset.description}</div>
              </div>
              {isActive && <Check className="w-5 h-5" style={{ color: 'var(--admin-accent)' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ===== LIVE PREVIEW =====

interface LivePreviewProps {
  config: TypographyConfig;
  viewport: ViewportMode;
}

const LivePreview: React.FC<LivePreviewProps> = ({ config, viewport }) => {
  const headingFont = getFontById(config.headingFont);
  const bodyFont = getFontById(config.bodyFont);

  const getStyle = (style: TypographyStyle): React.CSSProperties => {
    const font = getFontById(style.fontFamily);
    return {
      fontFamily: font ? `'${font.name}', ${font.fallback}` : 'inherit',
      fontSize: style.fontSize[viewport],
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight[viewport],
      letterSpacing: style.letterSpacing,
      textTransform: style.textTransform || 'none',
    };
  };

  return (
    <div className="rounded-lg p-6 space-y-6" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>
      <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--admin-text-muted)' }}>
        {viewport === 'desktop' && <Monitor className="w-4 h-4" />}
        {viewport === 'tablet' && <Tablet className="w-4 h-4" />}
        {viewport === 'mobile' && <Smartphone className="w-4 h-4" />}
        <span>
          {viewport === 'desktop' ? 'Desktop' : viewport === 'tablet' ? 'Tablet' : 'Mobile'} Vorschau
        </span>
      </div>

      <div className="space-y-4">
        <h1 style={getStyle(config.h1)}>H1 Überschrift</h1>
        <h2 style={getStyle(config.h2)}>H2 Überschrift</h2>
        <h3 style={getStyle(config.h3)}>H3 Überschrift</h3>
        <h4 style={getStyle(config.h4)}>H4 Überschrift</h4>
        <h5 style={getStyle(config.h5)}>H5 Überschrift</h5>
        <h6 style={getStyle(config.h6)}>H6 Überschrift</h6>
      </div>

      <hr style={{ borderColor: 'var(--admin-border)' }} />

      <div className="space-y-3">
        <p style={getStyle(config.bodyLarge)}>
          <strong>Body Large:</strong> Dies ist ein Beispieltext in der großen Variante.
        </p>
        <p style={getStyle(config.body)}>
          <strong>Body:</strong> Dies ist der Standard-Fließtext. Er sollte gut lesbar sein und
          angenehm für längere Textpassagen. Die Zeilenhöhe sorgt für gute Lesbarkeit.
        </p>
        <p style={getStyle(config.bodySmall)}>
          <strong>Body Small:</strong> Kleinerer Text für Nebentexte und Details.
        </p>
      </div>

      <hr style={{ borderColor: 'var(--admin-border)' }} />

      <div className="flex items-center gap-4">
        <span style={getStyle(config.caption)}>Caption / Bildunterschrift</span>
        <button
          type="button"
          style={{
            ...getStyle(config.button),
            padding: '0.5rem 1rem',
            backgroundColor: '#e11d48',
            color: 'white',
            borderRadius: '0.375rem',
          }}
        >
          Button Text
        </button>
      </div>

      <hr style={{ borderColor: 'var(--admin-border)' }} />

      <div className="text-xs space-y-1" style={{ color: 'var(--admin-text-muted)' }}>
        <div>Überschriften: {headingFont?.name || 'System'}</div>
        <div>Fließtext: {bodyFont?.name || 'System'}</div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const TypographyEditor: React.FC = () => {
  const { website, updateWebsite, loading: websiteLoading } = useWebsite();

  const [config, setConfig] = useState<TypographyConfig>(createDefaultTypographyConfig());
  const [initialConfig, setInitialConfig] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('fonts');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [_fontsLoaded, setFontsLoaded] = useState(false);

  // Load typography from website
  useEffect(() => {
    if (website) {
      const typography = (website as any).typography as TypographyConfig | undefined;
      if (typography) {
        setConfig(typography);
        setInitialConfig(JSON.stringify(typography));
      } else {
        const defaultConfig = createDefaultTypographyConfig();
        setConfig(defaultConfig);
        setInitialConfig(JSON.stringify(defaultConfig));
      }
    }
  }, [website]);

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== initialConfig);
  }, [config, initialConfig]);

  // Load local fonts CSS
  useEffect(() => {
    // Check if fonts CSS is already loaded
    const existingLink = document.querySelector('link[data-local-fonts]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/fonts/fonts.css';
      link.setAttribute('data-local-fonts', 'true');
      document.head.appendChild(link);
      link.onload = () => setFontsLoaded(true);
    } else {
      setFontsLoaded(true);
    }
  }, []);

  // Save handler
  const handleSave = async () => {
    if (!website || !updateWebsite) return;

    setSaving(true);
    try {
      await updateWebsite({
        ...website,
        typography: config,
      } as any);
      setInitialConfig(JSON.stringify(config));
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save typography:', error);
    } finally {
      setSaving(false);
    }
  };

  // Reset handler
  const handleReset = () => {
    if (initialConfig) {
      setConfig(JSON.parse(initialConfig));
    }
  };

  // Update a specific style
  const updateStyle = (key: TypographyStyleKey, style: TypographyStyle) => {
    setConfig(prev => ({
      ...prev,
      [key]: style,
    }));
  };

  // Apply preset
  const applyPreset = (presetConfig: TypographyConfig) => {
    setConfig(presetConfig);
  };

  if (websiteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--admin-accent)' }} />
      </div>
    );
  }

  const tabs: { id: EditorTab; label: string }[] = [
    { id: 'fonts', label: 'Schriften' },
    { id: 'headings', label: 'Überschriften' },
    { id: 'body', label: 'Fließtext' },
    { id: 'special', label: 'Spezial' },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Typographie"
        icon={Type}
        sticky
        actions={
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-sm" style={{ color: 'var(--admin-danger)' }}>Ungespeicherte Änderungen</span>
            )}
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center gap-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              <RotateCcw className="w-4 h-4" />
              Zurücksetzen
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ backgroundColor: 'var(--admin-accent)' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Editor Panel */}
          <div className="flex-1 max-w-lg">
            {/* Viewport Toggle */}
            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: 'var(--admin-bg-card)' }}>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text)' }}>Ansicht</label>
              <div className="flex gap-2">
                {[
                  { mode: 'desktop' as ViewportMode, icon: Monitor, label: 'Desktop' },
                  { mode: 'tablet' as ViewportMode, icon: Tablet, label: 'Tablet' },
                  { mode: 'mobile' as ViewportMode, icon: Smartphone, label: 'Mobile' },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewport(mode)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition"
                    style={
                      viewport === mode
                        ? { backgroundColor: 'var(--admin-accent)', color: 'white' }
                        : { backgroundColor: 'var(--admin-bg-surface)', color: 'var(--admin-text-secondary)' }
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="rounded-lg mb-4" style={{ backgroundColor: 'var(--admin-bg-card)' }}>
              <div className="flex" style={{ borderBottom: '1px solid var(--admin-border)' }}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'border-b-2'
                        : ''
                    }`}
                    style={
                      activeTab === tab.id
                        ? { color: 'var(--admin-accent)', borderColor: 'var(--admin-accent)' }
                        : { color: 'var(--admin-text-muted)' }
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {/* Fonts Tab */}
                {activeTab === 'fonts' && (
                  <div className="space-y-6">
                    <PresetSelector
                      onSelect={applyPreset}
                      currentHeadingFont={config.headingFont}
                      currentBodyFont={config.bodyFont}
                    />

                    <hr style={{ borderColor: 'var(--admin-border)' }} />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Manuelle Auswahl</h3>
                      <FontPicker
                        label="Überschriften-Schrift"
                        value={config.headingFont}
                        onChange={(fontId) => setConfig(prev => ({ ...prev, headingFont: fontId }))}
                      />
                      <FontPicker
                        label="Fließtext-Schrift"
                        value={config.bodyFont}
                        onChange={(fontId) => setConfig(prev => ({ ...prev, bodyFont: fontId }))}
                      />
                      <FontPicker
                        label="Akzent-Schrift (optional)"
                        value={config.accentFont || ''}
                        onChange={(fontId) => setConfig(prev => ({ ...prev, accentFont: fontId || undefined }))}
                      />
                    </div>
                  </div>
                )}

                {/* Headings Tab */}
                {activeTab === 'headings' && (
                  <div className="space-y-3">
                    {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map(key => (
                      <TypographyStyleEditor
                        key={key}
                        styleName={key.toUpperCase()}
                        style={config[key]}
                        onChange={(style) => updateStyle(key, style)}
                        viewport={viewport}
                        showFontFamily
                      />
                    ))}
                  </div>
                )}

                {/* Body Tab */}
                {activeTab === 'body' && (
                  <div className="space-y-3">
                    <TypographyStyleEditor
                      styleName="Body Large"
                      style={config.bodyLarge}
                      onChange={(style) => updateStyle('bodyLarge', style)}
                      viewport={viewport}
                      showFontFamily
                    />
                    <TypographyStyleEditor
                      styleName="Body"
                      style={config.body}
                      onChange={(style) => updateStyle('body', style)}
                      viewport={viewport}
                      showFontFamily
                    />
                    <TypographyStyleEditor
                      styleName="Body Small"
                      style={config.bodySmall}
                      onChange={(style) => updateStyle('bodySmall', style)}
                      viewport={viewport}
                      showFontFamily
                    />
                  </div>
                )}

                {/* Special Tab */}
                {activeTab === 'special' && (
                  <div className="space-y-3">
                    <TypographyStyleEditor
                      styleName="Caption / Bildunterschrift"
                      style={config.caption}
                      onChange={(style) => updateStyle('caption', style)}
                      viewport={viewport}
                      showFontFamily
                    />
                    <TypographyStyleEditor
                      styleName="Button"
                      style={config.button}
                      onChange={(style) => updateStyle('button', style)}
                      viewport={viewport}
                      showFontFamily
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1">
            <div className="sticky top-24">
              <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--admin-text)' }}>Live-Vorschau</h2>
              <LivePreview config={config} viewport={viewport} />

              {/* CSS Output (optional, for debugging) */}
              {false && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-500 cursor-pointer">CSS-Variablen anzeigen</summary>
                  <pre className="mt-2 p-3 bg-gray-900 text-green-400 text-xs rounded overflow-auto max-h-64">
                    {generateTypographyCSSVariables(config, ALL_FONTS)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TypographyEditor;
