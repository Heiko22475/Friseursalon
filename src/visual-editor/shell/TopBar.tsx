// =====================================================
// VISUAL EDITOR – TOP BAR
// Breadcrumbs, Viewport Switch, Speichern, Zurück
// =====================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Tablet, Smartphone, Undo2, Redo2, Save } from 'lucide-react';
import { useEditor, useEditorKeyboard } from '../state/EditorContext';
import type { VEViewport } from '../types/styles';

export const TopBar: React.FC = () => {
  const { state, dispatch, breadcrumbs } = useEditor();
  const navigate = useNavigate();

  // Keyboard shortcuts aktivieren
  useEditorKeyboard();

  const viewports: { key: VEViewport; icon: React.ReactNode; label: string }[] = [
    { key: 'desktop', icon: <Monitor size={16} />, label: 'Desktop' },
    { key: 'tablet', icon: <Tablet size={16} />, label: 'Tablet' },
    { key: 'mobile', icon: <Smartphone size={16} />, label: 'Mobile' },
  ];

  return (
    <div
      style={{
        height: '48px',
        backgroundColor: '#1e1e2e',
        borderBottom: '1px solid #2d2d3d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        flexShrink: 0,
        color: '#e0e0e0',
        fontSize: '13px',
        userSelect: 'none',
      }}
    >
      {/* Left: Back + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <button
          onClick={() => navigate('/admin')}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            borderRadius: '4px',
          }}
          title="Zurück zum Dashboard"
        >
          <ArrowLeft size={18} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {breadcrumbs.map((el, i) => (
            <React.Fragment key={el.id}>
              {i > 0 && <span style={{ color: '#4a4a5a', margin: '0 2px' }}>/</span>}
              <button
                onClick={() => dispatch({ type: 'SELECT_ELEMENT', id: el.id })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: i === breadcrumbs.length - 1 ? '#60a5fa' : '#9ca3af',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  fontSize: '13px',
                  fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                }}
              >
                {el.label || el.type}
              </button>
            </React.Fragment>
          ))}
          {breadcrumbs.length === 0 && (
            <span style={{ color: '#6b7280' }}>{state.page.name}</span>
          )}
        </div>
      </div>

      {/* Center: Viewport Switch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          backgroundColor: '#2d2d3d',
          borderRadius: '6px',
          padding: '2px',
        }}
      >
        {viewports.map(vp => (
          <button
            key={vp.key}
            onClick={() => dispatch({ type: 'SET_VIEWPORT', viewport: vp.key })}
            title={vp.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: state.viewport === vp.key ? '#3b82f6' : 'transparent',
              color: state.viewport === vp.key ? '#ffffff' : '#9ca3af',
              transition: 'all 0.15s',
            }}
          >
            {vp.icon}
          </button>
        ))}
      </div>

      {/* Right: Undo/Redo + Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'flex-end' }}>
        <button
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={state.undoStack.length === 0}
          style={{
            background: 'none',
            border: 'none',
            color: state.undoStack.length > 0 ? '#9ca3af' : '#4a4a5a',
            cursor: state.undoStack.length > 0 ? 'pointer' : 'default',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Rückgängig (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={() => dispatch({ type: 'REDO' })}
          disabled={state.redoStack.length === 0}
          style={{
            background: 'none',
            border: 'none',
            color: state.redoStack.length > 0 ? '#9ca3af' : '#4a4a5a',
            cursor: state.redoStack.length > 0 ? 'pointer' : 'default',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Wiederholen (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: '#3d3d4d', margin: '0 4px' }} />

        <button
          onClick={() => {
            // TODO: Speichern implementieren
            dispatch({ type: 'MARK_SAVED' });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: state.isDirty ? '#3b82f6' : '#2d2d3d',
            color: state.isDirty ? '#ffffff' : '#6b7280',
            cursor: state.isDirty ? 'pointer' : 'default',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          title="Speichern (Ctrl+S)"
        >
          <Save size={14} />
          Speichern
        </button>
      </div>
    </div>
  );
};
