// =====================================================
// VISUAL EDITOR – WEBSITE BLOCK PROPERTIES
// Bearbeitungs-Panel für WebsiteBlock-Elemente im VE.
// Zeigt kontextabhängige Felder je nach blockType.
// =====================================================

import React, { useCallback, useState } from 'react';
import type { VEWebsiteBlock } from '../types/elements';
import { useEditor } from '../state/EditorContext';
import { ChevronDown, ChevronRight, Type, Image as ImageIcon, Palette, Trash2 } from 'lucide-react';

// ===== ACCORDION =====

const Accordion: React.FC<{
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--admin-border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--admin-text)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {icon}
        {title}
      </button>
      {open && (
        <div style={{ padding: '0 12px 12px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ===== FIELD COMPONENTS =====

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ fontSize: '11px', color: 'var(--admin-text-icon)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
    {children}
  </label>
);

const TextInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}> = ({ label, value, onChange, placeholder, multiline }) => (
  <div style={{ marginBottom: '8px' }}>
    <FieldLabel>{label}</FieldLabel>
    {multiline ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%',
          padding: '6px 8px',
          backgroundColor: 'var(--admin-bg)',
          border: '1px solid var(--admin-border-strong)',
          borderRadius: '4px',
          color: 'var(--admin-text-heading)',
          fontSize: '12px',
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />
    ) : (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '6px 8px',
          backgroundColor: 'var(--admin-bg)',
          border: '1px solid var(--admin-border-strong)',
          borderRadius: '4px',
          color: 'var(--admin-text-heading)',
          fontSize: '12px',
        }}
      />
    )}
  </div>
);

const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}> = ({ label, value, onChange, min, max, step = 1, suffix }) => (
  <div style={{ marginBottom: '8px' }}>
    <FieldLabel>{label}</FieldLabel>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <input
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        style={{
          width: '100%',
          padding: '6px 8px',
          backgroundColor: 'var(--admin-bg)',
          border: '1px solid var(--admin-border-strong)',
          borderRadius: '4px',
          color: 'var(--admin-text-heading)',
          fontSize: '12px',
        }}
      />
      {suffix && <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)', flexShrink: 0 }}>{suffix}</span>}
    </div>
  </div>
);

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div style={{ marginBottom: '8px' }}>
    <FieldLabel>{label}</FieldLabel>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '28px',
          height: '28px',
          padding: 0,
          border: '1px solid var(--admin-border-strong)',
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: 'transparent',
        }}
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        style={{
          flex: 1,
          padding: '6px 8px',
          backgroundColor: 'var(--admin-bg)',
          border: '1px solid var(--admin-border-strong)',
          borderRadius: '4px',
          color: 'var(--admin-text-heading)',
          fontSize: '12px',
        }}
      />
    </div>
  </div>
);

const SelectInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: '8px' }}>
    <FieldLabel>{label}</FieldLabel>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '6px 8px',
        backgroundColor: 'var(--admin-bg)',
        border: '1px solid var(--admin-border-strong)',
        borderRadius: '4px',
        color: 'var(--admin-text-heading)',
        fontSize: '12px',
        cursor: 'pointer',
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

// ===== HERO EDITOR =====

