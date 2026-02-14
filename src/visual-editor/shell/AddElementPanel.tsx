// =====================================================
// VISUAL EDITOR – ADD ELEMENT PANEL
// Panel zum Hinzufügen neuer Elemente
// =====================================================

import React, { useState } from 'react';
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
  PanelBottom,
  X,
  Users,
  ShoppingBag,
  Star,
  Grid3X3,
  Navigation,
  AlignHorizontalDistributeCenter,
  Menu,
} from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import {
  createSection,
  createContainer,
  createText,
  createImage,
  createButton,
  createFooter,
  createCards,
  createNavbar,
  findElementById,
  isContainer,
  findParent,
} from '../utils/elementHelpers';
import type { VEElement } from '../types/elements';
import type { CardTemplate } from '../types/cards';
import { useCardTemplates } from '../hooks/useCardTemplates';

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
  { label: 'Navbar', icon: <Navigation size={18} />, category: 'Struktur', create: () => createNavbar('classic') },
  { label: 'Navbar (Zentriert)', icon: <AlignHorizontalDistributeCenter size={18} />, category: 'Struktur', create: () => createNavbar('centered') },
  { label: 'Navbar (Minimal)', icon: <Menu size={18} />, category: 'Struktur', create: () => createNavbar('minimal') },
  { label: 'Footer', icon: <PanelBottom size={18} />, category: 'Struktur', create: createFooter },
  // Header (Legacy – deprecated)
  // { label: 'Header (Legacy)', icon: <PanelTop size={18} />, category: 'Struktur', create: createHeader },
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
  { label: 'Cards', icon: <LayoutGrid size={18} />, category: 'Komposition', create: () => createCards() },
];

// ===== CATEGORY ICONS FOR CARD TEMPLATES =====

const categoryIcons: Record<string, React.ReactNode> = {
  service: <Grid3X3 size={14} />,
  team: <Users size={14} />,
  product: <ShoppingBag size={14} />,
  testimonial: <Star size={14} />,
  general: <LayoutGrid size={14} />,
};

const categoryLabels: Record<string, string> = {
  service: 'Service',
  team: 'Team',
  product: 'Produkt',
  testimonial: 'Bewertung',
  general: 'Allgemein',
};

// ===== CARD TEMPLATE PICKER =====

const CardTemplatePicker: React.FC<{
  templates: CardTemplate[];
  loading: boolean;
  onSelect: (template: CardTemplate) => void;
  onClose: () => void;
}> = ({ templates, loading, onSelect, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: '#1e1e2e',
          border: '1px solid #3d3d4d',
          borderRadius: '12px',
          padding: '24px',
          width: '560px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#d1d5db' }}>
              Karten-Vorlage wählen
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#b0b7c3' }}>
              {loading ? 'Lade Vorlagen aus der Datenbank…' : `${templates.length} Vorlage${templates.length !== 1 ? 'n' : ''} verfügbar`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#b0b7c3',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#b0b7c3', fontSize: '13px' }}>
            Lade Vorlagen…
          </div>
        )}

        {/* Template Grid */}
        {!loading && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '16px',
                backgroundColor: '#2d2d3d',
                border: '1px solid #3d3d4d',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3d3d4d';
                e.currentTarget.style.borderColor = '#6366f1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d2d3d';
                e.currentTarget.style.borderColor = '#3d3d4d';
              }}
            >
              {/* Category badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#6366f1' }}>{categoryIcons[tpl.category] || categoryIcons.general}</span>
                <span style={{ fontSize: '10px', color: '#b0b7c3', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  {categoryLabels[tpl.category] || tpl.category}
                </span>
              </div>
              {/* Template name */}
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#d1d5db' }}>
                {tpl.name}
              </span>
              {/* Description */}
              {tpl.description && (
                <span style={{ fontSize: '11px', color: '#b0b7c3', lineHeight: 1.4 }}>
                  {tpl.description}
                </span>
              )}
              {/* Element preview */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {tpl.elements.map((el, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '1px 6px',
                      backgroundColor: '#1e1e2e',
                      borderRadius: '3px',
                      fontSize: '10px',
                      color: '#b0b7c3',
                    }}
                  >
                    {el.label}
                  </span>
                ))}
              </div>

              {/* Source indicator */}
              {!tpl.isBuiltIn && (
                <span style={{ fontSize: '9px', color: '#22c55e', marginTop: '2px' }}>● aus Datenbank</span>
              )}
            </button>
          ))}
        </div>}
      </div>
    </div>
  );
};

export const AddElementPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const { templates: cardTemplates, loading: templatesLoading } = useCardTemplates();

  const insertElement = (newEl: VEElement) => {
    // Bestimme den Einfüge-Ort
    let parentId = state.page.body.id;
    let insertIndex: number | undefined;

    if (state.selectedId) {
      const selected = findElementById(state.page.body, state.selectedId);
      if (selected) {
        // Section, Navbar, Header, Footer → nur in Body
        if (newEl.type === 'Section' || newEl.type === 'Navbar' || newEl.type === 'Header' || newEl.type === 'Footer' || newEl.type === 'WebsiteBlock') {
          parentId = state.page.body.id;
          // Insert above the currently selected top-level element
          const bodyChildren = state.page.body.children || [];
          // Find the top-level ancestor of the selection
          const topLevelIdx = bodyChildren.findIndex(c => {
            if (c.id === state.selectedId) return true;
            // Check if selection is nested inside this child
            return findElementById(c, state.selectedId!) !== null;
          });
          if (topLevelIdx >= 0) {
            insertIndex = topLevelIdx;
          }
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

    dispatch({ type: 'INSERT_ELEMENT', parentId, element: newEl, index: insertIndex });
  };

  const handleAdd = (creator: () => VEElement, label: string) => {
    // Cards → show template picker instead of instant insert
    if (label === 'Cards') {
      setShowTemplatePicker(true);
      return;
    }

    const newEl = creator();
    insertElement(newEl);
  };

  const handleTemplateSelect = (template: CardTemplate) => {
    setShowTemplatePicker(false);
    const newEl = createCards(template);
    insertElement(newEl);
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
              color: '#b0b7c3',
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
                  onClick={() => handleAdd(el.create, el.label)}
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
                  <span style={{ color: '#b0b7c3' }}>{el.icon}</span>
                  {el.label}
                </button>
              ))}
          </div>
        </div>
      ))}

      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <CardTemplatePicker
          templates={cardTemplates}
          loading={templatesLoading}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
};
