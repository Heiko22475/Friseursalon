// =====================================================
// VISUAL EDITOR – PAGES PANEL
// Seitenverwaltung im Navigator-Flyout
// Seiten erstellen, umbenennen, löschen, sortieren, wechseln
// =====================================================

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Plus,
  FileText,
  Trash2,
  Copy,
  GripVertical,
  Pencil,
  Home,
  Globe,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import type { VEPage } from '../types/elements';

// =====================================================
// TYPES
// =====================================================

interface EditingState {
  pageId: string;
  field: 'name' | 'route';
  value: string;
}

// =====================================================
// PAGE ITEM COMPONENT
// =====================================================

interface PageItemProps {
  page: VEPage;
  isActive: boolean;
  index: number;
  totalPages: number;
  onSelect: () => void;
  onRename: (name: string) => void;
  onChangeRoute: (route: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const PageItem: React.FC<PageItemProps> = ({
  page,
  isActive,
  index,
  totalPages,
  onSelect,
  onRename,
  onChangeRoute,
  onDuplicate,
  onDelete,
  onTogglePublish,
  onMoveUp,
  onMoveDown,
}) => {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Track which field is being edited to only focus/select on initial open
  const editingFieldRef = useRef<string | null>(null);

  useEffect(() => {
    if (editing && inputRef.current && editingFieldRef.current !== editing.field) {
      editingFieldRef.current = editing.field;
      inputRef.current.focus();
      inputRef.current.select();
    }
    if (!editing) {
      editingFieldRef.current = null;
    }
  }, [editing?.field, !!editing]);

  const startEditing = (field: 'name' | 'route') => {
    setEditing({
      pageId: page.id,
      field,
      value: field === 'name' ? page.name : page.route,
    });
  };

  const confirmEdit = () => {
    if (!editing) return;
    const trimmed = editing.value.trim();
    if (trimmed) {
      if (editing.field === 'name') {
        onRename(trimmed);
      } else {
        // Ensure route starts with /
        const route = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        onChangeRoute(route);
      }
    }
    setEditing(null);
  };

  const cancelEdit = () => setEditing(null);

  const isHomePage = page.route === '/';
  const isPublished = page.isPublished !== false; // default true

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{
        borderRadius: '6px',
        border: `1px solid ${isActive ? '#3b82f6' : 'transparent'}`,
        backgroundColor: isActive ? '#3b82f620' : 'transparent',
        transition: 'all 0.15s',
        overflow: 'hidden',
      }}
    >
      {/* Main Row */}
      <div
        onClick={onSelect}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Drag Handle */}
        <GripVertical
          size={14}
          style={{
            color: '#9ca3af',
            flexShrink: 0,
            opacity: showActions ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
        />

        {/* Page Icon */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: isActive ? '#3b82f630' : '#2d2d3d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isHomePage ? (
            <Home size={14} style={{ color: isActive ? '#60a5fa' : '#b0b7c3' }} />
          ) : (
            <FileText size={14} style={{ color: isActive ? '#60a5fa' : '#b0b7c3' }} />
          )}
        </div>

        {/* Page Name + Route */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing?.field === 'name' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                ref={inputRef}
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                onBlur={confirmEdit}
                onClick={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  background: '#2d2d3d',
                  border: '1px solid #3b82f6',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  color: '#e0e0e0',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: 0,
                }}
              />
            </div>
          ) : (
            <div
              style={{
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#e0e0e0' : '#c0c0c0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {page.name}
            </div>
          )}

          {editing?.field === 'route' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <input
                ref={inputRef}
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                onBlur={confirmEdit}
                onClick={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  background: '#2d2d3d',
                  border: '1px solid #3b82f6',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  color: '#b0b7c3',
                  fontSize: '11px',
                  outline: 'none',
                  fontFamily: 'monospace',
                  minWidth: 0,
                }}
              />
            </div>
          ) : (
            <div
              style={{
                fontSize: '11px',
                color: '#b0b7c3',
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: '1px',
              }}
            >
              {page.route}
            </div>
          )}
        </div>

        {/* Status Badge */}
        {!isPublished && (
          <div
            style={{
              fontSize: '9px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '2px 5px',
              borderRadius: '3px',
              backgroundColor: '#92400e30',
              color: '#fbbf24',
              flexShrink: 0,
            }}
          >
            Entwurf
          </div>
        )}
      </div>

      {/* Action Bar (visible on hover or when active) */}
      {(showActions || isActive) && !editing && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '0 10px 6px',
            justifyContent: 'flex-end',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ActionButton
            icon={<Pencil size={12} />}
            title="Umbenennen"
            onClick={() => startEditing('name')}
          />
          <ActionButton
            icon={<Globe size={12} />}
            title="Route ändern"
            onClick={() => startEditing('route')}
          />
          <ActionButton
            icon={isPublished ? <EyeOff size={12} /> : <Eye size={12} />}
            title={isPublished ? 'Unveröffentlichen' : 'Veröffentlichen'}
            onClick={onTogglePublish}
          />
          <ActionButton
            icon={<ChevronUp size={12} />}
            title="Nach oben"
            onClick={onMoveUp}
            disabled={index === 0}
          />
          <ActionButton
            icon={<ChevronDown size={12} />}
            title="Nach unten"
            onClick={onMoveDown}
            disabled={index === totalPages - 1}
          />
          <ActionButton
            icon={<Copy size={12} />}
            title="Seite duplizieren"
            onClick={onDuplicate}
          />
          {!isHomePage && (
            <ActionButton
              icon={<Trash2 size={12} />}
              title="Seite löschen"
              onClick={onDelete}
              danger
            />
          )}
        </div>
      )}
    </div>
  );
};

