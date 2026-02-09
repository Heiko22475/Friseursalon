// =====================================================
// VISUAL EDITOR – CARDS PROPERTIES
// Properties Panel: Karten-Verwaltung & Layout-Einstellungen
// Template, Spalten, Gap, Karten hinzufügen/löschen/bearbeiten
// =====================================================

import React, { useState } from 'react';
import { Plus, Trash2, Copy, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import type { VECards, VECard, CardElement } from '../types/elements';
import { useEditor } from '../state/EditorContext';
import { createCardFromTemplate } from '../utils/elementHelpers';
import { BUILT_IN_CARD_TEMPLATES } from '../types/cards';
import { VEMediaPicker } from '../components/VEMediaPicker';
import { generateId } from '../utils/elementHelpers';

interface CardsPropertiesProps {
  element: VECards;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  backgroundColor: '#2d2d3d',
  border: '1px solid #3d3d4d',
  borderRadius: '4px',
  color: '#d1d5db',
  fontSize: '12px',
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <label style={{ width: '70px', flexShrink: 0, fontSize: '11px', color: '#6b7280' }}>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ===== CARD ELEMENT EDITOR =====

const CardElementEditor: React.FC<{
  el: CardElement;
  onChange: (updates: Partial<CardElement>) => void;
}> = ({ el, onChange }) => {
  switch (el.type) {
    case 'CardText':
      return (
        <div style={{ marginBottom: '4px' }}>
          <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px', display: 'block' }}>
            {el.label}
            {el.textStyle && (
              <span style={{ marginLeft: '4px', color: '#4a4a5a' }}>({el.textStyle})</span>
            )}
          </label>
          <input
            type="text"
            value={typeof el.content === 'string' ? el.content : ''}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={el.label}
            style={inputStyle}
          />
        </div>
      );

    case 'CardImage':
      return (
        <div style={{ marginBottom: '4px' }}>
          <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px', display: 'block' }}>
            {el.label}
          </label>
          <VEMediaPicker
            value={typeof el.content === 'string' ? el.content : el.content?.src}
            onChange={(url) => onChange({ content: { src: url || '', alt: el.label } })}
            label={el.label}
          />
        </div>
      );

    case 'CardBadge':
      return (
        <div style={{ marginBottom: '4px' }}>
          <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px', display: 'block' }}>
            {el.label}
          </label>
          <input
            type="text"
            value={typeof el.content === 'string' ? el.content : el.content?.text || ''}
            onChange={(e) => onChange({ content: { text: e.target.value } })}
            placeholder="Badge Text"
            style={inputStyle}
          />
        </div>
      );

    case 'CardRating':
      return (
        <div style={{ marginBottom: '4px' }}>
          <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px', display: 'block' }}>
            {el.label}
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              min={0}
              max={el.content?.maxStars ?? 5}
              value={el.content?.value ?? 5}
              onChange={(e) => onChange({ content: { ...el.content, value: Number(e.target.value) } })}
              style={{ ...inputStyle, width: '60px' }}
            />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>/ {el.content?.maxStars ?? 5} Sterne</span>
          </div>
        </div>
      );

    case 'CardButton':
      return (
        <div style={{ marginBottom: '4px' }}>
          <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px', display: 'block' }}>
            {el.label}
          </label>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="text"
              value={el.content?.text || ''}
              onChange={(e) => onChange({ content: { ...el.content, text: e.target.value } })}
              placeholder="Button Text"
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="text"
              value={el.content?.link || ''}
              onChange={(e) => onChange({ content: { ...el.content, link: e.target.value } })}
              placeholder="Link"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </div>
      );

    case 'CardIcon':
      return (
        <div style={{ marginBottom: '4px' }}>
          <label style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px', display: 'block' }}>
            {el.label}
          </label>
          <input
            type="text"
            value={el.content?.icon || ''}
            onChange={(e) => onChange({ content: { icon: e.target.value } })}
            placeholder="Emoji oder Icon"
            style={inputStyle}
          />
        </div>
      );

    default:
      return null;
  }
};

// ===== SINGLE CARD EDITOR =====

const SingleCardEditor: React.FC<{
  card: VECard;
  index: number;
  onChange: (updated: VECard) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ card, index, onChange, onDelete, onDuplicate }) => {
  const [open, setOpen] = useState(false);

  const handleElementChange = (elIdx: number, updates: Partial<CardElement>) => {
    const newElements = [...card.elements];
    newElements[elIdx] = { ...newElements[elIdx], ...updates };
    onChange({ ...card, elements: newElements });
  };

  // Find a label for this card
  const titleEl = card.elements.find(e => e.type === 'CardText' && (e.textStyle === 'h3' || e.textStyle === 'h2'));
  const cardLabel = (titleEl && typeof titleEl.content === 'string' && titleEl.content)
    || `Karte ${index + 1}`;

  return (
    <div
      style={{
        backgroundColor: '#252535',
        border: '1px solid #3d3d4d',
        borderRadius: '6px',
        overflow: 'hidden',
        marginBottom: '4px',
      }}
    >
      {/* Card header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 10px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <GripVertical size={12} style={{ color: '#4a4a5a', flexShrink: 0 }} />
        {open ? <ChevronDown size={12} style={{ color: '#6b7280' }} /> : <ChevronRight size={12} style={{ color: '#6b7280' }} />}
        <span style={{ flex: 1, fontSize: '12px', color: '#d1d5db', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cardLabel}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          title="Duplizieren"
          style={{ padding: '2px', backgroundColor: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', borderRadius: '3px' }}
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Löschen"
          style={{ padding: '2px', backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', borderRadius: '3px' }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Card elements editor */}
      {open && (
        <div style={{ padding: '8px 10px', borderTop: '1px solid #3d3d4d' }}>
          {card.elements.map((el, elIdx) => (
            <CardElementEditor
              key={el.id}
              el={el}
              onChange={(updates) => handleElementChange(elIdx, updates)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const CardsProperties: React.FC<CardsPropertiesProps> = ({ element }) => {
  const { dispatch } = useEditor();

  const template = BUILT_IN_CARD_TEMPLATES.find(t => t.id === element.templateId)
    ?? BUILT_IN_CARD_TEMPLATES[0];

  // Helper: update the full cards array
  const updateCards = (newCards: VECard[]) => {
    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: { cards: newCards },
    });
  };

  // Add a new card from template
  const handleAddCard = () => {
    const newCard = createCardFromTemplate(template);
    updateCards([...element.cards, newCard]);
  };

  // Delete a card
  const handleDeleteCard = (idx: number) => {
    updateCards(element.cards.filter((_, i) => i !== idx));
  };

  // Duplicate a card
  const handleDuplicateCard = (idx: number) => {
    const orig = element.cards[idx];
    const clone: VECard = {
      id: generateId(),
      elements: orig.elements.map(el => ({ ...el, id: generateId() })),
    };
    const newCards = [...element.cards];
    newCards.splice(idx + 1, 0, clone);
    updateCards(newCards);
  };

  // Update single card
  const handleCardChange = (idx: number, updated: VECard) => {
    const newCards = [...element.cards];
    newCards[idx] = updated;
    updateCards(newCards);
  };

  // Update layout
  const updateLayout = (viewport: 'desktop' | 'tablet' | 'mobile', key: string, value: any) => {
    const newLayout = { ...element.layout };
    if (viewport === 'desktop') {
      newLayout.desktop = { ...newLayout.desktop, [key]: value };
    } else {
      newLayout[viewport] = { ...(newLayout[viewport] || {}), [key]: value };
    }
    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: { layout: newLayout },
    });
  };

  // Change template
  const handleTemplateChange = (templateId: string) => {
    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: { templateId },
    });
  };

  return (
    <div>
      {/* Template Selection */}
      <Row label="Vorlage">
        <select
          value={element.templateId}
          onChange={(e) => handleTemplateChange(e.target.value)}
          style={inputStyle}
        >
          {BUILT_IN_CARD_TEMPLATES.map(tpl => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </select>
      </Row>

      {/* Layout: Columns per viewport */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
          Spalten
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['desktop', 'tablet', 'mobile'] as const).map(vp => {
            const cols = vp === 'desktop'
              ? element.layout.desktop.columns
              : element.layout[vp]?.columns ?? '';
            const label = vp === 'desktop' ? '🖥' : vp === 'tablet' ? '📱' : '📲';
            return (
              <div key={vp} style={{ flex: 1 }}>
                <label style={{ fontSize: '10px', color: '#4a4a5a', display: 'block', marginBottom: '2px', textAlign: 'center' }}>
                  {label}
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={cols}
                  onChange={(e) => updateLayout(vp, 'columns', Number(e.target.value) || undefined)}
                  placeholder="auto"
                  style={{ ...inputStyle, textAlign: 'center' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Layout: Gap */}
      <Row label="Abstand">
        <input
          type="number"
          min={0}
          max={100}
          value={element.layout.desktop.gap?.value ?? 24}
          onChange={(e) => updateLayout('desktop', 'gap', { value: Number(e.target.value), unit: 'px' })}
          style={{ ...inputStyle, width: '80px' }}
        />
        <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '4px' }}>px</span>
      </Row>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #2d2d3d', margin: '12px 0' }} />

      {/* Cards List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
          Karten ({element.cards.length})
        </label>
        <button
          onClick={handleAddCard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={12} /> Karte
        </button>
      </div>

      <div>
        {element.cards.map((card, idx) => (
          <SingleCardEditor
            key={card.id}
            card={card}
            index={idx}
            onChange={(updated) => handleCardChange(idx, updated)}
            onDelete={() => handleDeleteCard(idx)}
            onDuplicate={() => handleDuplicateCard(idx)}
          />
        ))}
      </div>

      {element.cards.length === 0 && (
        <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '12px', backgroundColor: '#252535', borderRadius: '6px' }}>
          Keine Karten vorhanden.<br />
          Klicke „+ Karte" um eine hinzuzufügen.
        </div>
      )}
    </div>
  );
};
