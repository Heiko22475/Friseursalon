// =====================================================
// VISUAL EDITOR – CONTENT SECTION
// Properties Panel: Element-spezifischer Content
// Text-Inhalt, Image src/alt, Button text/link
// =====================================================

import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { VEElement, VEText, VEImage, VEButton, TextStylePreset } from '../types/elements';
import { useEditor } from '../state/EditorContext';

interface ContentSectionProps {
  element: VEElement;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '60px', flexShrink: 0, fontSize: '11px', color: '#6b7280' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  backgroundColor: '#2d2d3d',
  border: '1px solid #3d3d4d',
  borderRadius: '4px',
  color: '#d1d5db',
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
      <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
        Inhalt
      </label>
      <textarea
        value={element.content}
        onChange={(e) =>
          dispatch({
            type: 'UPDATE_CONTENT',
            id: element.id,
            updates: { content: e.target.value },
          })
        }
        rows={4}
        style={{
          ...inputStyle,
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: '1.5',
        }}
      />
      <div style={{ fontSize: '10px', color: '#4a4a5a', marginTop: '4px' }}>
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
      <Row label="URL">
        <input
          type="text"
          value={src}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_CONTENT',
              id: element.id,
              updates: { content: { ...element.content, src: e.target.value } },
            })
          }
          placeholder="https://..."
          style={inputStyle}
        />
      </Row>

      {/* Preview */}
      {src && (
        <div
          style={{
            marginBottom: '8px',
            height: '80px',
            borderRadius: '4px',
            backgroundColor: '#2d2d3d',
            backgroundImage: `url(${src})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            border: '1px solid #3d3d4d',
          }}
        />
      )}

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
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Neuer Tab</span>
          <ExternalLink size={12} style={{ color: '#6b7280' }} />
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
    default:
      return null;
  }
};
