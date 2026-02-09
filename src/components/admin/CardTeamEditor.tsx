// =====================================================
// CARD TEAM EDITOR
// Editor für Team-Karten mit vollständiger Konfiguration
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  ChevronDown, ChevronUp, User, Palette, Layout, Type, Image, Instagram
} from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';
import { MediaLibrary, MediaFile } from './MediaLibrary';
import {
  CardTeamConfig,
  TeamMember,
  BorderRadius,
  Shadow,
  Spacing,
  FontSize,
  FontWeight,
  createDefaultCardTeamConfig
} from '../../types/Cards';
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
      <label className="block text-xs mb-1" style={{ color: 'var(--admin-text-muted)' }}>{label}</label>
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
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, expanded, onToggle, children }) => (
  <div className="border rounded-lg overflow-hidden">
    <div
      className="flex items-center justify-between p-4 cursor-pointer transition"
      style={{ backgroundColor: 'var(--admin-bg-surface)' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg-surface)'}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2 font-medium">
        {icon}
        {title}
      </div>
      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </div>
    {expanded && <div className="p-4 space-y-4">{children}</div>}
  </div>
);

// ===== SELECT COMPONENTS =====

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
    <label className="block text-xs mb-1" style={{ color: 'var(--admin-text-muted)' }}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg text-sm"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// Options
const borderRadiusOptions: SelectOption[] = [
  { value: 'none', label: 'Keine' },
  { value: 'sm', label: 'Klein (2px)' },
  { value: 'md', label: 'Mittel (6px)' },
  { value: 'lg', label: 'Groß (8px)' },
  { value: 'xl', label: 'Sehr groß (12px)' },
  { value: '2xl', label: 'Extra groß (16px)' },
  { value: 'full', label: 'Rund' }
];

const shadowOptions: SelectOption[] = [
  { value: 'none', label: 'Kein Schatten' },
  { value: 'sm', label: 'Leicht' },
  { value: 'md', label: 'Mittel' },
  { value: 'lg', label: 'Stark' },
  { value: 'xl', label: 'Sehr stark' },
  { value: '2xl', label: 'Dramatisch' }
];

const spacingOptions: SelectOption[] = [
  { value: 'none', label: 'Kein Abstand' },
  { value: 'xs', label: 'Extra klein (8px)' },
  { value: 'sm', label: 'Klein (12px)' },
  { value: 'md', label: 'Mittel (16px)' },
  { value: 'lg', label: 'Groß (24px)' },
  { value: 'xl', label: 'Sehr groß (32px)' },
  { value: '2xl', label: 'Extra groß (48px)' }
];

const fontSizeOptions: SelectOption[] = [
  { value: 'xs', label: 'Extra klein (12px)' },
  { value: 'sm', label: 'Klein (14px)' },
  { value: 'base', label: 'Normal (16px)' },
  { value: 'lg', label: 'Groß (18px)' },
  { value: 'xl', label: 'Sehr groß (20px)' },
  { value: '2xl', label: 'Extra groß (24px)' },
  { value: '3xl', label: 'Riesig (30px)' }
];

const fontWeightOptions: SelectOption[] = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' }
];

const hoverEffectOptions: SelectOption[] = [
  { value: 'none', label: 'Kein Effekt' },
  { value: 'lift', label: 'Anheben' },
  { value: 'glow', label: 'Leuchten' },
  { value: 'scale', label: 'Vergrößern' },
  { value: 'border', label: 'Rahmen' }
];

const aspectRatioOptions: SelectOption[] = [
  { value: '1:1', label: 'Quadrat (1:1)' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '3:2', label: 'Foto (3:2)' },
  { value: '16:9', label: 'Breitbild (16:9)' },
  { value: '2:1', label: 'Panorama (2:1)' },
  { value: 'auto', label: 'Automatisch' }
];