// =====================================================
// ACTION BUTTON (small icon button)
// =====================================================

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, title, onClick, danger, disabled }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    style={{
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      border: 'none',
      cursor: disabled ? 'default' : 'pointer',
      backgroundColor: 'transparent',
      color: disabled ? '#3d3d4d' : danger ? '#ef4444' : '#b0b7c3',
      transition: 'all 0.15s',
      opacity: disabled ? 0.4 : 1,
    }}
  >
    {icon}
  </button>
);

// =====================================================
// ADD PAGE DIALOG (inline)
// =====================================================

interface AddPageDialogProps {
  onAdd: (name: string, route: string) => void;
  onCancel: () => void;
}

const AddPageDialog: React.FC<AddPageDialogProps> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [route, setRoute] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Auto-generate route from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!route || route === '/' + slugify(name)) {
      setRoute('/' + slugify(val));
    }
  };

  const handleSubmit = () => {
    const trimName = name.trim();
    const trimRoute = route.trim() || '/' + slugify(trimName);
    if (!trimName) return;
    onAdd(trimName, trimRoute.startsWith('/') ? trimRoute : '/' + trimRoute);
  };

  return (
    <div
      style={{
        padding: '12px',
        borderTop: '1px solid #2d2d3d',
        backgroundColor: '#1a1a2a',
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#b0b7c3', marginBottom: '8px' }}>
        Neue Seite
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#b0b7c3', marginBottom: '2px', display: 'block' }}>
            Seitenname
          </label>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') onCancel();
            }}
            placeholder="z.B. Leistungen"
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#2d2d3d',
              border: '1px solid #3d3d4d',
              borderRadius: '4px',
              color: '#e0e0e0',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#b0b7c3', marginBottom: '2px', display: 'block' }}>
            Route
          </label>
          <input
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') onCancel();
            }}
            placeholder="/leistungen"
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#2d2d3d',
              border: '1px solid #3d3d4d',
              borderRadius: '4px',
              color: '#b0b7c3',
              fontSize: '13px',
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '5px 12px',
              borderRadius: '4px',
              border: '1px solid #3d3d4d',
              background: 'transparent',
              color: '#b0b7c3',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{
              padding: '5px 12px',
              borderRadius: '4px',
              border: 'none',
              background: name.trim() ? '#3b82f6' : '#2d2d3d',
              color: name.trim() ? '#ffffff' : '#b0b7c3',
              fontSize: '12px',
              fontWeight: 500,
              cursor: name.trim() ? 'pointer' : 'default',
            }}
          >
            Erstellen
          </button>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// HELPER: Slugify
// =====================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

// =====================================================
// MAIN: PAGES PANEL
// =====================================================

export const PagesPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const pages = state.pages;
  const currentPageId = state.page.id;

  const handleSelectPage = useCallback((pageId: string) => {
    if (pageId !== currentPageId) {
      dispatch({ type: 'SWITCH_PAGE', pageId });
    }
  }, [currentPageId, dispatch]);

  const handleAddPage = useCallback((name: string, route: string) => {
    dispatch({ type: 'ADD_PAGE', name, route });
    setShowAddDialog(false);
  }, [dispatch]);

  const handleRenamePage = useCallback((pageId: string, name: string) => {
    dispatch({ type: 'UPDATE_PAGE_META', pageId, updates: { name } });
  }, [dispatch]);

  const handleChangeRoute = useCallback((pageId: string, route: string) => {
    dispatch({ type: 'UPDATE_PAGE_META', pageId, updates: { route } });
  }, [dispatch]);

  const handleDuplicatePage = useCallback((pageId: string) => {
    dispatch({ type: 'DUPLICATE_PAGE', pageId });
  }, [dispatch]);

  const handleDeletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) return;
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    const confirmed = window.confirm(`Seite "${page.name}" wirklich löschen?`);
    if (confirmed) {
      dispatch({ type: 'DELETE_PAGE', pageId });
    }
  }, [pages, dispatch]);

  const handleTogglePublish = useCallback((pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    const isPublished = page.isPublished !== false;
    dispatch({ type: 'UPDATE_PAGE_META', pageId, updates: { isPublished: !isPublished } });
  }, [pages, dispatch]);

  const handleMovePage = useCallback((pageId: string, direction: 'up' | 'down') => {
    dispatch({ type: 'MOVE_PAGE', pageId, direction });
  }, [dispatch]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header with Add button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
        }}
      >
        <span style={{ fontSize: '12px', color: '#b0b7c3' }}>
          {pages.length} {pages.length === 1 ? 'Seite' : 'Seiten'}
        </span>
        <button
          onClick={() => setShowAddDialog(true)}
          title="Neue Seite erstellen"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <Plus size={12} />
          Seite
        </button>
      </div>

      {/* Page List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
        className="ve-canvas-scroll"
      >
        {pages.map((page, index) => (
          <PageItem
            key={page.id}
            page={page}
            isActive={page.id === currentPageId}
            index={index}
            totalPages={pages.length}
            onSelect={() => handleSelectPage(page.id)}
            onRename={(name) => handleRenamePage(page.id, name)}
            onChangeRoute={(route) => handleChangeRoute(page.id, route)}
            onDuplicate={() => handleDuplicatePage(page.id)}
            onDelete={() => handleDeletePage(page.id)}
            onTogglePublish={() => handleTogglePublish(page.id)}
            onMoveUp={() => handleMovePage(page.id, 'up')}
            onMoveDown={() => handleMovePage(page.id, 'down')}
          />
        ))}
      </div>

      {/* Add Page Dialog */}
      {showAddDialog && (
        <AddPageDialog
          onAdd={handleAddPage}
          onCancel={() => setShowAddDialog(false)}
        />
      )}
    </div>
  );
};