const HeroBlockEditor: React.FC<{
  config: any;
  onConfigChange: (config: any) => void;
}> = ({ config, onConfigChange }) => {
  const updateField = (path: string, value: any) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const parts = path.split('.');
    let obj = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      if (obj[parts[i]] === undefined) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    onConfigChange(newConfig);
  };

  const texts = config?.texts || [];
  const buttons = config?.buttons || [];

  return (
    <>
      {/* Background */}
      <Accordion title="Hintergrundbild" icon={<ImageIcon size={12} />} defaultOpen>
        <TextInput
          label="Bild-URL"
          value={config?.backgroundImage || ''}
          onChange={(v) => updateField('backgroundImage', v)}
          placeholder="https://..."
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <NumberInput
            label="Position X"
            value={config?.backgroundPosition?.x ?? 50}
            onChange={(v) => updateField('backgroundPosition.x', v)}
            min={0} max={100} suffix="%"
          />
          <NumberInput
            label="Position Y"
            value={config?.backgroundPosition?.y ?? 50}
            onChange={(v) => updateField('backgroundPosition.y', v)}
            min={0} max={100} suffix="%"
          />
        </div>
      </Accordion>

      {/* Height */}
      <Accordion title="Höhe" defaultOpen>
        <TextInput
          label="Desktop"
          value={config?.height?.desktop || '600px'}
          onChange={(v) => updateField('height.desktop', v)}
          placeholder="600px, 80vh, ..."
        />
        <TextInput
          label="Tablet"
          value={config?.height?.tablet || ''}
          onChange={(v) => updateField('height.tablet', v)}
          placeholder="erbt von Desktop"
        />
        <TextInput
          label="Mobil"
          value={config?.height?.mobile || ''}
          onChange={(v) => updateField('height.mobile', v)}
          placeholder="erbt von Desktop"
        />
      </Accordion>

      {/* Overlay */}
      <Accordion title="Overlay" icon={<Palette size={12} />}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={config?.overlay?.enabled ?? false}
            onChange={(e) => updateField('overlay.enabled', e.target.checked)}
            style={{ accentColor: '#3b82f6' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--admin-text)' }}>Overlay aktiviert</span>
        </div>
        {config?.overlay?.enabled && (
          <>
            <ColorInput
              label="Farbe"
              value={config?.overlay?.color || '#000000'}
              onChange={(v) => updateField('overlay.color', v)}
            />
            <NumberInput
              label="Deckkraft"
              value={config?.overlay?.opacity ?? 50}
              onChange={(v) => updateField('overlay.opacity', v)}
              min={0} max={100} suffix="%"
            />
          </>
        )}
      </Accordion>

      {/* Texts */}
      <Accordion title={`Texte (${texts.length})`} icon={<Type size={12} />} defaultOpen>
        {texts.map((text: any, idx: number) => (
          <div
            key={text.id || idx}
            style={{
              padding: '8px',
              marginBottom: '8px',
              backgroundColor: 'var(--admin-bg)',
              borderRadius: '6px',
              border: '1px solid var(--admin-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)', fontWeight: 600 }}>Text {idx + 1}</span>
              <button
                onClick={() => {
                  const newTexts = texts.filter((_: any, i: number) => i !== idx);
                  updateField('texts', newTexts);
                }}
                style={{
                  padding: '2px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                }}
                title="Löschen"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <TextInput
              label="Inhalt"
              value={text.content || ''}
              onChange={(v) => updateField(`texts.${idx}.content`, v)}
              multiline
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <NumberInput
                  label="Schriftgröße (Desktop)"
                  value={text.fontSize?.desktop ?? 48}
                  onChange={(v) => updateField(`texts.${idx}.fontSize.desktop`, v)}
                  min={8} max={200} suffix="px"
                />
              </div>
              <div style={{ flex: 1 }}>
                <SelectInput
                  label="Gewicht"
                  value={text.fontWeight || '700'}
                  onChange={(v) => updateField(`texts.${idx}.fontWeight`, v)}
                  options={[
                    { value: '300', label: 'Light' },
                    { value: '400', label: 'Normal' },
                    { value: '500', label: 'Medium' },
                    { value: '600', label: 'Semi Bold' },
                    { value: '700', label: 'Bold' },
                    { value: '800', label: 'Extra Bold' },
                  ]}
                />
              </div>
            </div>
            <ColorInput
              label="Farbe"
              value={text.color || '#ffffff'}
              onChange={(v) => updateField(`texts.${idx}.color`, v)}
            />
          </div>
        ))}
      </Accordion>

      {/* Buttons */}
      <Accordion title={`Buttons (${buttons.length})`}>
        {buttons.map((btn: any, idx: number) => (
          <div
            key={btn.id || idx}
            style={{
              padding: '8px',
              marginBottom: '8px',
              backgroundColor: 'var(--admin-bg)',
              borderRadius: '6px',
              border: '1px solid var(--admin-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)', fontWeight: 600 }}>Button {idx + 1}</span>
            </div>
            <TextInput
              label="Text"
              value={btn.text || ''}
              onChange={(v) => updateField(`buttons.${idx}.text`, v)}
            />
            <SelectInput
              label="Aktion"
              value={btn.action?.type || 'link'}
              onChange={(v) => updateField(`buttons.${idx}.action.type`, v)}
              options={[
                { value: 'link', label: 'Link' },
                { value: 'scroll', label: 'Scroll zu Element' },
                { value: 'phone', label: 'Telefon' },
                { value: 'email', label: 'E-Mail' },
              ]}
            />
            <TextInput
              label="Ziel"
              value={btn.action?.value || ''}
              onChange={(v) => updateField(`buttons.${idx}.action.value`, v)}
              placeholder={btn.action?.type === 'phone' ? '+49 ...' : btn.action?.type === 'email' ? 'email@...' : 'https://...'}
            />
          </div>
        ))}
      </Accordion>
    </>
  );
};

// ===== GENERIC CARD EDITOR =====

const GenericCardBlockEditor: React.FC<{
  config: any;
  onConfigChange: (config: any) => void;
}> = ({ config, onConfigChange }) => {
  const updateField = (path: string, value: any) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const parts = path.split('.');
    let obj = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      if (obj[parts[i]] === undefined) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    onConfigChange(newConfig);
  };

  const cards = config?.cards || [];
  const sectionStyle = config?.sectionStyle || {};

  return (
    <>
      {/* Section Title */}
      <Accordion title="Abschnitt" defaultOpen>
        <TextInput
          label="Überschrift"
          value={sectionStyle.title || ''}
          onChange={(v) => updateField('sectionStyle.title', v)}
          placeholder="Abschnitt-Titel..."
        />
        <TextInput
          label="Untertitel"
          value={sectionStyle.subtitle || ''}
          onChange={(v) => updateField('sectionStyle.subtitle', v)}
          placeholder="Untertitel..."
        />
        <ColorInput
          label="Hintergrundfarbe"
          value={sectionStyle.backgroundColor || '#ffffff'}
          onChange={(v) => updateField('sectionStyle.backgroundColor', v)}
        />
      </Accordion>

      {/* Layout */}
      <Accordion title="Layout">
        <SelectInput
          label="Layout"
          value={config?.layout || 'grid'}
          onChange={(v) => updateField('layout', v)}
          options={[
            { value: 'grid', label: 'Grid' },
            { value: 'list', label: 'Liste' },
            { value: 'horizontal', label: 'Horizontal' },
            { value: 'vertical', label: 'Vertikal' },
          ]}
        />
        <SelectInput
          label="Karten-Variante"
          value={config?.cardVariant || 'vertical'}
          onChange={(v) => updateField('cardVariant', v)}
          options={[
            { value: 'vertical', label: 'Vertikal' },
            { value: 'horizontal', label: 'Horizontal' },
            { value: 'minimal', label: 'Minimal' },
            { value: 'overlay', label: 'Overlay' },
          ]}
        />
        <NumberInput
          label="Spalten (Desktop)"
          value={config?.columns?.desktop ?? 3}
          onChange={(v) => updateField('columns.desktop', v)}
          min={1} max={6}
        />
        <NumberInput
          label="Spalten (Tablet)"
          value={config?.columns?.tablet ?? 2}
          onChange={(v) => updateField('columns.tablet', v)}
          min={1} max={4}
        />
        <NumberInput
          label="Spalten (Mobil)"
          value={config?.columns?.mobile ?? 1}
          onChange={(v) => updateField('columns.mobile', v)}
          min={1} max={2}
        />
      </Accordion>

      {/* Cards */}
      <Accordion title={`Karten (${cards.length})`} icon={<Type size={12} />} defaultOpen>
        {cards.map((card: any, idx: number) => (
          <div
            key={card.id || idx}
            style={{
              padding: '8px',
              marginBottom: '8px',
              backgroundColor: 'var(--admin-bg)',
              borderRadius: '6px',
              border: '1px solid var(--admin-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)', fontWeight: 600 }}>
                Karte {idx + 1}: {card.title || '(kein Titel)'}
              </span>
              <button
                onClick={() => {
                  const newCards = cards.filter((_: any, i: number) => i !== idx);
                  updateField('cards', newCards);
                }}
                style={{
                  padding: '2px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                }}
                title="Löschen"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <TextInput
              label="Titel"
              value={card.title || ''}
              onChange={(v) => updateField(`cards.${idx}.title`, v)}
            />
            <TextInput
              label="Beschreibung"
              value={card.description || ''}
              onChange={(v) => updateField(`cards.${idx}.description`, v)}
              multiline
            />
            <TextInput
              label="Bild-URL"
              value={card.imageUrl || ''}
              onChange={(v) => updateField(`cards.${idx}.imageUrl`, v)}
              placeholder="https://..."
            />
            {card.overline !== undefined && (
              <TextInput
                label="Overline"
                value={card.overline || ''}
                onChange={(v) => updateField(`cards.${idx}.overline`, v)}
              />
            )}
            {card.subtitle !== undefined && (
              <TextInput
                label="Untertitel"
                value={card.subtitle || ''}
                onChange={(v) => updateField(`cards.${idx}.subtitle`, v)}
              />
            )}
            {card.price !== undefined && (
              <TextInput
                label="Preis"
                value={card.price || ''}
                onChange={(v) => updateField(`cards.${idx}.price`, v)}
                placeholder="z.B. 49,00 €"
              />
            )}
          </div>
        ))}
      </Accordion>
    </>
  );
};

// ===== FALLBACK EDITOR (JSON) =====

const FallbackBlockEditor: React.FC<{
  config: any;
  blockType: string;
  onConfigChange: (config: any) => void;
}> = ({ config, blockType, onConfigChange }) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(config, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setError(null);
      onConfigChange(parsed);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Accordion title={`${blockType} Config (JSON)`} defaultOpen>
      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        rows={15}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: 'var(--admin-bg)',
          border: '1px solid var(--admin-border-strong)',
          borderRadius: '4px',
          color: 'var(--admin-text-heading)',
          fontSize: '11px',
          fontFamily: 'monospace',
          resize: 'vertical',
        }}
      />
      {error && (
        <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{error}</div>
      )}
      <button
        onClick={handleApply}
        style={{
          marginTop: '8px',
          width: '100%',
          padding: '6px 12px',
          backgroundColor: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Übernehmen
      </button>
    </Accordion>
  );
};

// ===== MAIN COMPONENT =====

interface WebsiteBlockPropertiesProps {
  element: VEWebsiteBlock;
}

export const WebsiteBlockProperties: React.FC<WebsiteBlockPropertiesProps> = ({ element }) => {
  const { dispatch } = useEditor();

  const handleConfigChange = useCallback((newConfig: any) => {
    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: {
        blockConfig: newConfig,
      },
    });
  }, [dispatch, element.id]);

  // Block type badge
  const blockTypeLabels: Record<string, string> = {
    hero: '🖼️ Hero-Bereich',
    'generic-card': '🃏 Karten-Block',
    'static_content': '📄 Statischer Inhalt',
    'static-content': '📄 Statischer Inhalt',
    gallery: '🖼️ Galerie',
    services: '💈 Dienstleistungen',
    reviews: '⭐ Bewertungen',
    contact: '📧 Kontakt',
  };

  return (
    <div>
      {/* Block Type Header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--admin-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '14px' }}>
          {blockTypeLabels[element.blockType]?.split(' ')[0] || '📦'}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--admin-text)', fontWeight: 600 }}>
          {blockTypeLabels[element.blockType]?.split(' ').slice(1).join(' ') || element.blockType}
        </span>
      </div>

      {/* Type-specific editor */}
      {element.blockType === 'hero' && (
        <HeroBlockEditor
          config={element.blockConfig}
          onConfigChange={handleConfigChange}
        />
      )}

      {element.blockType === 'generic-card' && (
        <GenericCardBlockEditor
          config={element.blockConfig}
          onConfigChange={handleConfigChange}
        />
      )}

      {/* Fallback for other block types */}
      {!['hero', 'generic-card'].includes(element.blockType) && (
        <FallbackBlockEditor
          config={element.blockConfig}
          blockType={element.blockType}
          onConfigChange={handleConfigChange}
        />
      )}
    </div>
  );
};
