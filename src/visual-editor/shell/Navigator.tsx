// =====================================================
// VISUAL EDITOR Ã¢â‚¬â€œ NAVIGATOR
// Linke Seite: Icon-Bar (48px) + Flyout Panel (~240px)
// =====================================================

import React, { useEffect, useRef } from 'react';
import { Plus, Layers, FileText, Image, Paintbrush, LayoutTemplate, Type } from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import { ElementsTree } from './ElementsTree';
import { AddElementPanel } from './AddElementPanel';
import { PagesPanel } from './PagesPanel';
import { StylesPanel } from './StylesPanel';
import { TypographyPanel } from './TypographyPanel';
import { TemplateGallery, createExampleTemplates } from '../components/TemplateGallery';
import { findElementById, findParent, isContainer } from '../utils/elementHelpers';
import type { VEElement } from '../types/elements';
import { useMediaDialog } from '../state/VEMediaDialogContext';

type NavigatorTab = 'elements' | 'tree' | 'pages' | 'assets' | 'styles' | 'templates' | 'typography';

const navItems: { key: NavigatorTab; icon: React.ReactNode; label: string }[] = [
  { key: 'elements', icon: <Plus size={20} />, label: 'HinzufÃƒÂ¼gen' },
  { key: 'tree', icon: <Layers size={20} />, label: 'Navigator' },
  { key: 'pages', icon: <FileText size={20} />, label: 'Seiten' },
  { key: 'templates', icon: <LayoutTemplate size={20} />, label: 'Templates' },
  { key: 'assets', icon: <Image size={20} />, label: 'Assets' },
  { key: 'styles', icon: <Paintbrush size={20} />, label: 'Klassen' },
  { key: 'typography', icon: <Type size={20} />, label: 'Typografie' },
];

interface NavigatorProps {
  onTreeContextMenu?: (e: React.MouseEvent, element: VEElement) => void;
}

export const Navigator: React.FC<NavigatorProps> = ({ onTreeContextMenu }) => {
  const { state, dispatch } = useEditor();
  const prevSelectedId = useRef(state.selectedId);
  const { openMediaDialog } = useMediaDialog();

  // Track previous selection (no auto-close — user stays on typography tab)
  useEffect(() => {
    prevSelectedId.current = state.selectedId;
  }, [state.selectedId]);

  const insertElement = (newEl: VEElement) => {
    // Bestimme den EinfÃƒÂ¼ge-Ort
    let parentId = state.page.body.id;
    let insertIndex: number | undefined;

    if (state.selectedId) {
      const selected = findElementById(state.page.body, state.selectedId);
      if (selected) {
        // Section, Navbar, Header, Footer Ã¢â€ â€™ nur in Body
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
        // Wenn ausgewÃƒÂ¤hltes Element ein Container ist Ã¢â€ â€™ da rein
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

  /** Ãƒâ€“ffnet den Mediathek-Dialog. Wenn ein VEImage selektiert ist, wird dessen src aktualisiert. */
  const handleAssetsClick = () => {
    const selectedEl = state.selectedId ? findElementById(state.page.body, state.selectedId) : null;

    openMediaDialog((url) => {
      if (selectedEl?.type === 'Image') {
        dispatch({
          type: 'UPDATE_CONTENT',
          id: selectedEl.id,
          updates: { content: { ...(selectedEl as any).content, src: url } },
        });
      }
      // Wenn kein Image selektiert ist, wird die URL ignoriert
      // (der Dialog wurde zum Browsen geÃƒÂ¶ffnet)
    });
  };

  const renderPanel = () => {
    switch (state.navigatorTab) {
      case 'elements':
        return <AddElementPanel />;
      case 'tree':
        return <ElementsTree onContextMenu={onTreeContextMenu} />;
      case 'pages':
        return <PagesPanel />;
      case 'templates':
        return (
          <TemplateGallery
            templates={createExampleTemplates()}
            onSelect={(template) => insertElement(template.element)}
          />
        );
      case 'styles':
        return <StylesPanel />;
      case 'typography':
        return <TypographyPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="ve-navigator" style={{ display: 'flex', height: '100%', flexShrink: 0 }}>
      {/* Icon Bar (48px) */}
      <div
        className="ve-navigator-iconbar"
        style={{
          width: '48px',
          backgroundColor: 'var(--admin-bg-sidebar)',
          borderRight: '1px solid var(--admin-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '8px',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        {navItems.map(item => {
          const isActive = state.navigatorOpen && state.navigatorTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                // Assets-Tab ÃƒÂ¶ffnet den zentralen Mediathek-Dialog statt eines Flyouts
                if (item.key === 'assets') {
                  handleAssetsClick();
                  return;
                }
                if (state.navigatorTab === item.key && state.navigatorOpen) {
                  dispatch({ type: 'TOGGLE_NAVIGATOR' });
                } else {
                  dispatch({ type: 'SET_NAVIGATOR_TAB', tab: item.key });
                }
              }}
              title={item.label}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? '#2563eb33' : 'transparent',
                color: isActive ? 'var(--admin-accent-light)' : 'var(--admin-text-icon)',
                transition: 'all 0.15s',
              }}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* Flyout Panel (~240px, wider for typography) */}
      {state.navigatorOpen && (
        <div
          className="ve-navigator-flyout"
          style={{
            width: state.navigatorTab === 'typography' ? '360px' : '240px',
            backgroundColor: 'var(--admin-bg-card)',
            borderRight: '1px solid var(--admin-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.15s ease',
          }}
        >
          {/* Panel Header */}
          <div
            className="ve-navigator-flyout-header"
            style={{
              padding: '12px 12px 8px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--admin-text-icon)',
              borderBottom: '1px solid var(--admin-border)',
            }}
          >
            {navItems.find(n => n.key === state.navigatorTab)?.label}
          </div>

          {/* Panel Content */}
          {renderPanel()}
        </div>
      )}
    </div>
  );
};
