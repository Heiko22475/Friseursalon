// =====================================================
// VISUAL EDITOR – HAUPTSEITE
// 3-Panel Layout: Navigator | Canvas | Properties
// Context Menu + Clipboard + DnD Integration
// =====================================================

import React, { useCallback, useState } from 'react';
import { EditorProvider } from './state/EditorContext';
import { VEThemeProvider } from './theme/VEThemeBridge';
import { TopBar } from './shell/TopBar';
import { Navigator } from './shell/Navigator';
import { PropertiesPanel } from './shell/PropertiesPanel';
import { CanvasRenderer } from './renderer/CanvasRenderer';
import { useEditor } from './state/EditorContext';
import { ContextMenu } from './components/ContextMenu';
import type { ContextMenuData, ContextMenuAction } from './components/ContextMenu';
import type { VEElement } from './types/elements';
import { findElementById, findParent, getChildren } from './utils/elementHelpers';
import { demoPages } from './data/demoPage';
import './styles/editor.css';

// ===== INNER EDITOR (braucht Context) =====

const EditorInner: React.FC = () => {
  const { state, dispatch } = useEditor();
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

  // === Context Menu: Open ===
  const openContextMenu = useCallback((e: React.MouseEvent, element: VEElement) => {
    e.preventDefault();
    e.stopPropagation();

    const parent = findParent(state.page.body, element.id);
    const isBody = element.type === 'Body';
    const siblings = parent ? getChildren(parent) : [];
    const idx = siblings.findIndex(c => c.id === element.id);
    const isContainerType = ['Body', 'Section', 'Container'].includes(element.type);

    // Select the element
    dispatch({ type: 'SELECT_ELEMENT', id: element.id });

    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      element,
      parentElement: parent,
      canMoveUp: idx > 0,
      canMoveDown: idx >= 0 && idx < siblings.length - 1,
      canDelete: !isBody,
      canDuplicate: !isBody,
      canWrap: !isBody,
      hasClipboard: state.clipboard !== null,
      canPasteInto: isContainerType,
    });
  }, [state.page.body, state.clipboard, dispatch]);

  // === Context Menu: Canvas right-click handler ===
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    // Walk up from target to find the closest [data-ve-id]
    let target = e.target as HTMLElement;
    while (target && !target.getAttribute('data-ve-id')) {
      target = target.parentElement as HTMLElement;
    }
    if (!target) return;

    const veId = target.getAttribute('data-ve-id');
    if (!veId) return;

    const element = findElementById(state.page.body, veId);
    if (!element) return;

    openContextMenu(e, element);
  }, [state.page.body, openContextMenu]);

  // === Context Menu: Tree right-click ===
  const handleTreeContextMenu = useCallback((e: React.MouseEvent, element: VEElement) => {
    openContextMenu(e, element);
  }, [openContextMenu]);

  // === Context Menu: Action handler ===
  const handleContextAction = useCallback((action: ContextMenuAction) => {
    switch (action.type) {
      case 'select-parent':
        dispatch({ type: 'SELECT_ELEMENT', id: action.elementId });
        break;
      case 'copy':
        dispatch({ type: 'COPY_ELEMENT', id: action.elementId });
        break;
      case 'paste':
        dispatch({ type: 'PASTE_ELEMENT', targetId: action.elementId });
        break;
      case 'duplicate':
        dispatch({ type: 'DUPLICATE_ELEMENT', id: action.elementId });
        break;
      case 'delete':
        dispatch({ type: 'REMOVE_ELEMENT', id: action.elementId });
        break;
      case 'move-up':
      case 'move-down':
      case 'move-first':
      case 'move-last': {
        const parent = findParent(state.page.body, action.elementId);
        if (!parent) break;
        const siblings = getChildren(parent);
        const idx = siblings.findIndex(c => c.id === action.elementId);
        if (idx < 0) break;
        let newIdx: number;
        if (action.type === 'move-up') newIdx = idx - 1;
        else if (action.type === 'move-down') newIdx = idx + 1;
        else if (action.type === 'move-first') newIdx = 0;
        else newIdx = siblings.length - 1;
        dispatch({ type: 'MOVE_ELEMENT', elementId: action.elementId, newParentId: parent.id, newIndex: newIdx });
        break;
      }
      case 'wrap-in-container':
        dispatch({ type: 'WRAP_IN_CONTAINER', id: action.elementId });
        break;
      case 'unwrap':
        dispatch({ type: 'UNWRAP_CONTAINER', id: action.elementId });
        break;
      case 'reset-styles':
        dispatch({ type: 'RESET_STYLES', id: action.elementId });
        break;
      case 'toggle-visibility':
        dispatch({ type: 'TOGGLE_VISIBILITY', id: action.elementId });
        break;
    }
  }, [dispatch, state.page.body]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#13131b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Top Bar */}
      <TopBar />

      {/* Main Area: Navigator + Canvas + Properties */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Navigator (left) */}
        <Navigator onTreeContextMenu={handleTreeContextMenu} />

        {/* Canvas (center) */}
        <div
          className="ve-canvas-scroll"
          onClick={() => dispatch({ type: 'SELECT_ELEMENT', id: null })}
          onContextMenu={handleCanvasContextMenu}
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#2a2a3a',
            padding: state.viewport === 'desktop' ? '0' : '24px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <CanvasRenderer
            page={state.page}
            viewport={state.viewport}
            selectedId={state.selectedId}
            hoveredId={state.hoveredId}
            onSelect={(id) => dispatch({ type: 'SELECT_ELEMENT', id })}
            onHover={(id) => dispatch({ type: 'HOVER_ELEMENT', id })}
          />
        </div>

        {/* Properties Panel (right) */}
        <PropertiesPanel />
      </div>

      {/* Context Menu (portal to body) */}
      {contextMenu && (
        <ContextMenu
          data={contextMenu}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

// ===== EXPORTED PAGE =====

const VisualEditorPage: React.FC = () => {
  return (
    <VEThemeProvider>
      <EditorProvider initialPages={demoPages}>
        <EditorInner />
      </EditorProvider>
    </VEThemeProvider>
  );
};

export default VisualEditorPage;
