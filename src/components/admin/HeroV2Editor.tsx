import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Image, Type, Plus, Trash2, Eye, EyeOff,
  Monitor, Tablet, Smartphone, ChevronDown, ChevronUp, Move
} from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';
import { MediaLibrary, MediaFile } from './MediaLibrary';
import {
  HeroV2Config, HeroButton, HeroText, HeroLogo,
  Viewport, Position,
  HorizontalPosition, VerticalPosition, ButtonVariant, ButtonSize, ButtonBorderRadius,
  createDefaultHeroV2Config, createDefaultResponsivePosition, getResponsiveValue
} from '../../types/HeroV2';

// Position label mappings
const horizontalLabels: Record<HorizontalPosition, string> = {
  'left': 'Links (10%)',
  'left-center': 'Links-Mitte (25%)',
  'center': 'Mitte (50%)',
  'right-center': 'Rechts-Mitte (75%)',
  'right': 'Rechts (90%)'
};

const verticalLabels: Record<VerticalPosition, string> = {
  'top': 'Oben (10%)',
  'top-center': 'Oben-Mitte (30%)',
  'middle': 'Mitte (50%)',
  'bottom-center': 'Unten-Mitte (70%)',
  'bottom': 'Unten (90%)'
};

interface HeroV2EditorProps {
  pageId?: string;
  blockId?: string;
}

