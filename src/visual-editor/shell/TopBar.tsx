// =====================================================
// VISUAL EDITOR – TOP BAR
// Breadcrumbs, Viewport Switch, Speichern, Zurück
// =====================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Tablet, Smartphone, Undo2, Redo2, Save, ChevronDown, FileText, Home, FileJson, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useEditor, useEditorKeyboard } from '../state/EditorContext';
import { useVESave } from '../state/VESaveContext';
import { JsonImportDialog } from './JsonImportDialog';
import type { VEViewport } from '../types/styles';

export const TopBar: React.FC = () => {
  const { state, dispatch, breadcrumbs } = useEditor();
  const navigate = useNavigate();
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { save, isSaving, saveError, dataSource, customerId } = useVESave();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Handle save
  const handleSave = useCallback(async () => {
    if (!state.isDirty && !isSaving) return;

    setSaveStatus('idle');
    const success = await save(state.pages, state.page);
    if (success) {
      dispatch({ type: 'MARK_SAVED' });
      setSaveStatus('success');
      // Reset success indicator after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  }, [state.isDirty, state.pages, state.page, save, dispatch, isSaving]);

  // Keyboard shortcuts aktivieren
  useEditorKeyboard();

  // Ctrl+S save handler (needs VESaveContext which EditorContext doesn't have)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (state.isDirty && !isSaving) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isDirty, isSaving, handleSave]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!pageDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [pageDropdownOpen]);

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

      {/* Center-Left: Page Dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative', marginRight: '12px' }}>
        <button
          onClick={() => setPageDropdownOpen(!pageDropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #3d3d4d',
            backgroundColor: pageDropdownOpen ? '#2d2d3d' : 'transparent',
            color: '#e0e0e0',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
          title="Seite wechseln"
        >
          <FileText size={14} style={{ color: '#9ca3af' }} />
          <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {state.page.name}
          </span>
          <ChevronDown size={12} style={{ color: '#6b7280' }} />
        </button>

        {pageDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              marginTop: '4px',
              backgroundColor: '#1e1e2e',
              border: '1px solid #3d3d4d',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              minWidth: '200px',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000,
              padding: '4px',
            }}
          >
            {state.pages.map((p) => {
              const isActive = p.id === state.page.id;
              const isHome = p.route === '/';
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    dispatch({ type: 'SWITCH_PAGE', pageId: p.id });
                    setPageDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    backgroundColor: isActive ? '#3b82f620' : 'transparent',
                    color: isActive ? '#60a5fa' : '#c0c0c0',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                >
                  {isHome ? (
                    <Home size={14} style={{ color: isActive ? '#60a5fa' : '#6b7280', flexShrink: 0 }} />
                  ) : (
                    <FileText size={14} style={{ color: isActive ? '#60a5fa' : '#6b7280', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: isActive ? 600 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {p.name}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      fontFamily: 'monospace',
                    }}>
                      {p.route}
                    </div>
                  </div>
                  {p.isPublished === false && (
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 600,
                      padding: '1px 4px',
                      borderRadius: '3px',
                      backgroundColor: '#92400e30',
                      color: '#fbbf24',
                      flexShrink: 0,
                    }}>
                      Entwurf
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
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
          onClick={() => setImportDialogOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #3d3d4d',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
          title="JSON importieren (Superadmin)"
        >
          <FileJson size={14} />
          Import
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving || (!state.isDirty && saveStatus !== 'error')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: isSaving
              ? '#2563eb'
              : saveStatus === 'success'
              ? '#16a34a'
              : saveStatus === 'error'
              ? '#dc2626'
              : state.isDirty
              ? '#3b82f6'
              : '#2d2d3d',
            color: isSaving || state.isDirty || saveStatus !== 'idle' ? '#ffffff' : '#6b7280',
            cursor: isSaving ? 'wait' : state.isDirty ? 'pointer' : 'default',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.2s',
            opacity: isSaving ? 0.8 : 1,
          }}
          title={
            dataSource === 'demo'
              ? 'Demo-Modus – kein Speichern in DB (Ctrl+S)'
              : customerId
              ? `Speichern für Kunde ${customerId} (Ctrl+S)`
              : 'Kein Kunde ausgewählt (Ctrl+S)'
          }
        >
          {isSaving ? (
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          ) : saveStatus === 'success' ? (
            <Check size={14} />
          ) : saveStatus === 'error' ? (
            <AlertCircle size={14} />
          ) : (
            <Save size={14} />
          )}
          {isSaving
            ? 'Speichert...'
            : saveStatus === 'success'
            ? 'Gespeichert ✓'
            : saveStatus === 'error'
            ? (saveError || 'Fehler')
            : 'Speichern'}
        </button>

        {/* Data source indicator */}
        {dataSource === 'demo' && (
          <span style={{ fontSize: '10px', color: '#a78bfa', marginLeft: '4px' }} title="Demo-Modus – Änderungen werden nicht in der Datenbank gespeichert">
            🧪 Demo
          </span>
        )}
        {dataSource === 'live' && customerId && (
          <span style={{ fontSize: '10px', color: '#4ade80', marginLeft: '4px' }} title={`Verbunden mit Kunde ${customerId}`}>
            🌐 {customerId}
          </span>
        )}
      </div>

      {/* JSON Import Dialog */}
      <JsonImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
      />
    </div>
  );
};
