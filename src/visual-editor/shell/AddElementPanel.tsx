// =====================================================
// VISUAL EDITOR – ADD ELEMENT PANEL
// Panel zum Hinzufügen neuer Elemente
// =====================================================

import React from 'react';
import {
  Rows3,
  Square,
  Type,
  Image,
  MousePointerClick,
  LayoutGrid,
  Heading1,
  Heading2,
  Heading3,
  PanelTop,
  PanelBottom,
} from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import {
  createSection,
  createContainer,
  createText,
  createImage,
  createButton,
  createHeader,
  createFooter,
  findElementById,
  isContainer,
  findParent,
} from '../utils/elementHelpers';
import type { VEElement } from '../types/elements';

interface AddableElement {
  label: string;
  icon: React.ReactNode;
  category: string;
  create: () => VEElement;
}

const addableElements: AddableElement[] = [
  // Struktur
  { label: 'Section', icon: <Rows3 size={18} />, category: 'Struktur', create: createSection },
  { label: 'Container', icon: <Square size={18} />, category: 'Struktur', create: createContainer },
  { label: 'Header', icon: <PanelTop size={18} />, category: 'Struktur', create: createHeader },
  { label: 'Footer', icon: <PanelBottom size={18} />, category: 'Struktur', create: createFooter },
  // Typografie
  { label: 'Heading 1', icon: <Heading1 size={18} />, category: 'Inhalt', create: () => createText('Überschrift', 'h1') },
  { label: 'Heading 2', icon: <Heading2 size={18} />, category: 'Inhalt', create: () => createText('Überschrift', 'h2') },
  { label: 'Heading 3', icon: <Heading3 size={18} />, category: 'Inhalt', create: () => createText('Überschrift', 'h3') },
  { label: 'Text', icon: <Type size={18} />, category: 'Inhalt', create: () => createText('Neuer Text', 'body') },
  // Medien
  { label: 'Bild', icon: <Image size={18} />, category: 'Medien', create: () => createImage() },
  // Interaktion
  { label: 'Button', icon: <MousePointerClick size={18} />, category: 'Interaktion', create: createButton },
  // Komposition
  { label: 'Cards', icon: <LayoutGrid size={18} />, category: 'Komposition', create: () => ({ id: '', type: 'Cards', templateId: 'service', layout: { desktop: { columns: 3 } }, cards: [] } as any) },
];

export const AddElementPanel: React.FC = () => {
  const { state, dispatch } = useEditor();

  const handleAdd = (creator: () => VEElement) => {
    const newEl = creator();

    // Bestimme den Einfüge-Ort
    let parentId = state.page.body.id;

    if (state.selectedId) {
      const selected = findElementById(state.page.body, state.selectedId);
      if (selected) {
        // Section, Header, Footer → nur in Body
        if (newEl.type === 'Section' || newEl.type === 'Header' || newEl.type === 'Footer') {
          parentId = state.page.body.id;
        }
        // Wenn ausgewähltes Element ein Container ist → da rein
        else if (isContainer(selected.type) && selected.type !== 'Body') {
          parentId = selected.id;
        }
        // Sonst: Eltern des selektierten Elements
        else {
          const parent = findParent(state.page.body, selected.id);
          if (parent) parentId = parent.id;
        }
      }
    }

    dispatch({ type: 'INSERT_ELEMENT', parentId, element: newEl });
  };

  // Gruppiere nach Kategorie
  const categories = Array.from(new Set(addableElements.map(e => e.category)));

  return (
    <div style={{ padding: '8px', overflow: 'auto', flex: 1 }}>
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              padding: '4px 8px',
              marginBottom: '4px',
            }}
          >
            {cat}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
            }}
          >
            {addableElements
              .filter(e => e.category === cat)
              .map(el => (
                <button
                  key={el.label}
                  onClick={() => handleAdd(el.create)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 4px',
                    backgroundColor: '#2d2d3d',
                    border: '1px solid #3d3d4d',
                    borderRadius: '6px',
                    color: '#d1d5db',
                    cursor: 'pointer',
                    fontSize: '11px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#3d3d4d';
                    e.currentTarget.style.borderColor = '#4d4d5d';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d2d3d';
                    e.currentTarget.style.borderColor = '#3d3d4d';
                  }}
                >
                  <span style={{ color: '#9ca3af' }}>{el.icon}</span>
                  {el.label}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