const socialTypeOptions: SelectOption[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'email', label: 'E-Mail' },
  { value: 'phone', label: 'Telefon' }
];

// ===== TEAM MEMBER EDITOR =====

interface TeamMemberEditorProps {
  member: TeamMember;
  index: number;
  onUpdate: (updates: Partial<TeamMember>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSelectImage: () => void;
}

const TeamMemberEditor: React.FC<TeamMemberEditorProps> = ({
  member, index, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast, onSelectImage
}) => {
  const [expanded, setExpanded] = useState(index === 0);

  const addSocialLink = () => {
    onUpdate({
      socialLinks: [
        ...(member.socialLinks || []),
        { type: 'instagram', url: '' }
      ]
    });
  };

  const updateSocialLink = (idx: number, updates: Partial<{ type: string; url: string }>) => {
    const links = [...(member.socialLinks || [])];
    links[idx] = { ...links[idx], ...updates } as any;
    onUpdate({ socialLinks: links });
  };

  const removeSocialLink = (idx: number) => {
    onUpdate({
      socialLinks: (member.socialLinks || []).filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--admin-bg-card)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer"
        style={{ backgroundColor: 'var(--admin-bg-surface)' }}
        onClick={() => setExpanded(!expanded)}
      >
        <GripVertical className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
        
        {member.image ? (
          <img 
            src={member.image} 
            alt={member.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--admin-bg-input)' }}>
            <User className="w-5 h-5" style={{ color: 'var(--admin-text-muted)' }} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{member.name || 'Neues Mitglied'}</div>
          <div className="text-sm truncate" style={{ color: 'var(--admin-text-muted)' }}>{member.role || 'Rolle eingeben'}</div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={isFirst}
            className="p-1 rounded disabled:opacity-30 admin-hover-bg"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={isLast}
            className="p-1 rounded disabled:opacity-30 admin-hover-bg"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:bg-red-100 text-red-500 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Bild */}
          <div>
            <label className="block text-sm font-medium mb-2">Bild</label>
            <div className="flex gap-3">
              {member.image ? (
                <img 
                  src={member.image} 
                  alt="Preview"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--admin-bg-input)' }}>
                  <User className="w-8 h-8" style={{ color: 'var(--admin-text-muted)' }} />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  onClick={onSelectImage}
                  className="px-3 py-2 rounded text-sm admin-hover-bg"
                  style={{ backgroundColor: 'var(--admin-bg-input)' }}
                >
                  Bild auswählen
                </button>
                {member.image && (
                  <button
                    onClick={() => onUpdate({ image: undefined })}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded text-sm"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name & Rolle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={member.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Max Mustermann"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rolle / Position</label>
              <input
                type="text"
                value={member.role}
                onChange={(e) => onUpdate({ role: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Stylist"
              />
            </div>
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung (optional)</label>
            <textarea
              value={member.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Kurze Beschreibung der Person..."
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium mb-2">Social Media Links</label>
            <div className="space-y-2">
              {(member.socialLinks || []).map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <select
                    value={link.type}
                    onChange={(e) => updateSocialLink(idx, { type: e.target.value })}
                    className="w-32 px-2 py-2 border rounded-lg text-sm"
                  >
                    {socialTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateSocialLink(idx, { url: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    placeholder={
                      link.type === 'email' ? 'email@beispiel.de' :
                      link.type === 'phone' ? '+49 123 456789' :
                      'https://...'
                    }
                  />
                  <button
                    onClick={() => removeSocialLink(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addSocialLink}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg admin-hover-bg"
                style={{ color: 'var(--admin-text-secondary)' }}
              >
                <Plus className="w-4 h-4" />
                Link hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== MAIN EDITOR =====

interface CardTeamEditorProps {
  pageId?: string;
  blockId?: string;
  config?: CardTeamConfig;
  onChange?: React.Dispatch<React.SetStateAction<CardTeamConfig | null>>;
}

export const CardTeamEditor: React.FC<CardTeamEditorProps> = (props) => {
  const navigate = useNavigate();
  const params = useParams<{ pageId: string; blockId: string }>();
  const { website, updatePage } = useWebsite();

  const pageId = props.pageId || params.pageId || '';
  const blockId = props.blockId || params.blockId || '';

  const [config, setConfig] = useState<CardTeamConfig>(createDefaultCardTeamConfig());
  const [saving, setSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [selectedMemberForImage, setSelectedMemberForImage] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    members: true,
    layout: false,
    cardStyle: false,
    imageStyle: false,
    textStyle: false,
    socialStyle: false,
    sectionStyle: false
  });

  // Load config
  useEffect(() => {
    if (website?.pages) {
      const page = website.pages.find(p => p.id === pageId);
      if (page) {
        const block = page.blocks.find(b => b.id === blockId);
        if (block?.config) {
          setConfig({ ...createDefaultCardTeamConfig(), ...block.config });
        }
      }
    }
  }, [website, pageId, blockId]);

  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      const page = website?.pages?.find(p => p.id === pageId);
      if (page) {
        const updatedBlocks = page.blocks.map(b =>
          b.id === blockId ? { ...b, config } : b
        );
        await updatePage(pageId, { blocks: updatedBlocks });
      }
    } finally {
      setSaving(false);
    }
  };

  // Toggle section
  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Member helpers
  const addMember = () => {
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: '',
      role: '',
      order: config.members.length
    };
    setConfig(prev => ({ ...prev, members: [...prev.members, newMember] }));
  };

  const updateMember = (id: string, updates: Partial<TeamMember>) => {
    setConfig(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const deleteMember = (id: string) => {
    setConfig(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id)
    }));
  };

  const moveMember = (id: string, direction: 'up' | 'down') => {
    const idx = config.members.findIndex(m => m.id === id);
    if (idx === -1) return;
    
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= config.members.length) return;

    const newMembers = [...config.members];
    [newMembers[idx], newMembers[newIdx]] = [newMembers[newIdx], newMembers[idx]];
    newMembers.forEach((m, i) => m.order = i);
    
    setConfig(prev => ({ ...prev, members: newMembers }));
  };

  // Handle media select
  const handleMediaSelect = (files: MediaFile[]) => {
    if (selectedMemberForImage && files.length > 0) {
      updateMember(selectedMemberForImage, { image: files[0].file_url });
    }
    setShowMediaLibrary(false);
    setSelectedMemberForImage(null);
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg admin-hover-bg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Team-Karten bearbeiten</h1>
            <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{config.members.length} Teammitglieder</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg disabled:opacity-50"
          style={{ backgroundColor: 'var(--admin-accent)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--admin-accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--admin-accent)'}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-96 border-r overflow-y-auto" style={{ backgroundColor: 'var(--admin-bg-card)', borderColor: 'var(--admin-border)' }}>
          <div className="p-4 space-y-4">
            {/* TEAM MEMBERS */}
            <Section
              title="Teammitglieder"
              icon={<User className="w-4 h-4" />}
              expanded={expandedSections.members}
              onToggle={() => toggleSection('members')}
            >
              <div className="space-y-3">
                {config.members.map((member, idx) => (
                  <TeamMemberEditor
                    key={member.id}
                    member={member}
                    index={idx}
                    onUpdate={(updates) => updateMember(member.id, updates)}
                    onDelete={() => deleteMember(member.id)}
                    onMoveUp={() => moveMember(member.id, 'up')}
                    onMoveDown={() => moveMember(member.id, 'down')}
                    isFirst={idx === 0}
                    isLast={idx === config.members.length - 1}
                    onSelectImage={() => {
                      setSelectedMemberForImage(member.id);
                      setShowMediaLibrary(true);
                    }}
                  />
                ))}
                <button
                  onClick={addMember}
                  className="w-full py-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition"
                  style={{ borderColor: 'var(--admin-border-strong)', color: 'var(--admin-text-muted)' }}
                >
                  <Plus className="w-5 h-5" />
                  Mitglied hinzufügen
                </button>
              </div>
            </Section>

            {/* LAYOUT */}
            <Section
              title="Layout"
              icon={<Layout className="w-4 h-4" />}
              expanded={expandedSections.layout}
              onToggle={() => toggleSection('layout')}
            >
              <Select
                label="Darstellung"
                value={config.layout}
                options={[
                  { value: 'grid', label: 'Raster' },
                  { value: 'list', label: 'Liste' },
                  { value: 'carousel', label: 'Karussell' }
                ]}
                onChange={(v) => setConfig(prev => ({ ...prev, layout: v as any }))}
              />

              <Select
                label="Bild-Position"
                value={config.imagePosition}
                options={[
                  { value: 'top', label: 'Oben' },
                  { value: 'left', label: 'Links' },
                  { value: 'background', label: 'Hintergrund' }
                ]}
                onChange={(v) => setConfig(prev => ({ ...prev, imagePosition: v as any }))}
              />

              <div className="grid grid-cols-3 gap-2">
                {['desktop', 'tablet', 'mobile'].map((vp) => (
                  <div key={vp}>
                    <label className="block text-xs mb-1 capitalize" style={{ color: 'var(--admin-text-muted)' }}>{vp}</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={(config.grid.columns as any)[vp] || 1}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        grid: {
                          ...prev.grid,
                          columns: { ...prev.grid.columns, [vp]: Number(e.target.value) }
                        }
                      }))}
                      className="w-full px-2 py-2 border rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>

              <Select
                label="Abstand zwischen Karten"
                value={config.grid.gap}
                options={spacingOptions}
                onChange={(v) => setConfig(prev => ({
                  ...prev,
                  grid: { ...prev.grid, gap: v as Spacing }
                }))}
              />
            </Section>

            {/* CARD STYLE */}
            <Section
              title="Karten-Stil"
              icon={<Palette className="w-4 h-4" />}
              expanded={expandedSections.cardStyle}
              onToggle={() => toggleSection('cardStyle')}
            >
              <ColorPicker
                label="Hintergrundfarbe"
                value={config.cardStyle.backgroundColor}
                onChange={(v) => setConfig(prev => ({
                  ...prev,
                  cardStyle: { ...prev.cardStyle, backgroundColor: v }
                }))}
              />

              <Select
                label="Eckenradius"
                value={config.cardStyle.borderRadius}
                options={borderRadiusOptions}
                onChange={(v) => setConfig(prev => ({
                  ...prev,
                  cardStyle: { ...prev.cardStyle, borderRadius: v as BorderRadius }
                }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--admin-text-muted)' }}>Rahmenbreite</label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={config.cardStyle.borderWidth}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      cardStyle: { ...prev.cardStyle, borderWidth: Number(e.target.value) as any }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <ColorPicker
                  label="Rahmenfarbe"
                  value={config.cardStyle.borderColor}
                  onChange={(v) => setConfig(prev => ({
                    ...prev,
                    cardStyle: { ...prev.cardStyle, borderColor: v }
                  }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Schatten"
                  value={config.cardStyle.shadow}
                  options={shadowOptions}
                  onChange={(v) => setConfig(prev => ({
                    ...prev,
                    cardStyle: { ...prev.cardStyle, shadow: v as Shadow }
                  }))}
                />
                <Select
                  label="Schatten (Hover)"
                  value={config.cardStyle.shadowHover || 'none'}
                  options={shadowOptions}
                  onChange={(v) => setConfig(prev => ({
                    ...prev,
                    cardStyle: { ...prev.cardStyle, shadowHover: v as Shadow }
                  }))}
                />
              </div>

              <Select
                label="Innenabstand"
                value={config.cardStyle.padding}
                options={spacingOptions}
                onChange={(v) => setConfig(prev => ({
                  ...prev,
                  cardStyle: { ...prev.cardStyle, padding: v as Spacing }
                }))}
              />

              <Select
                label="Hover-Effekt"
                value={config.cardStyle.hoverEffect}
                options={hoverEffectOptions}
                onChange={(v) => setConfig(prev => ({
                  ...prev,
                  cardStyle: { ...prev.cardStyle, hoverEffect: v as any }
                }))}
              />

              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--admin-text-muted)' }}>Übergang (ms)</label>
                <input
                  type="range"
                  min={100}
                  max={500}
                  step={50}
                  value={config.cardStyle.transitionDuration}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    cardStyle: { ...prev.cardStyle, transitionDuration: Number(e.target.value) as any }
                  }))}
                  className="w-full"
                />
                <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{config.cardStyle.transitionDuration}ms</span>
              </div>
            </Section>

            {/* IMAGE STYLE */}
            <Section
              title="Bild-Stil"
              icon={<Image className="w-4 h-4" />}
              expanded={expandedSections.imageStyle}
              onToggle={() => toggleSection('imageStyle')}
            >
              <Select
                label="Seitenverhältnis"
                value={config.imageStyle.aspectRatio}
                options={aspectRatioOptions}
                onChange={(v) => setConfig(prev => ({
                  ...prev,
                  imageStyle: { ...prev.imageStyle, aspectRatio: v as any }
                }))}
              />

              <Select
                label="Eckenradius"
                value={config.imageStyle.borderRadius}
                options={borderRadiusOptions}
                onChange={(v) => setConfig(prev => ({
                  ...prev,
                  imageStyle: { ...prev.imageStyle, borderRadius: v as BorderRadius }
                }))}
              />

              <Select
                label="Anpassung"
                value={config.imageStyle.fit}
                options={[
                  { value: 'cover', label: 'Ausfüllen (cover)' },
                  { value: 'contain', label: 'Einpassen (contain)' },
                  { value: 'fill', label: 'Strecken (fill)' }
                ]}
                onChange={(v) => setConfig(prev => ({
                  ...prev,
                  imageStyle: { ...prev.imageStyle, fit: v as any }
                }))}
              />
            </Section>

            {/* TEXT STYLE */}
            <Section
              title="Text-Stil"
              icon={<Type className="w-4 h-4" />}
              expanded={expandedSections.textStyle}
              onToggle={() => toggleSection('textStyle')}
            >
              {/* Titel */}
              <div className="p-3 rounded-lg space-y-3" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
                <h4 className="font-medium text-sm">Name / Titel</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Größe"
                    value={config.textStyle.titleSize}
                    options={fontSizeOptions}
                    onChange={(v) => setConfig(prev => ({
                      ...prev,
                      textStyle: { ...prev.textStyle, titleSize: v as FontSize }
                    }))}
                  />
                  <Select
                    label="Gewicht"
                    value={config.textStyle.titleWeight}
                    options={fontWeightOptions}
                    onChange={(v) => setConfig(prev => ({
                      ...prev,
                      textStyle: { ...prev.textStyle, titleWeight: v as FontWeight }
                    }))}
                  />
                </div>
                <ColorPicker
                  label="Farbe"
                  value={config.textStyle.titleColor}
                  onChange={(v) => setConfig(prev => ({
                    ...prev,
                    textStyle: { ...prev.textStyle, titleColor: v }
                  }))}
                />
                <Select
                  label="Ausrichtung"
                  value={config.textStyle.titleAlign}
                  options={[
                    { value: 'left', label: 'Links' },
                    { value: 'center', label: 'Zentriert' },
                    { value: 'right', label: 'Rechts' }
                  ]}
                  onChange={(v) => setConfig(prev => ({
                    ...prev,
                    textStyle: { ...prev.textStyle, titleAlign: v as any }
                  }))}
                />
              </div>

              {/* Rolle */}
              <div className="p-3 rounded-lg space-y-3" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
                <h4 className="font-medium text-sm">Rolle / Position</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Größe"
                    value={config.textStyle.subtitleSize}
                    options={fontSizeOptions}
                    onChange={(v) => setConfig(prev => ({
                      ...prev,
                      textStyle: { ...prev.textStyle, subtitleSize: v as FontSize }
                    }))}
                  />
                  <Select
                    label="Gewicht"
                    value={config.textStyle.subtitleWeight}
                    options={fontWeightOptions}
                    onChange={(v) => setConfig(prev => ({
                      ...prev,
                      textStyle: { ...prev.textStyle, subtitleWeight: v as FontWeight }
                    }))}
                  />
                </div>
                <ColorPicker
                  label="Farbe"
                  value={config.textStyle.subtitleColor}
                  onChange={(v) => setConfig(prev => ({
                    ...prev,
                    textStyle: { ...prev.textStyle, subtitleColor: v }
                  }))}
                />
              </div>

              {/* Beschreibung */}
              <div className="p-3 rounded-lg space-y-3" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
                <h4 className="font-medium text-sm">Beschreibung</h4>
                <Select
                  label="Größe"
                  value={config.textStyle.descriptionSize}
                  options={fontSizeOptions}
                  onChange={(v) => setConfig(prev => ({
                    ...prev,
                    textStyle: { ...prev.textStyle, descriptionSize: v as FontSize }
                  }))}
                />
                <ColorPicker
                  label="Farbe"
                  value={config.textStyle.descriptionColor}
                  onChange={(v) => setConfig(prev => ({
                    ...prev,
                    textStyle: { ...prev.textStyle, descriptionColor: v }
                  }))}
                />
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--admin-text-muted)' }}>Max. Zeilen (0 = unbegrenzt)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={config.textStyle.descriptionLineClamp || 0}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      textStyle: { 
                        ...prev.textStyle, 
                        descriptionLineClamp: Number(e.target.value) || undefined 
                      }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </Section>

            {/* SOCIAL ICONS */}
            <Section
              title="Social Icons"
              icon={<Instagram className="w-4 h-4" />}
              expanded={expandedSections.socialStyle}
              onToggle={() => toggleSection('socialStyle')}
            >
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showSocialIcons}
                  onChange={(e) => setConfig(prev => ({ ...prev, showSocialIcons: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Social Icons anzeigen</span>
              </label>

              {config.showSocialIcons && (
                <>
                  <Select
                    label="Stil"
                    value={config.socialIconStyle}
                    options={[
                      { value: 'filled', label: 'Gefüllt' },
                      { value: 'outline', label: 'Umrandet' },
                      { value: 'ghost', label: 'Dezent' }
                    ]}
                    onChange={(v) => setConfig(prev => ({ ...prev, socialIconStyle: v as any }))}
                  />

                  <Select
                    label="Größe"
                    value={config.socialIconSize}
                    options={[
                      { value: 'sm', label: 'Klein' },
                      { value: 'md', label: 'Mittel' },
                      { value: 'lg', label: 'Groß' }
                    ]}
                    onChange={(v) => setConfig(prev => ({ ...prev, socialIconSize: v as any }))}
                  />

                  <ColorPicker
                    label="Icon-Farbe"
                    value={config.socialIconColor}
                    onChange={(v) => setConfig(prev => ({ ...prev, socialIconColor: v }))}
                  />
                </>
              )}
            </Section>

            {/* SECTION STYLE */}
            <Section
              title="Sektion-Stil"
              icon={<Layout className="w-4 h-4" />}
              expanded={expandedSections.sectionStyle}
              onToggle={() => toggleSection('sectionStyle')}
            >
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.sectionStyle.showHeader}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    sectionStyle: { ...prev.sectionStyle, showHeader: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Header anzeigen</span>
              </label>

              {config.sectionStyle.showHeader && (
                <>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--admin-text-muted)' }}>Titel</label>
                    <input
                      type="text"
                      value={config.sectionStyle.title || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        sectionStyle: { ...prev.sectionStyle, title: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Unser Team"
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--admin-text-muted)' }}>Untertitel</label>
                    <input
                      type="text"
                      value={config.sectionStyle.subtitle || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        sectionStyle: { ...prev.sectionStyle, subtitle: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Lernen Sie uns kennen"
                    />
                  </div>

                  <Select
                    label="Ausrichtung"
                    value={config.sectionStyle.headerAlign}
                    options={[
                      { value: 'left', label: 'Links' },
                      { value: 'center', label: 'Zentriert' },
                      { value: 'right', label: 'Rechts' }
                    ]}
                    onChange={(v) => setConfig(prev => ({
                      ...prev,
                      sectionStyle: { ...prev.sectionStyle, headerAlign: v as any }
                    }))}
                  />

                  <ColorPicker
                    label="Titel-Farbe"
                    value={config.sectionStyle.titleColor}
                    onChange={(v) => setConfig(prev => ({
                      ...prev,
                      sectionStyle: { ...prev.sectionStyle, titleColor: v }
                    }))}
                  />

                  <ColorPicker
                    label="Untertitel-Farbe"
                    value={config.sectionStyle.subtitleColor}
                    onChange={(v) => setConfig(prev => ({
                      ...prev,
                      sectionStyle: { ...prev.sectionStyle, subtitleColor: v }
                    }))}
                  />
                </>
              )}

              <ColorPicker
                label="Hintergrundfarbe"
                value={config.sectionStyle.backgroundColor}
                onChange={(v) => setConfig(prev => ({
                  ...prev,
                  sectionStyle: { ...prev.sectionStyle, backgroundColor: v }
                }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Abstand Oben/Unten"
                  value={config.sectionStyle.paddingY}
                  options={spacingOptions}
                  onChange={(v) => setConfig(prev => ({
                    ...prev,
                    sectionStyle: { ...prev.sectionStyle, paddingY: v as Spacing }
                  }))}
                />
                <Select
                  label="Abstand Links/Rechts"
                  value={config.sectionStyle.paddingX}
                  options={spacingOptions}
                  onChange={(v) => setConfig(prev => ({
                    ...prev,
                    sectionStyle: { ...prev.sectionStyle, paddingX: v as Spacing }
                  }))}
                />
              </div>

              <Select
                label="Maximale Breite"
                value={config.sectionStyle.maxWidth}
                options={[
                  { value: 'sm', label: 'Klein (672px)' },
                  { value: 'md', label: 'Mittel (896px)' },
                  { value: 'lg', label: 'Groß (1024px)' },
                  { value: 'xl', label: 'Sehr groß (1152px)' },
                  { value: '2xl', label: 'Extra groß (1280px)' },
                  { value: 'full', label: 'Volle Breite' }
                ]}
                onChange={(v) => setConfig(prev => ({
                  ...prev,
                  sectionStyle: { ...prev.sectionStyle, maxWidth: v as any }
                }))}
              />
            </Section>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: 'var(--admin-bg)' }}>
          <div className="rounded-lg overflow-hidden min-h-full" style={{ backgroundColor: 'var(--admin-bg-card)', boxShadow: 'var(--admin-shadow-lg)' }}>
            {/* Import and render CardTeam here */}
            <div className="p-4 text-center" style={{ color: 'var(--admin-text-muted)' }}>
              Live-Vorschau wird hier angezeigt
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibrary
          onSelect={handleMediaSelect}
          onCancel={() => {
            setShowMediaLibrary(false);
            setSelectedMemberForImage(null);
          }}
        />
      )}
    </div>
  );
};

export default CardTeamEditor;
