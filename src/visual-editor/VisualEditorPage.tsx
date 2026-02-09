// =====================================================
// VISUAL EDITOR – HAUPTSEITE
// 3-Panel Layout: Navigator | Canvas | Properties
// =====================================================

import React from 'react';
import { EditorProvider } from './state/EditorContext';
import { VEThemeProvider } from './theme/VEThemeBridge';
import { TopBar } from './shell/TopBar';
import { Navigator } from './shell/Navigator';
import { PropertiesPanel } from './shell/PropertiesPanel';
import { CanvasRenderer } from './renderer/CanvasRenderer';
import { useEditor } from './state/EditorContext';
import { demoPage } from './data/demoPage';
import './styles/editor.css';

// ===== INNER EDITOR (braucht Context) =====

const EditorInner: React.FC = () => {
  const { state, dispatch } = useEditor();

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
        <Navigator />

        {/* Canvas (center) */}
        <div
          className="ve-canvas-scroll"
          onClick={() => dispatch({ type: 'SELECT_ELEMENT', id: null })}
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
    </div>
  );
};

// ===== EXPORTED PAGE =====

const VisualEditorPage: React.FC = () => {
  return (
    <VEThemeProvider>
      <EditorProvider initialPage={demoPage}>
        <EditorInner />
      </EditorProvider>
    </VEThemeProvider>
  );
};

export default VisualEditorPage;
