// =====================================================
// VISUAL EDITOR – STYLES PANEL (Navigator Tab)
// Lists all global style classes, allows create/rename/delete
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Pencil, Search, MoreHorizontal, Copy } from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import type { VEElement } from '../types/elements';

/**
 * Count how many elements in a tree use a given class name.
 */
function countClassUsage(root: VEElement, className: string): number {
  let count = 0;
  if (root.classNames?.includes(className)) count++;
  if (root.children) {
    for (const child of root.children) {
      count += countClassUsage(child, className);
    }
  }
  return count;
}

export const StylesPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { globalStyles, editingClass, page } = state;

  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingClass, setRenamingClass] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{ name: string; x: number; y: number } | null>(null);

  const createInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const classNames = Object.keys(globalStyles);

  const filtered = search
    ? classNames.filter((cn) => cn.toLowerCase().includes(search.toLowerCase()))
    : classNames;

  useEffect(() => {
    if (creating && createInputRef.current) createInputRef.current.focus();
  }, [creating]);

  useEffect(() => {
    if (renamingClass && renameInputRef.current) renameInputRef.current.focus();
  }, [renamingClass]);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [contextMenu]);

  const handleCreate = () => {
    const name = newName.trim().replace(/\s+/g, '-').toLowerCase();
    if (!name || globalStyles[name]) return;
    dispatch({ type: 'CREATE_CLASS', name });
    setNewName('');
    setCreating(false);
  };

  const handleRename = (oldName: string) => {
    const name = renameValue.trim().replace(/\s+/g, '-').toLowerCase();
    if (!name || name === oldName || globalStyles[name]) return;
    dispatch({ type: 'RENAME_CLASS', oldName, newName: name });
    setRenamingClass(null);
    setRenameValue('');
  };

  const handleDuplicate = (name: string) => {
    let newName = `${name}-copy`;
    let i = 1;
    while (globalStyles[newName]) {
      newName = `${name}-copy-${++i}`;
    }
    dispatch({
      type: 'CREATE_CLASS',
      name: newName,
      initialStyles: JSON.parse(JSON.stringify(globalStyles[name])),
    });
    setContextMenu(null);
  };

  const handleDelete = (name: string) => {
    dispatch({ type: 'DELETE_CLASS', name });
    setContextMenu(null);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '8px' }}>
      {/* Header + Add */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px 8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-icon)', flex: 1 }}>
          Klassen ({classNames.length})
        </span>
        <button
          onClick={() => setCreating(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#60a5fa',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Neue Klasse erstellen"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Search */}
      {classNames.length > 5 && (
        <div style={{ padding: '0 12px 8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: '8px', top: '6px', color: 'var(--admin-text-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Klasse suchen…"
              style={{
                width: '100%',
                padding: '4px 8px 4px 26px',
                borderRadius: '4px',
                border: '1px solid var(--admin-border)',
                backgroundColor: 'var(--admin-bg-sidebar)',
                color: 'var(--admin-text)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Create Input */}
      {creating && (
        <div style={{ padding: '0 12px 8px' }}>
          <input
            ref={createInputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') { setCreating(false); setNewName(''); }
            }}
            onBlur={() => { if (!newName.trim()) setCreating(false); }}
            placeholder="klassen-name"
            style={{
              width: '100%',
              padding: '5px 8px',
              borderRadius: '4px',
              border: '1px solid #3b82f6',
              backgroundColor: 'var(--admin-bg-sidebar)',
              color: 'var(--admin-text)',
              fontSize: '12px',
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Class List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
        {filtered.length === 0 && !creating && (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '12px' }}>
            {classNames.length === 0
              ? 'Keine Klassen definiert.\nKlicke + um eine zu erstellen.'
              : 'Keine Treffer.'}
          </div>
        )}

        {filtered.map((cn) => {
          const isActive = editingClass === cn;
          const usage = countClassUsage(page.body, cn);
          const def = globalStyles[cn];
          const hasExtends = !!def._extends;

          return (
            <div key={cn} style={{ position: 'relative' }}>
              {renamingClass === cn ? (
                <div style={{ padding: '4px 8px' }}>
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(cn);
                      if (e.key === 'Escape') { setRenamingClass(null); setRenameValue(''); }
                    }}
                    onBlur={() => { setRenamingClass(null); setRenameValue(''); }}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #f59e0b',
                      backgroundColor: 'var(--admin-bg-sidebar)',
                      color: 'var(--admin-text)',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => dispatch({ type: 'SET_EDITING_CLASS', name: isActive ? null : cn })}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ name: cn, x: e.clientX, y: e.clientY });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '6px 12px',
                    background: isActive ? '#7c5cfc15' : 'none',
                    border: 'none',
                    borderLeft: isActive ? '2px solid #7c5cfc' : '2px solid transparent',
                    cursor: 'pointer',
                    color: isActive ? '#a78bfa' : 'var(--admin-text)',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    textAlign: 'left',
                    borderRadius: '0',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#2d2d3d40';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ color: '#888' }}>.</span>
                  <span style={{ flex: 1 }}>{cn}</span>
                  {hasExtends && (
                    <span style={{ fontSize: '9px', color: 'var(--admin-text-muted)', fontFamily: 'sans-serif' }}>
                      ← {def._extends}
                    </span>
                  )}
                  {def._typo && (
                    <span style={{ fontSize: '9px', color: '#a78bfa', fontFamily: 'sans-serif', fontWeight: 600 }} title={`Typo Token: ${def._typo}`}>
                      T
                    </span>
                  )}
                  <span style={{
                    fontSize: '10px',
                    color: usage > 0 ? '#4ade80' : 'var(--admin-text-muted)',
                    fontFamily: 'sans-serif',
                    minWidth: '16px',
                    textAlign: 'right',
                  }}>
                    {usage}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu({ name: cn, x: e.clientX, y: e.clientY });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--admin-text-muted)',
                      padding: '0',
                      display: 'flex',
                    }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: 'var(--admin-bg-card)',
            border: '1px solid #3d3d5d',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            zIndex: 1000,
            minWidth: '160px',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => {
              dispatch({ type: 'SET_EDITING_CLASS', name: contextMenu.name });
              setContextMenu(null);
            }}
            style={contextMenuItemStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--admin-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Pencil size={12} /> Bearbeiten
          </button>
          <button
            onClick={() => {
              setRenamingClass(contextMenu.name);
              setRenameValue(contextMenu.name);
              setContextMenu(null);
            }}
            style={contextMenuItemStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--admin-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Pencil size={12} /> Umbenennen
          </button>
          <button
            onClick={() => handleDuplicate(contextMenu.name)}
            style={contextMenuItemStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--admin-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Copy size={12} /> Duplizieren
          </button>
          <div style={{ height: '1px', backgroundColor: 'var(--admin-bg-input)', margin: '2px 0' }} />
          <button
            onClick={() => handleDelete(contextMenu.name)}
            style={{ ...contextMenuItemStyle, color: '#f87171' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--admin-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Trash2 size={12} /> Löschen
          </button>
        </div>
      )}
    </div>
  );
};

const contextMenuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 12px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--admin-text)',
  fontSize: '12px',
  textAlign: 'left',
};
