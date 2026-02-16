// =====================================================
// VISUAL EDITOR – NAVIGATOR
// Linke Seite: Icon-Bar (48px) + Flyout Panel (~240px)
// =====================================================

import React from 'react';
import { Plus, Layers, FileText, Image, Paintbrush, LayoutTemplate } from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import { ElementsTree } from './ElementsTree';
import { AddElementPanel } from './AddElementPanel';
import { PagesPanel } from './PagesPanel';
import { AssetsPanel } from './AssetsPanel';
import { StylesPanel } from './StylesPanel';
import { TemplateGallery, createExampleTemplates } from '../components/TemplateGallery';
import { findElementById, findParent, isContainer } from '../utils/elementHelpers';
import type { VEElement } from '../types/elements';

type NavigatorTab = 'elements' | 'tree' | 'pages' | 'assets' | 'styles' | 'templates';

const navItems: { key: NavigatorTab; icon: React.ReactNode; label: string }[] = [
  { key: 'elements', icon: <Plus size={20} />, label: 'Hinzufügen' },
  { key: 'tree', icon: <Layers size={20} />, label: 'Navigator' },
  { key: 'pages', icon: <FileText size={20} />, label: 'Seiten' },
  { key: 'templates', icon: <LayoutTemplate size={20} />, label: 'Templates' },
  { key: 'assets', icon: <Image size={20} />, label: 'Assets' },
  { key: 'styles', icon: <Paintbrush size={20} />, label: 'Klassen' },
];

interface NavigatorProps {
  onTreeContextMenu?: (e: React.MouseEvent, element: VEElement) => void;
}

export const Navigator: React.FC<NavigatorProps> = ({ onTreeContextMenu }) => {
  const { state, dispatch } = useEditor();

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
      case 'assets':
        return <AssetsPanel />;
      case 'styles':
        return <StylesPanel />;
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
          backgroundColor: '#16161e',
          borderRight: '1px solid #2d2d3d',
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
                color: isActive ? '#60a5fa' : '#b0b7c3',
                transition: 'all 0.15s',
              }}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* Flyout Panel (~240px) */}
      {state.navigatorOpen && (
        <div
          className="ve-navigator-flyout"
          style={{
            width: '240px',
            backgroundColor: '#1e1e2e',
            borderRight: '1px solid #2d2d3d',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
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
              color: '#b0b7c3',
              borderBottom: '1px solid #2d2d3d',
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
