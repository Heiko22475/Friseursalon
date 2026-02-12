// =====================================================
// VISUAL EDITOR – CARDS PROPERTIES
// Properties Panel: Karten-Layout-Einstellungen
// Template, Spalten, Gap, Karten hinzufügen/löschen
// Karten-Inhalte werden inline auf dem Canvas bearbeitet.
// =====================================================

import React from 'react';
import { Plus, Trash2, Copy, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import type { VECards, VEElement } from '../types/elements';
import { useEditor } from '../state/EditorContext';
import { createCardFromTemplate, deepCloneWithNewIds, getChildren } from '../utils/elementHelpers';
import { BUILT_IN_CARD_TEMPLATES } from '../types/cards';

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

// ===== MAIN COMPONENT =====

export const CardsProperties: React.FC<CardsPropertiesProps> = ({ element }) => {
  const { dispatch } = useEditor();

  const template = BUILT_IN_CARD_TEMPLATES.find(t => t.id === element.templateId)
    ?? BUILT_IN_CARD_TEMPLATES[0];

  const children = element.children || [];

  // Helper: update the full children array
  const updateChildren = (newChildren: VEElement[]) => {
    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: { children: newChildren },
    });
  };

  // Add a new card from template
  const handleAddCard = () => {
    const newCard = createCardFromTemplate(template);
    updateChildren([...children, newCard]);
  };

  // Delete a card
  const handleDeleteCard = (idx: number) => {
    updateChildren(children.filter((_, i) => i !== idx));
  };

  // Duplicate a card
  const handleDuplicateCard = (idx: number) => {
    const orig = children[idx];
    const clone = deepCloneWithNewIds(orig);
    const newChildren = [...children];
    newChildren.splice(idx + 1, 0, clone);
    updateChildren(newChildren);
  };

  // Move card up/down
  const handleMoveCard = (idx: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= children.length) return;
    const newChildren = [...children];
    [newChildren[idx], newChildren[newIdx]] = [newChildren[newIdx], newChildren[idx]];
    updateChildren(newChildren);
  };

  // Find a label for a card container
  const getCardLabel = (card: VEElement, index: number): string => {
    const cardChildren = getChildren(card);
    const titleEl = cardChildren.find(c => c.type === 'Text' && ('textStyle' in c) && (c.textStyle === 'h3' || c.textStyle === 'h2'));
    if (titleEl && 'content' in titleEl && typeof titleEl.content === 'string' && titleEl.content) {
      return titleEl.content;
    }
    return card.label || `Karte ${index + 1}`;
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

  // Change template (with warning)
  const handleTemplateChange = (templateId: string) => {
    if (templateId === element.templateId) return;

    const newTemplate = BUILT_IN_CARD_TEMPLATES.find(t => t.id === templateId);
    if (!newTemplate) return;

    const confirmed = window.confirm(
      `Beim Wechsel der Vorlage zu „${newTemplate.name}" werden die bestehenden Karten durch die neue Struktur ersetzt.\n\nFortfahren?`
    );
    if (!confirmed) return;

    // Recreate cards with new template structure, keeping count
    const newChildren = children.map(() => createCardFromTemplate(newTemplate));

    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: { templateId, children: newChildren },
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

      {/* Info hint */}
      <div style={{
        padding: '8px 10px',
        backgroundColor: '#3b82f610',
        border: '1px solid #3b82f630',
        borderRadius: '6px',
        marginBottom: '12px',
        fontSize: '11px',
        color: '#93c5fd',
        lineHeight: 1.5,
      }}>
        💡 Karten-Inhalte (Text, Bilder) direkt auf dem Canvas bearbeiten – klicke einfach auf das Element in der Karte.
      </div>

      {/* Cards List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
          Karten ({children.length})
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
        {children.map((card, idx) => {
          const cardLabel = getCardLabel(card, idx);
          return (
            <div
              key={card.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                backgroundColor: '#252535',
                border: '1px solid #3d3d4d',
                borderRadius: '6px',
                marginBottom: '4px',
              }}
            >
              <GripVertical size={12} style={{ color: '#4a4a5a', flexShrink: 0 }} />
              <span style={{
                flex: 1,
                fontSize: '12px',
                color: '#d1d5db',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
                onClick={() => dispatch({ type: 'SELECT_ELEMENT', id: card.id })}
              >
                {cardLabel}
              </span>
              <button
                onClick={() => handleMoveCard(idx, 'up')}
                title="Nach oben"
                disabled={idx === 0}
                style={{ padding: '2px', backgroundColor: 'transparent', border: 'none', color: idx === 0 ? '#3d3d4d' : '#6b7280', cursor: idx === 0 ? 'default' : 'pointer', display: 'flex', borderRadius: '3px' }}
              >
                <ChevronUp size={12} />
              </button>
              <button
                onClick={() => handleMoveCard(idx, 'down')}
                title="Nach unten"
                disabled={idx === children.length - 1}
                style={{ padding: '2px', backgroundColor: 'transparent', border: 'none', color: idx === children.length - 1 ? '#3d3d4d' : '#6b7280', cursor: idx === children.length - 1 ? 'default' : 'pointer', display: 'flex', borderRadius: '3px' }}
              >
                <ChevronDown size={12} />
              </button>
              <button
                onClick={() => handleDuplicateCard(idx)}
                title="Duplizieren"
                style={{ padding: '2px', backgroundColor: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', borderRadius: '3px' }}
              >
                <Copy size={12} />
              </button>
              <button
                onClick={() => handleDeleteCard(idx)}
                title="Löschen"
                style={{ padding: '2px', backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', borderRadius: '3px' }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {children.length === 0 && (
        <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '12px', backgroundColor: '#252535', borderRadius: '6px' }}>
          Keine Karten vorhanden.<br />
          Klicke „+ Karte" um eine hinzuzufügen.
        </div>
      )}
    </div>
  );
};