export const HeroV2Editor: React.FC<HeroV2EditorProps> = (props) => {
  const navigate = useNavigate();
  const params = useParams<{ pageId: string; blockId: string }>();
  const { website, updatePage } = useWebsite();
  
  // Get pageId and blockId from props or URL params
  const pageId = props.pageId || params.pageId || '';
  const blockId = props.blockId || params.blockId || '';
  
  const [config, setConfig] = useState<HeroV2Config>(createDefaultHeroV2Config());
  const [activeViewport, setActiveViewport] = useState<Viewport>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    background: true,
    logos: true,
    texts: true,
    buttons: true
  });

  // Load existing config
  useEffect(() => {
    if (website?.pages) {
      const page = website.pages.find(p => p.id === pageId);
      if (page) {
        const block = page.blocks.find(b => b.id === blockId);
        if (block && block.config) {
          setConfig({ ...createDefaultHeroV2Config(), ...block.config });
        }
      }
    }
  }, [website, pageId, blockId]);

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    try {
      const page = website?.pages.find(p => p.id === pageId);
      if (page) {
        const updatedBlocks = page.blocks.map(b => 
          b.id === blockId ? { ...b, config } : b
        );
        await updatePage(pageId, { blocks: updatedBlocks });
        navigate(`/admin/page-builder/${pageId}`);
      }
    } catch (error) {
      console.error('Error saving hero:', error);
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  // Background image selection
  const handleImageSelect = (files: MediaFile[]) => {
    if (files.length > 0) {
      setConfig(prev => ({ ...prev, backgroundImage: files[0].file_url }));
      setShowMediaLibrary(false);
    }
  };

  // Toggle section
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add new text
  const addText = () => {
    const newText: HeroText = {
      id: generateId(),
      content: 'Neuer Text',
      fontFamily: 'Inter, sans-serif',
      fontSize: { desktop: 48, tablet: 36, mobile: 28 },
      fontWeight: '600',
      color: '#ffffff',
      position: createDefaultResponsivePosition(),
      visible: { desktop: true, tablet: true, mobile: true },
      belowImage: { desktop: false, tablet: false, mobile: false },
      order: { desktop: config.texts.length, tablet: config.texts.length, mobile: config.texts.length }
    };
    setConfig(prev => ({ ...prev, texts: [...prev.texts, newText] }));
  };

  // Add new button
  const addButton = () => {
    const newButton: HeroButton = {
      id: generateId(),
      text: 'Button',
      action: { type: 'link', value: '' },
      style: {
        variant: 'primary',
        borderRadius: 'medium',
        size: 'medium'
      },
      position: { desktop: { horizontal: 'center', vertical: 'bottom-center', offsetX: 0, offsetY: 0 } },
      visible: { desktop: true, tablet: true, mobile: true },
      belowImage: { desktop: false, tablet: false, mobile: false },
      order: { desktop: config.buttons.length, tablet: config.buttons.length, mobile: config.buttons.length }
    };
    setConfig(prev => ({ ...prev, buttons: [...prev.buttons, newButton] }));
  };

  // Add logo from Logo Designer
  const addLogo = () => {
    const newLogo: HeroLogo = {
      id: generateId(),
      logoId: '',
      position: { desktop: { horizontal: 'center', vertical: 'top-center', offsetX: 0, offsetY: 0 } },
      scale: { desktop: 100 },
      visible: { desktop: true, tablet: true, mobile: true },
      belowImage: { desktop: false, tablet: false, mobile: false },
      order: { desktop: config.logos.length, tablet: config.logos.length, mobile: config.logos.length }
    };
    setConfig(prev => ({ ...prev, logos: [...prev.logos, newLogo] }));
  };

  // Update text
  const updateText = (id: string, updates: Partial<HeroText>) => {
    setConfig(prev => ({
      ...prev,
      texts: prev.texts.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  // Update button
  const updateButton = (id: string, updates: Partial<HeroButton>) => {
    setConfig(prev => ({
      ...prev,
      buttons: prev.buttons.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  // Update logo
  const updateLogo = (id: string, updates: Partial<HeroLogo>) => {
    setConfig(prev => ({
      ...prev,
      logos: prev.logos.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  // Delete handlers
  const deleteText = (id: string) => {
    setConfig(prev => ({ ...prev, texts: prev.texts.filter(t => t.id !== id) }));
  };

  const deleteButton = (id: string) => {
    setConfig(prev => ({ ...prev, buttons: prev.buttons.filter(b => b.id !== id) }));
  };

  const deleteLogo = (id: string) => {
    setConfig(prev => ({ ...prev, logos: prev.logos.filter(l => l.id !== id) }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/admin/page-builder/${pageId}`)} 
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Hero V2 Editor</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showPreview ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Eye className="w-4 h-4" />
            Vorschau
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-rose-500 text-white px-5 py-2 rounded-lg hover:bg-rose-600 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Editor Panel */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} bg-white border-r overflow-y-auto`}>
          {/* Viewport Tabs */}
          <div className="sticky top-0 bg-white border-b z-10">
            <div className="flex px-4 py-2 gap-2">
              {[
                { id: 'desktop' as Viewport, icon: Monitor, label: 'Desktop' },
                { id: 'tablet' as Viewport, icon: Tablet, label: 'Tablet' },
                { id: 'mobile' as Viewport, icon: Smartphone, label: 'Mobile' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveViewport(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeViewport === id
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Background Section */}
            <Section
              title="Hintergrund"
              icon={<Image className="w-4 h-4" />}
              expanded={expandedSections.background}
              onToggle={() => toggleSection('background')}
            >
              <div className="space-y-4">
                {/* Image Preview & Select */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Hintergrundbild</label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-rose-400 transition"
                    onClick={() => setShowMediaLibrary(true)}
                  >
                    {config.backgroundImage ? (
                      <img 
                        src={config.backgroundImage} 
                        alt="Background" 
                        className="max-h-32 mx-auto rounded"
                      />
                    ) : (
                      <div className="text-gray-400">
                        <Image className="w-8 h-8 mx-auto mb-2" />
                        <p>Klicken um Bild auszuwählen</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Position */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Bildposition X</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.backgroundPosition.x}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        backgroundPosition: { ...prev.backgroundPosition, x: Number(e.target.value) }
                      }))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{config.backgroundPosition.x}%</span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Bildposition Y</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.backgroundPosition.y}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        backgroundPosition: { ...prev.backgroundPosition, y: Number(e.target.value) }
                      }))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{config.backgroundPosition.y}%</span>
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className="text-sm text-gray-600">Höhe ({activeViewport})</label>
                  <input
                    type="text"
                    value={getResponsiveValue(config.height, activeViewport)}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      height: { ...prev.height, [activeViewport]: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="z.B. 600px, 80vh"
                  />
                </div>

                {/* Overlay */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.overlay.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        overlay: { ...prev.overlay, enabled: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Overlay aktivieren</span>
                  </label>
                  
                  {config.overlay.enabled && (
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <div>
                        <label className="text-sm text-gray-600">Farbe</label>
                        <input
                          type="color"
                          value={config.overlay.color}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            overlay: { ...prev.overlay, color: e.target.value }
                          }))}
                          className="w-full h-10 rounded border cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Deckkraft</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={config.overlay.opacity}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            overlay: { ...prev.overlay, opacity: Number(e.target.value) }
                          }))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{config.overlay.opacity}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Logos Section */}
            <Section
              title="Logos"
              icon={<Image className="w-4 h-4" />}
              expanded={expandedSections.logos}
              onToggle={() => toggleSection('logos')}
              action={
                <button
                  onClick={addLogo}
                  className="text-rose-500 hover:text-rose-600 p-1"
                  title="Logo hinzufügen"
                >
                  <Plus className="w-4 h-4" />
                </button>
              }
            >
              {config.logos.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Noch keine Logos hinzugefügt
                </p>
              ) : (
                <div className="space-y-4">
                  {config.logos.map((logo, index) => (
                    <LogoEditor
                      key={logo.id}
                      logo={logo}
                      index={index}
                      viewport={activeViewport}
                      availableLogos={website?.logos || []}
                      onUpdate={(updates) => updateLogo(logo.id, updates)}
                      onDelete={() => deleteLogo(logo.id)}
                    />
                  ))}
                </div>
              )}
            </Section>

            {/* Texts Section */}
            <Section
              title="Texte"
              icon={<Type className="w-4 h-4" />}
              expanded={expandedSections.texts}
              onToggle={() => toggleSection('texts')}
              action={
                <button
                  onClick={addText}
                  className="text-rose-500 hover:text-rose-600 p-1"
                  title="Text hinzufügen"
                >
                  <Plus className="w-4 h-4" />
                </button>
              }
            >
              {config.texts.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Noch keine Texte hinzugefügt
                </p>
              ) : (
                <div className="space-y-4">
                  {config.texts.map((text, index) => (
                    <TextEditor
                      key={text.id}
                      text={text}
                      index={index}
                      viewport={activeViewport}
                      onUpdate={(updates) => updateText(text.id, updates)}
                      onDelete={() => deleteText(text.id)}
                    />
                  ))}
                </div>
              )}
            </Section>

            {/* Buttons Section */}
            <Section
              title="Buttons"
              icon={<Move className="w-4 h-4" />}
              expanded={expandedSections.buttons}
              onToggle={() => toggleSection('buttons')}
              action={
                <button
                  onClick={addButton}
                  className="text-rose-500 hover:text-rose-600 p-1"
                  title="Button hinzufügen"
                >
                  <Plus className="w-4 h-4" />
                </button>
              }
            >
              {config.buttons.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Noch keine Buttons hinzugefügt
                </p>
              ) : (
                <div className="space-y-4">
                  {config.buttons.map((button, index) => (
                    <ButtonEditor
                      key={button.id}
                      button={button}
                      index={index}
                      viewport={activeViewport}
                      onUpdate={(updates) => updateButton(button.id, updates)}
                      onDelete={() => deleteButton(button.id)}
                    />
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 bg-gray-200 p-4 overflow-auto">
            <HeroV2Preview config={config} viewport={activeViewport} logos={website?.logos || []} />
          </div>
        )}
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Hintergrundbild auswählen</h2>
              <button 
                onClick={() => setShowMediaLibrary(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <MediaLibrary
                mode="select"
                onSelect={handleImageSelect}
                onCancel={() => setShowMediaLibrary(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Section component
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, expanded, onToggle, action, children }) => (
  <div className="border rounded-lg">
    <div 
      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2 font-medium text-gray-700">
        {icon}
        {title}
      </div>
      <div className="flex items-center gap-2">
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
    </div>
    {expanded && <div className="p-4 pt-0 border-t">{children}</div>}
  </div>
);

// Position Selector component
interface PositionSelectorProps {
  position: Position;
  onChange: (position: Position) => void;
}

const PositionSelector: React.FC<PositionSelectorProps> = ({ position, onChange }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-gray-500">Horizontal</label>
        <select
          value={position.horizontal}
          onChange={(e) => onChange({ ...position, horizontal: e.target.value as HorizontalPosition })}
          className="w-full px-2 py-1.5 border rounded text-sm"
        >
          {Object.entries(horizontalLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500">Vertikal</label>
        <select
          value={position.vertical}
          onChange={(e) => onChange({ ...position, vertical: e.target.value as VerticalPosition })}
          className="w-full px-2 py-1.5 border rounded text-sm"
        >
          {Object.entries(verticalLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-gray-500">Offset X ({position.offsetX}%)</label>
        <input
          type="range"
          min="-20"
          max="20"
          value={position.offsetX}
          onChange={(e) => onChange({ ...position, offsetX: Number(e.target.value) })}
          className="w-full"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500">Offset Y ({position.offsetY}%)</label>
        <input
          type="range"
          min="-20"
          max="20"
          value={position.offsetY}
          onChange={(e) => onChange({ ...position, offsetY: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  </div>
);

// Logo Editor sub-component
interface LogoEditorProps {
  logo: HeroLogo;
  index: number;
  viewport: Viewport;
  availableLogos: Array<{ id: string; name: string; thumbnail?: string }>;
  onUpdate: (updates: Partial<HeroLogo>) => void;
  onDelete: () => void;
}

const LogoEditor: React.FC<LogoEditorProps> = ({ logo, index, viewport, availableLogos, onUpdate, onDelete }) => {
  const currentPosition = getResponsiveValue(logo.position, viewport);
  const currentScale = getResponsiveValue(logo.scale, viewport);
  const currentVisible = getResponsiveValue(logo.visible, viewport);
  const currentBelowImage = getResponsiveValue(logo.belowImage, viewport);

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-sm">Logo {index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate({ 
              visible: { ...logo.visible, [viewport]: !currentVisible } 
            })}
            className={`p-1 rounded ${currentVisible ? 'text-green-600' : 'text-gray-400'}`}
            title={currentVisible ? 'Sichtbar' : 'Ausgeblendet'}
          >
            {currentVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button onClick={onDelete} className="p-1 text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500">Logo auswählen</label>
          <select
            value={logo.logoId}
            onChange={(e) => onUpdate({ logoId: e.target.value })}
            className="w-full px-2 py-1.5 border rounded text-sm"
          >
            <option value="">-- Logo wählen --</option>
            {availableLogos.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500">Skalierung ({currentScale}%)</label>
          <input
            type="range"
            min="10"
            max="200"
            value={currentScale}
            onChange={(e) => onUpdate({ 
              scale: { ...logo.scale, [viewport]: Number(e.target.value) } 
            })}
            className="w-full"
          />
        </div>

        <PositionSelector
          position={currentPosition}
          onChange={(pos) => onUpdate({ position: { ...logo.position, [viewport]: pos } })}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={currentBelowImage}
            onChange={(e) => onUpdate({ 
              belowImage: { ...logo.belowImage, [viewport]: e.target.checked } 
            })}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Unter dem Bild anzeigen</span>
        </label>
      </div>
    </div>
  );
};

// Text Editor sub-component
interface TextEditorProps {
  text: HeroText;
  index: number;
  viewport: Viewport;
  onUpdate: (updates: Partial<HeroText>) => void;
  onDelete: () => void;
}

const AVAILABLE_FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Oswald', value: 'Oswald, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Dancing Script', value: 'Dancing Script, cursive' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
];

const TextEditor: React.FC<TextEditorProps> = ({ text, index, viewport, onUpdate, onDelete }) => {
  const currentPosition = getResponsiveValue(text.position, viewport);
  const currentFontSize = getResponsiveValue(text.fontSize, viewport);
  const currentVisible = getResponsiveValue(text.visible, viewport);
  const currentBelowImage = getResponsiveValue(text.belowImage, viewport);

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-sm">Text {index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate({ 
              visible: { ...text.visible, [viewport]: !currentVisible } 
            })}
            className={`p-1 rounded ${currentVisible ? 'text-green-600' : 'text-gray-400'}`}
          >
            {currentVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button onClick={onDelete} className="p-1 text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500">Text (Zeilenumbruch mit Enter)</label>
          <textarea
            value={text.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="w-full px-2 py-1.5 border rounded text-sm"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Schriftart</label>
            <select
              value={text.fontFamily}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="w-full px-2 py-1.5 border rounded text-sm"
            >
              {AVAILABLE_FONTS.map(f => (
                <option key={f.value} value={f.value}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Größe ({currentFontSize}px)</label>
            <input
              type="number"
              min="12"
              max="120"
              value={currentFontSize}
              onChange={(e) => onUpdate({ 
                fontSize: { ...text.fontSize, [viewport]: Number(e.target.value) } 
              })}
              className="w-full px-2 py-1.5 border rounded text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Schriftstärke</label>
            <select
              value={text.fontWeight}
              onChange={(e) => onUpdate({ fontWeight: e.target.value as HeroText['fontWeight'] })}
              className="w-full px-2 py-1.5 border rounded text-sm"
            >
              <option value="300">Light</option>
              <option value="400">Normal</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Farbe</label>
            <input
              type="color"
              value={text.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-full h-9 rounded border cursor-pointer"
            />
          </div>
        </div>

        <PositionSelector
          position={currentPosition}
          onChange={(pos) => onUpdate({ position: { ...text.position, [viewport]: pos } })}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={currentBelowImage}
            onChange={(e) => onUpdate({ 
              belowImage: { ...text.belowImage, [viewport]: e.target.checked } 
            })}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Unter dem Bild anzeigen</span>
        </label>
      </div>
    </div>
  );
};

// Button Editor sub-component
interface ButtonEditorProps {
  button: HeroButton;
  index: number;
  viewport: Viewport;
  onUpdate: (updates: Partial<HeroButton>) => void;
  onDelete: () => void;
}

const ButtonEditor: React.FC<ButtonEditorProps> = ({ button, index, viewport, onUpdate, onDelete }) => {
  const currentPosition = getResponsiveValue(button.position, viewport);
  const currentVisible = getResponsiveValue(button.visible, viewport);
  const currentBelowImage = getResponsiveValue(button.belowImage, viewport);

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-sm">Button {index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate({ 
              visible: { ...button.visible, [viewport]: !currentVisible } 
            })}
            className={`p-1 rounded ${currentVisible ? 'text-green-600' : 'text-gray-400'}`}
          >
            {currentVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button onClick={onDelete} className="p-1 text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500">Button-Text</label>
          <input
            type="text"
            value={button.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full px-2 py-1.5 border rounded text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Aktion</label>
            <select
              value={button.action.type}
              onChange={(e) => onUpdate({ 
                action: { ...button.action, type: e.target.value as HeroButton['action']['type'] } 
              })}
              className="w-full px-2 py-1.5 border rounded text-sm"
            >
              <option value="link">Link</option>
              <option value="scroll">Zu Sektion scrollen</option>
              <option value="phone">Telefon anrufen</option>
              <option value="email">E-Mail senden</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">
              {button.action.type === 'link' && 'URL'}
              {button.action.type === 'scroll' && 'Section-ID'}
              {button.action.type === 'phone' && 'Telefonnummer'}
              {button.action.type === 'email' && 'E-Mail-Adresse'}
            </label>
            <input
              type="text"
              value={button.action.value}
              onChange={(e) => onUpdate({ 
                action: { ...button.action, value: e.target.value } 
              })}
              className="w-full px-2 py-1.5 border rounded text-sm"
              placeholder={
                button.action.type === 'link' ? 'https://...' :
                button.action.type === 'scroll' ? 'section-id' :
                button.action.type === 'phone' ? '+49...' :
                'email@beispiel.de'
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500">Stil</label>
            <select
              value={button.style.variant}
              onChange={(e) => onUpdate({ 
                style: { ...button.style, variant: e.target.value as ButtonVariant } 
              })}
              className="w-full px-2 py-1.5 border rounded text-sm"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
              <option value="custom">Benutzerdefiniert</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Größe</label>
            <select
              value={button.style.size}
              onChange={(e) => onUpdate({ 
                style: { ...button.style, size: e.target.value as ButtonSize } 
              })}
              className="w-full px-2 py-1.5 border rounded text-sm"
            >
              <option value="small">Klein</option>
              <option value="medium">Mittel</option>
              <option value="large">Groß</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Ecken</label>
            <select
              value={button.style.borderRadius}
              onChange={(e) => onUpdate({ 
                style: { ...button.style, borderRadius: e.target.value as ButtonBorderRadius } 
              })}
              className="w-full px-2 py-1.5 border rounded text-sm"
            >
              <option value="none">Eckig</option>
              <option value="small">Leicht gerundet</option>
              <option value="medium">Gerundet</option>
              <option value="large">Stark gerundet</option>
              <option value="pill">Pill</option>
            </select>
          </div>
        </div>

        {button.style.variant === 'custom' && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500">Hintergrund</label>
              <input
                type="color"
                value={button.style.backgroundColor || '#3b82f6'}
                onChange={(e) => onUpdate({ 
                  style: { ...button.style, backgroundColor: e.target.value } 
                })}
                className="w-full h-9 rounded border cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Textfarbe</label>
              <input
                type="color"
                value={button.style.textColor || '#ffffff'}
                onChange={(e) => onUpdate({ 
                  style: { ...button.style, textColor: e.target.value } 
                })}
                className="w-full h-9 rounded border cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Rahmen</label>
              <input
                type="color"
                value={button.style.borderColor || '#3b82f6'}
                onChange={(e) => onUpdate({ 
                  style: { ...button.style, borderColor: e.target.value } 
                })}
                className="w-full h-9 rounded border cursor-pointer"
              />
            </div>
          </div>
        )}

        <PositionSelector
          position={currentPosition}
          onChange={(pos) => onUpdate({ position: { ...button.position, [viewport]: pos } })}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={currentBelowImage}
            onChange={(e) => onUpdate({ 
              belowImage: { ...button.belowImage, [viewport]: e.target.checked } 
            })}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Unter dem Bild anzeigen</span>
        </label>
      </div>
    </div>
  );
};

// Preview component
interface HeroV2PreviewProps {
  config: HeroV2Config;
  viewport: Viewport;
  logos: Array<{ id: string; name: string; thumbnail?: string; canvas: { width: number; height: number; backgroundColor: string }; image?: any; texts: any[] }>;
}

const HeroV2Preview: React.FC<HeroV2PreviewProps> = ({ config, viewport, logos }) => {
  const height = getResponsiveValue(config.height, viewport);
  const viewportWidth = viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%';

  // Elements on the image
  const onImageElements = [
    ...config.logos.filter(l => !getResponsiveValue(l.belowImage, viewport) && getResponsiveValue(l.visible, viewport)),
    ...config.texts.filter(t => !getResponsiveValue(t.belowImage, viewport) && getResponsiveValue(t.visible, viewport)),
    ...config.buttons.filter(b => !getResponsiveValue(b.belowImage, viewport) && getResponsiveValue(b.visible, viewport))
  ];

  // Elements below the image
  const belowImageElements = [
    ...config.logos.filter(l => getResponsiveValue(l.belowImage, viewport) && getResponsiveValue(l.visible, viewport)),
    ...config.texts.filter(t => getResponsiveValue(t.belowImage, viewport) && getResponsiveValue(t.visible, viewport)),
    ...config.buttons.filter(b => getResponsiveValue(b.belowImage, viewport) && getResponsiveValue(b.visible, viewport))
  ];

  return (
    <div className="mx-auto" style={{ maxWidth: viewportWidth }}>
      {/* Hero Image Area */}
      <div 
        className="relative overflow-hidden"
        style={{
          height,
          backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: `${config.backgroundPosition.x}% ${config.backgroundPosition.y}%`,
          backgroundColor: config.backgroundImage ? undefined : '#374151'
        }}
      >
        {/* Overlay */}
        {config.overlay.enabled && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: config.overlay.color,
              opacity: config.overlay.opacity / 100
            }}
          />
        )}

        {/* Elements on image */}
        {onImageElements.map((element) => {
          if ('logoId' in element) {
            // Logo
            const logo = logos.find(l => l.id === element.logoId);
            if (!logo) return null;
            const position = getResponsiveValue(element.position, viewport);
            const scale = getResponsiveValue(element.scale, viewport) / 100;
            return (
              <div 
                key={element.id} 
                className="absolute"
                style={{
                  left: `${getHorizontalPercent(position)}%`,
                  top: `${getVerticalPercent(position)}%`,
                  transform: `translate(-50%, -50%) scale(${scale})`
                }}
              >
                <div className="bg-gray-200 px-4 py-2 rounded text-sm">
                  Logo: {logo.name}
                </div>
              </div>
            );
          } else if ('content' in element) {
            // Text
            const position = getResponsiveValue(element.position, viewport);
            const fontSize = getResponsiveValue(element.fontSize, viewport);
            return (
              <div 
                key={element.id}
                className="absolute whitespace-pre-wrap text-center"
                style={{
                  left: `${getHorizontalPercent(position)}%`,
                  top: `${getVerticalPercent(position)}%`,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: element.fontFamily,
                  fontSize: `${fontSize}px`,
                  fontWeight: element.fontWeight,
                  color: element.color
                }}
              >
                {element.content}
              </div>
            );
          } else {
            // Button
            const position = getResponsiveValue(element.position, viewport);
            return (
              <div 
                key={element.id}
                className="absolute"
                style={{
                  left: `${getHorizontalPercent(position)}%`,
                  top: `${getVerticalPercent(position)}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <ButtonPreview button={element as HeroButton} />
              </div>
            );
          }
        })}
      </div>

      {/* Below Image Area */}
      {belowImageElements.length > 0 && (
        <div className="bg-white p-6 space-y-4">
          {belowImageElements.map((element) => {
            if ('content' in element) {
              const fontSize = getResponsiveValue(element.fontSize, viewport);
              return (
                <div 
                  key={element.id}
                  className="text-center whitespace-pre-wrap"
                  style={{
                    fontFamily: element.fontFamily,
                    fontSize: `${fontSize}px`,
                    fontWeight: element.fontWeight,
                    color: element.color
                  }}
                >
                  {element.content}
                </div>
              );
            } else if ('text' in element) {
              return (
                <div key={element.id} className="flex justify-center">
                  <ButtonPreview button={element as HeroButton} />
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

// Button Preview
const ButtonPreview: React.FC<{ button: HeroButton }> = ({ button }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition";
  
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-5 py-2.5 text-base',
    large: 'px-7 py-3 text-lg'
  };
  
  const radiusStyles = {
    none: 'rounded-none',
    small: 'rounded',
    medium: 'rounded-lg',
    large: 'rounded-xl',
    pill: 'rounded-full'
  };
  
  const variantStyles = {
    primary: 'bg-rose-500 text-white hover:bg-rose-600',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-white text-white hover:bg-white/20',
    custom: ''
  };

  const customStyle = button.style.variant === 'custom' ? {
    backgroundColor: button.style.backgroundColor,
    color: button.style.textColor,
    borderColor: button.style.borderColor,
    borderWidth: '2px',
    borderStyle: 'solid'
  } : {};

  return (
    <button
      className={`${baseStyles} ${sizeStyles[button.style.size]} ${radiusStyles[button.style.borderRadius]} ${variantStyles[button.style.variant]}`}
      style={customStyle}
    >
      {button.text}
    </button>
  );
};

// Helper functions
const getHorizontalPercent = (position: Position): number => {
  const basePercents: Record<HorizontalPosition, number> = {
    'left': 10, 'left-center': 25, 'center': 50, 'right-center': 75, 'right': 90
  };
  return basePercents[position.horizontal] + position.offsetX;
};

const getVerticalPercent = (position: Position): number => {
  const basePercents: Record<VerticalPosition, number> = {
    'top': 10, 'top-center': 30, 'middle': 50, 'bottom-center': 70, 'bottom': 90
  };
  return basePercents[position.vertical] + position.offsetY;
};

export default HeroV2Editor;
