// =====================================================
// VISUAL EDITOR – NAVIGATOR
// Linke Seite: Icon-Bar (48px) + Flyout Panel (~240px)
// =====================================================

import React from 'react';
import { Plus, Layers, FileText } from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import { ElementsTree } from './ElementsTree';
import { AddElementPanel } from './AddElementPanel';
import type { VEElement } from '../types/elements';

type NavigatorTab = 'elements' | 'tree' | 'pages';

const navItems: { key: NavigatorTab; icon: React.ReactNode; label: string }[] = [
  { key: 'elements', icon: <Plus size={20} />, label: 'Hinzufügen' },
  { key: 'tree', icon: <Layers size={20} />, label: 'Navigator' },
  { key: 'pages', icon: <FileText size={20} />, label: 'Seiten' },
];

interface NavigatorProps {
  onTreeContextMenu?: (e: React.MouseEvent, element: VEElement) => void;
}

export const Navigator: React.FC<NavigatorProps> = ({ onTreeContextMenu }) => {
  const { state, dispatch } = useEditor();

  const renderPanel = () => {
    switch (state.navigatorTab) {
      case 'elements':
        return <AddElementPanel />;
      case 'tree':
        return <ElementsTree onContextMenu={onTreeContextMenu} />;
      case 'pages':
        return (
          <div style={{ padding: '16px', color: '#9ca3af', fontSize: '13px' }}>
            Seiten-Verwaltung wird in Phase 3 implementiert.
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', flexShrink: 0 }}>
      {/* Icon Bar (48px) */}
      <div
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
                color: isActive ? '#60a5fa' : '#6b7280',
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
            style={{
              padding: '12px 12px 8px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#9ca3af',
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
