// =====================================================
// VISUAL EDITOR – CONTENT SECTION
// Properties Panel: Element-spezifischer Content
// Text-Inhalt, Image src/alt, Button text/link
// =====================================================

import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { VEElement, VEText, VEImage, VEButton, TextStylePreset, VEDivider, VESpacer, VEIcon } from '../types/elements';
import { useEditor } from '../state/EditorContext';
import { VERichTextEditor } from '../components/VERichTextEditor';
import { VEMediaPicker } from '../components/VEMediaPicker';
import { VEColorPicker } from '../components/VEColorPicker';
import { VEIconPicker } from '../components/VEIconPicker';

interface ContentSectionProps {
  element: VEElement;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '60px', flexShrink: 0, fontSize: '11px', color: 'var(--admin-text-icon)' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  backgroundColor: 'var(--admin-bg-input)',
  border: '1px solid var(--admin-border-strong)',
  borderRadius: '4px',
  color: 'var(--admin-text)',
  fontSize: '12px',
};

const TEXT_STYLE_OPTIONS: { value: TextStylePreset; label: string }[] = [
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
  { value: 'body', label: 'Body' },
  { value: 'body-sm', label: 'Body Small' },
  { value: 'caption', label: 'Caption' },
  { value: 'price', label: 'Preis' },
  { value: 'label', label: 'Label' },
];

// ===== TEXT CONTENT =====

const TextContent: React.FC<{ element: VEText }> = ({ element }) => {
  const { dispatch } = useEditor();

  return (
    <div>
      {/* Text Style Preset */}
      <Row label="Stil">
        <select
          value={element.textStyle ?? 'body'}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_CONTENT',
              id: element.id,
              updates: { textStyle: e.target.value as TextStylePreset },
            })
          }
          style={inputStyle}
        >
          {TEXT_STYLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Row>

      {/* Text Content */}
      <label style={{ fontSize: '11px', color: 'var(--admin-text-icon)', display: 'block', marginBottom: '4px' }}>
        Inhalt
      </label>
      <VERichTextEditor
        value={element.content}
        onChange={(html) =>
          dispatch({
            type: 'UPDATE_CONTENT',
            id: element.id,
            updates: { content: html },
          })
        }
        placeholder="Text eingeben…"
      />
      <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
        💡 Doppelklick auf Canvas für Inline-Editing
      </div>
    </div>
  );
};

// ===== IMAGE CONTENT =====

const ImageContent: React.FC<{ element: VEImage }> = ({ element }) => {
  const { dispatch } = useEditor();
  const src = element.content?.src || '';
  const alt = element.content?.alt || '';

  return (
    <div>
      {/* Media Picker */}
      <label style={{ fontSize: '11px', color: 'var(--admin-text-icon)', display: 'block', marginBottom: '4px' }}>
        Bild
      </label>
      <VEMediaPicker
        value={src || undefined}
        onChange={(url) =>
          dispatch({
            type: 'UPDATE_CONTENT',
            id: element.id,
            updates: { content: { ...element.content, src: url || '' } },
          })
        }
        label="Bild"
      />

      <div style={{ marginTop: '8px' }}>
        <Row label="Alt-Text">
          <input
            type="text"
            value={alt}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_CONTENT',
                id: element.id,
                updates: { content: { ...element.content, alt: e.target.value } },
              })
            }
            placeholder="Bildbeschreibung"
            style={inputStyle}
          />
        </Row>
      </div>
    </div>
  );
};

// ===== BUTTON CONTENT =====

const ButtonContent: React.FC<{ element: VEButton }> = ({ element }) => {
  const { dispatch } = useEditor();
  const text = element.content?.text || '';
  const link = element.content?.link || '';
  const openInNewTab = element.content?.openInNewTab || false;

  return (
    <div>
      <Row label="Text">
        <input
          type="text"
          value={text}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_CONTENT',
              id: element.id,
              updates: { content: { ...element.content, text: e.target.value } },
            })
          }
          placeholder="Button Text"
          style={inputStyle}
        />
      </Row>

      <Row label="Link">
        <input
          type="text"
          value={link}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_CONTENT',
              id: element.id,
              updates: { content: { ...element.content, link: e.target.value } },
            })
          }
          placeholder="https:// oder /seite"
          style={inputStyle}
        />
      </Row>

      <Row label="Tab">
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={openInNewTab}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_CONTENT',
                id: element.id,
                updates: { content: { ...element.content, openInNewTab: e.target.checked } },
              })
            }
            style={{ accentColor: '#3b82f6' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--admin-text-icon)' }}>Neuer Tab</span>
          <ExternalLink size={12} style={{ color: 'var(--admin-text-icon)' }} />
        </label>
      </Row>
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const ContentSection: React.FC<ContentSectionProps> = ({ element }) => {
  switch (element.type) {
    case 'Text':
      return <TextContent element={element as VEText} />;
    case 'Image':
      return <ImageContent element={element as VEImage} />;
    case 'Button':
      return <ButtonContent element={element as VEButton} />;
    case 'Divider':
      return <DividerContent element={element as VEDivider} />;
    case 'Spacer':
      return <SpacerContent element={element as VESpacer} />;
    case 'Icon':
      return <IconContent element={element as VEIcon} />;
    default:
      return null;
  }
};

// ===== DIVIDER CONTENT =====

const DividerContent: React.FC<{ element: VEDivider }> = ({ element }) => {
  const { dispatch } = useEditor();
  const { lineStyle, thickness, color, width } = element.content;

  const update = (field: string, value: any) => {
    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: { content: { ...element.content, [field]: value } } as any,
    });
  };

  return (
    <div>
      <Row label="Stil">
        <select value={lineStyle} onChange={(e) => update('lineStyle', e.target.value)} style={inputStyle}>
          <option value="solid">Durchgezogen</option>
          <option value="dashed">Gestrichelt</option>
          <option value="dotted">Gepunktet</option>
          <option value="double">Doppelt</option>
        </select>
      </Row>
      <Row label="Stärke">
        <input
          type="number"
          value={thickness}
          onChange={(e) => update('thickness', Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          max={20}
          style={{ ...inputStyle, width: '70px' }}
        />
      </Row>
      <VEColorPicker
        label="Farbe"
        value={color}
        onChange={(cv) => update('color', cv || { kind: 'custom', hex: 'var(--admin-text)' })}
        allowNoColor={false}
      />
      <Row label="Breite">
        <input
          type="text"
          value={width}
          onChange={(e) => update('width', e.target.value)}
          placeholder="100%"
          style={inputStyle}
        />
      </Row>
    </div>
  );
};

// ===== SPACER CONTENT =====

const SpacerContent: React.FC<{ element: VESpacer }> = ({ element }) => {
  const { dispatch } = useEditor();
  const { height } = element.content;

  return (
    <div>
      <Row label="Höhe">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min={4}
            max={200}
            value={height}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_CONTENT',
                id: element.id,
                updates: { content: { height: parseInt(e.target.value) } } as any,
              })
            }
            style={{ flex: 1, accentColor: '#3b82f6' }}
          />
          <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)', minWidth: '40px', textAlign: 'right' }}>{height}px</span>
        </div>
      </Row>
      {/* Quick presets */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {[8, 16, 24, 32, 48, 64, 80, 120].map((h) => (
          <button
            key={h}
            onClick={() =>
              dispatch({
                type: 'UPDATE_CONTENT',
                id: element.id,
                updates: { content: { height: h } } as any,
              })
            }
            style={{
              padding: '2px 6px',
              backgroundColor: height === h ? '#3b82f620' : 'var(--admin-border)',
              border: `1px solid ${height === h ? '#3b82f6' : 'var(--admin-border-strong)'}`,
              borderRadius: '3px',
              fontSize: '11px',
              color: height === h ? '#3b82f6' : 'var(--admin-text-icon)',
              cursor: 'pointer',
            }}
          >
            {h}
          </button>
        ))}
      </div>
    </div>
  );
};

// ===== ICON CONTENT =====

const IconContent: React.FC<{ element: VEIcon }> = ({ element }) => {
  const { dispatch } = useEditor();
  const { iconName, size, color, strokeWidth, containerBg, containerBorderRadius } = element.content;

  const update = (field: string, value: any) => {
    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: { content: { ...element.content, [field]: value } } as any,
    });
  };

  const sizeUnit = element.content.sizeUnit || 'px';

  // Slider max depends on unit
  const sliderMax = sizeUnit === 'px' ? 96 : sizeUnit === 'em' ? 10 : 100;
  const sliderStep = sizeUnit === 'em' ? 0.25 : 1;
  const sliderMin = sizeUnit === 'em' ? 0.5 : sizeUnit === '%' ? 1 : 12;

  // Max border-radius for a perfect circle (based on current icon size + padding in styles)
  const maxRadius = Math.round(size * 1.5);

  return (
    <div>
      {/* ── Icon Picker ─────────────── */}
      <VEIconPicker
        value={iconName}
        onChange={(name) => update('iconName', name)}
      />

      <Row label="Größe">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            value={Math.min(size, sliderMax)}
            onChange={(e) => update('size', parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#3b82f6' }}
          />
          <input
            type="number"
            min={0}
            step={sliderStep}
            value={size}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 0) update('size', v);
            }}
            style={{
              width: '48px',
              padding: '3px 4px',
              backgroundColor: 'var(--admin-bg-input)',
              border: '1px solid var(--admin-border-strong)',
              borderRadius: '4px',
              color: 'var(--admin-text)',
              fontSize: '11px',
              textAlign: 'right',
              outline: 'none',
            }}
          />
          <select
            value={sizeUnit}
            onChange={(e) => update('sizeUnit', e.target.value)}
            style={{
              width: '46px',
              padding: '3px 2px',
              backgroundColor: 'var(--admin-bg-input)',
              border: '1px solid var(--admin-border-strong)',
              borderRadius: '4px',
              color: 'var(--admin-text)',
              fontSize: '11px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="px">px</option>
            <option value="%">%</option>
            <option value="em">em</option>
          </select>
        </div>
      </Row>

      <VEColorPicker
        label="Farbe"
        value={color}
        onChange={(cv) => update('color', cv || { kind: 'custom', hex: 'var(--admin-text-muted)' })}
        allowNoColor={false}
      />

      <Row label="Linie">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.25}
            value={strokeWidth}
            onChange={(e) => update('strokeWidth', parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#3b82f6' }}
          />
          <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)', minWidth: '24px', textAlign: 'right' }}>{strokeWidth}</span>
        </div>
      </Row>

      {/* ── Container ─────────────── */}
      <div style={{ borderTop: '1px solid var(--admin-border-strong)', marginTop: '10px', paddingTop: '10px' }}>
        <div style={{ fontSize: '11px', color: '#8b92a0', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Container</div>

        <VEColorPicker
          label="Hintergrund"
          value={containerBg}
          onChange={(cv) => update('containerBg', cv)}
          allowNoColor={true}
        />

        <Row label="Rundung">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="range"
              min={0}
              max={maxRadius}
              value={containerBorderRadius}
              onChange={(e) => update('containerBorderRadius', parseInt(e.target.value))}
              style={{ flex: 1, accentColor: '#3b82f6' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--admin-text-icon)', minWidth: '32px', textAlign: 'right' }}>{containerBorderRadius}px</span>
          </div>
        </Row>
      </div>
    </div>
  );
};
