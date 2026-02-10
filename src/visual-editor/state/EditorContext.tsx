// =====================================================
// VISUAL EDITOR – EDITOR STATE & CONTEXT
// Zentrales State Management für den Visual Editor
// =====================================================

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { VEPage, VEElement } from '../types/elements';
import type { VEViewport, StyleProperties } from '../types/styles';
import {
  findElementById,
  getBreadcrumbPath,
  insertChild,
  removeElement,
  duplicateElement,
  moveElement,
  updateElementStyles,
  updateElementContent,
  replaceElement,
  findParent,
  getChildren,
  deepCloneWithNewIds,
  generateId,
} from '../utils/elementHelpers';

// ===== STATE =====

export interface EditorState {
  /** Alle Seiten */
  pages: VEPage[];
  /** Die aktuell bearbeitete Seite */
  page: VEPage;
  /** ID des selektierten Elements */
  selectedId: string | null;
  /** ID des gehoverten Elements */
  hoveredId: string | null;
  /** Aktueller Viewport */
  viewport: VEViewport;
  /** Undo-Stack */
  undoStack: VEPage[];
  /** Redo-Stack */
  redoStack: VEPage[];
  /** Ob ungespeicherte Änderungen existieren */
  isDirty: boolean;
  /** Navigator Panel offen? */
  navigatorOpen: boolean;
  /** Aktiver Navigator Tab */
  navigatorTab: 'elements' | 'tree' | 'pages' | 'assets';
  /** Clipboard für Copy/Paste */
  clipboard: VEElement | null;
  /** ID des Elements das gerade inline editiert wird */
  editingId: string | null;
  /** Timestamp des letzten Undo-Pushes (für Debounce) */
  _lastUndoPush: number;
}

// ===== ACTIONS =====

export type EditorAction =
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'HOVER_ELEMENT'; id: string | null }
  | { type: 'SET_VIEWPORT'; viewport: VEViewport }
  | { type: 'SET_PAGE'; page: VEPage }
  | { type: 'INSERT_ELEMENT'; parentId: string; element: VEElement; index?: number }
  | { type: 'REMOVE_ELEMENT'; id: string }
  | { type: 'DUPLICATE_ELEMENT'; id: string }
  | { type: 'MOVE_ELEMENT'; elementId: string; newParentId: string; newIndex?: number }
  | { type: 'UPDATE_STYLES'; id: string; viewport: VEViewport; styles: Partial<StyleProperties> }
  | { type: 'UPDATE_STYLES_BATCH'; id: string; viewport: VEViewport; styles: Partial<StyleProperties> }
  | { type: 'UPDATE_CONTENT'; id: string; updates: Partial<VEElement> }
  | { type: 'REPLACE_ELEMENT'; id: string; newElement: VEElement }
  | { type: 'COPY_ELEMENT'; id: string }
  | { type: 'PASTE_ELEMENT'; targetId: string }
  | { type: 'WRAP_IN_CONTAINER'; id: string }
  | { type: 'UNWRAP_CONTAINER'; id: string }
  | { type: 'RESET_STYLES'; id: string }
  | { type: 'TOGGLE_VISIBILITY'; id: string }
  | { type: 'START_INLINE_EDIT'; id: string }
  | { type: 'STOP_INLINE_EDIT' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'MARK_SAVED' }
  | { type: 'TOGGLE_NAVIGATOR' }
  | { type: 'SET_NAVIGATOR_TAB'; tab: 'elements' | 'tree' | 'pages' | 'assets' }
  // Page management
  | { type: 'SWITCH_PAGE'; pageId: string }
  | { type: 'ADD_PAGE'; name: string; route: string }
  | { type: 'DELETE_PAGE'; pageId: string }
  | { type: 'DUPLICATE_PAGE'; pageId: string }
  | { type: 'UPDATE_PAGE_META'; pageId: string; updates: Partial<Pick<VEPage, 'name' | 'route' | 'isPublished'>> }
  | { type: 'MOVE_PAGE'; pageId: string; direction: 'up' | 'down' };

// ===== INITIAL STATE =====

export function createInitialState(pages: VEPage[]): EditorState {
  const firstPage = pages[0];
  return {
    pages,
    page: firstPage,
    selectedId: null,
    hoveredId: null,
    viewport: 'desktop',
    undoStack: [],
    redoStack: [],
    isDirty: false,
    navigatorOpen: true,
    navigatorTab: 'tree',
    clipboard: null,
    editingId: null,
    _lastUndoPush: 0,
  };
}

// ===== REDUCER =====

const MAX_UNDO = 50;

function pushUndo(state: EditorState): EditorState {
  const undoStack = [...state.undoStack, state.page].slice(-MAX_UNDO);
  return { ...state, undoStack, redoStack: [], _lastUndoPush: Date.now() };
}

/** Debounced push: only pushes undo if >300ms since last push */
const UNDO_DEBOUNCE_MS = 300;
function pushUndoDebounced(state: EditorState): EditorState {
  const now = Date.now();
  if (now - state._lastUndoPush < UNDO_DEBOUNCE_MS) {
    // Skip push, just update redo clear
    return { ...state, redoStack: [] };
  }
  return pushUndo(state);
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SELECT_ELEMENT':
      return { ...state, selectedId: action.id };

    case 'HOVER_ELEMENT':
      return { ...state, hoveredId: action.id };

    case 'SET_VIEWPORT':
      return { ...state, viewport: action.viewport };

    case 'SET_PAGE':
      return {
        ...pushUndo(state),
        page: action.page,
        pages: state.pages.map(p => p.id === action.page.id ? action.page : p),
        isDirty: true,
      };

    case 'INSERT_ELEMENT': {
      const newBody = insertChild(state.page.body, action.parentId, action.element, action.index) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        selectedId: action.element.id,
        isDirty: true,
      };
    }

    case 'REMOVE_ELEMENT': {
      const newBody = removeElement(state.page.body, action.id) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        isDirty: true,
      };
    }

    case 'DUPLICATE_ELEMENT': {
      const newBody = duplicateElement(state.page.body, action.id) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

    case 'MOVE_ELEMENT': {
      const newBody = moveElement(state.page.body, action.elementId, action.newParentId, action.newIndex) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

    case 'UPDATE_STYLES': {
      const newBody = updateElementStyles(state.page.body, action.id, action.viewport, action.styles) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

    case 'UPDATE_STYLES_BATCH': {
      // Debounced: rapid slider changes batch into fewer undo entries
      const newBody = updateElementStyles(state.page.body, action.id, action.viewport, action.styles) as any;
      return {
        ...pushUndoDebounced(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

    case 'UPDATE_CONTENT': {
      const newBody = updateElementContent(state.page.body, action.id, action.updates) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

    case 'REPLACE_ELEMENT': {
      const newBody = replaceElement(state.page.body, action.id, action.newElement) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

    case 'COPY_ELEMENT': {
      const el = findElementById(state.page.body, action.id);
      if (!el || el.type === 'Body') return state;
      return { ...state, clipboard: deepCloneWithNewIds(el) };
    }

    case 'PASTE_ELEMENT': {
      if (!state.clipboard) return state;
      const target = findElementById(state.page.body, action.targetId);
      if (!target) return state;
      // Clone again to get fresh IDs for each paste
      const clone = deepCloneWithNewIds(state.clipboard);
      const isTargetContainer = target.type === 'Body' || target.type === 'Section' || target.type === 'Container';
      let newBody: any;
      if (isTargetContainer) {
        // Paste as child
        newBody = insertChild(state.page.body, action.targetId, clone) as any;
      } else {
        // Paste after the element (sibling)
        const parent = findParent(state.page.body, action.targetId);
        if (!parent) return state;
        const siblings = getChildren(parent);
        const idx = siblings.findIndex(c => c.id === action.targetId);
        newBody = insertChild(state.page.body, parent.id, clone, idx + 1) as any;
      }
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        selectedId: clone.id,
        isDirty: true,
      };
    }

    case 'WRAP_IN_CONTAINER': {
      const el = findElementById(state.page.body, action.id);
      if (!el || el.type === 'Body') return state;
      const parent = findParent(state.page.body, action.id);
      if (!parent) return state;
      const siblings = getChildren(parent);
      const idx = siblings.findIndex(c => c.id === action.id);
      // Create wrapper container
      const wrapper: VEElement = {
        id: generateId(),
        type: 'Container',
        label: 'Container',
        styles: { desktop: { display: 'flex', flexDirection: 'column' } },
        children: [el],
      } as VEElement;
      // Remove original, insert wrapper at same position
      let tree = removeElement(state.page.body, action.id) as any;
      tree = insertChild(tree, parent.id, wrapper, idx) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: tree },
        selectedId: wrapper.id,
        isDirty: true,
      };
    }

    case 'UNWRAP_CONTAINER': {
      const container = findElementById(state.page.body, action.id);
      if (!container || container.type === 'Body') return state;
      const parent = findParent(state.page.body, action.id);
      if (!parent) return state;
      const children = getChildren(container);
      const siblings = getChildren(parent);
      const idx = siblings.findIndex(c => c.id === action.id);
      // Remove container, insert children at container's position
      let tree = removeElement(state.page.body, action.id) as any;
      children.forEach((child, i) => {
        tree = insertChild(tree, parent.id, child, idx + i) as any;
      });
      return {
        ...pushUndo(state),
        page: { ...state.page, body: tree },
        selectedId: children.length > 0 ? children[0].id : parent.id,
        isDirty: true,
      };
    }

    case 'RESET_STYLES': {
      const el = findElementById(state.page.body, action.id);
      if (!el) return state;
      const reset = { ...el, styles: { desktop: {} } } as VEElement;
      const newBody = replaceElement(state.page.body, action.id, reset) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

    case 'TOGGLE_VISIBILITY': {
      const el = findElementById(state.page.body, action.id);
      if (!el || el.type === 'Body') return state;
      const current = el.styles?.desktop?.display;
      const newDisplay = current === 'none' ? undefined : 'none';
      const newBody = updateElementStyles(
        state.page.body,
        action.id,
        'desktop',
        { display: newDisplay } as Partial<StyleProperties>
      ) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

    case 'START_INLINE_EDIT':
      return { ...state, editingId: action.id, selectedId: action.id };

    case 'STOP_INLINE_EDIT':
      return { ...state, editingId: null };

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        page: previous,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.page],
        isDirty: true,
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        page: next,
        undoStack: [...state.undoStack, state.page],
        redoStack: state.redoStack.slice(0, -1),
        isDirty: true,
      };
    }

    case 'MARK_SAVED':
      return { ...state, isDirty: false };

    case 'TOGGLE_NAVIGATOR':
      return { ...state, navigatorOpen: !state.navigatorOpen };

    case 'SET_NAVIGATOR_TAB':
      return { ...state, navigatorTab: action.tab, navigatorOpen: true };

    // ========== PAGE MANAGEMENT ==========

    case 'SWITCH_PAGE': {
      const targetPage = state.pages.find(p => p.id === action.pageId);
      if (!targetPage || targetPage.id === state.page.id) return state;
      // Save current page state back into pages array
      const updatedPages = state.pages.map(p =>
        p.id === state.page.id ? state.page : p
      );
      return {
        ...state,
        pages: updatedPages,
        page: targetPage,
        selectedId: null,
        hoveredId: null,
        editingId: null,
        undoStack: [],
        redoStack: [],
      };
    }

    case 'ADD_PAGE': {
      const newPage: VEPage = {
        id: generateId(),
        name: action.name,
        route: action.route,
        isVisualEditor: true,
        isPublished: true,
        body: {
          id: generateId(),
          type: 'Body',
          label: 'Body',
          styles: { desktop: { backgroundColor: { kind: 'custom', hex: '#ffffff' } } },
          children: [
            {
              id: generateId(),
              type: 'Section',
              label: 'Hauptbereich',
              styles: {
                desktop: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: { value: 80, unit: 'px' },
                  paddingBottom: { value: 80, unit: 'px' },
                  paddingLeft: { value: 24, unit: 'px' },
                  paddingRight: { value: 24, unit: 'px' },
                },
              },
              children: [
                {
                  id: generateId(),
                  type: 'Container',
                  label: 'Inhalt',
                  styles: {
                    desktop: {
                      maxWidth: { value: 1100, unit: 'px' },
                      width: { value: 100, unit: '%' },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: { value: 24, unit: 'px' },
                    },
                  },
                  children: [
                    {
                      id: generateId(),
                      type: 'Text',
                      label: 'Seitentitel',
                      content: action.name,
                      textStyle: 'h1' as any,
                      styles: {
                        desktop: {
                          color: { kind: 'custom', hex: '#0f172a' },
                        },
                      },
                    },
                  ],
                },
              ],
            } as any,
          ],
        },
      };
      // Save current page, add new, switch to it
      const pagesWithCurrent = state.pages.map(p =>
        p.id === state.page.id ? state.page : p
      );
      return {
        ...state,
        pages: [...pagesWithCurrent, newPage],
        page: newPage,
        selectedId: null,
        hoveredId: null,
        editingId: null,
        undoStack: [],
        redoStack: [],
        isDirty: true,
      };
    }

    case 'DELETE_PAGE': {
      if (state.pages.length <= 1) return state;
      const remaining = state.pages.filter(p => p.id !== action.pageId);
      // If deleting current page, switch to first remaining
      if (action.pageId === state.page.id) {
        return {
          ...state,
          pages: remaining,
          page: remaining[0],
          selectedId: null,
          hoveredId: null,
          editingId: null,
          undoStack: [],
          redoStack: [],
          isDirty: true,
        };
      }
      return { ...state, pages: remaining, isDirty: true };
    }

    case 'DUPLICATE_PAGE': {
      const source = state.pages.find(p => p.id === action.pageId);
      if (!source) return state;
      const clonedBody = deepCloneWithNewIds(source.body) as any;
      const dup: VEPage = {
        ...source,
        id: generateId(),
        name: source.name + ' (Kopie)',
        route: source.route + '-kopie',
        body: clonedBody,
      };
      const pagesWithCurrent = state.pages.map(p =>
        p.id === state.page.id ? state.page : p
      );
      const idx = pagesWithCurrent.findIndex(p => p.id === action.pageId);
      const newPages = [...pagesWithCurrent];
      newPages.splice(idx + 1, 0, dup);
      return {
        ...state,
        pages: newPages,
        page: dup,
        selectedId: null,
        hoveredId: null,
        editingId: null,
        undoStack: [],
        redoStack: [],
        isDirty: true,
      };
    }

    case 'UPDATE_PAGE_META': {
      const updatedPages = state.pages.map(p =>
        p.id === action.pageId ? { ...p, ...action.updates } : p
      );
      const currentPage = action.pageId === state.page.id
        ? { ...state.page, ...action.updates }
        : state.page;
      return {
        ...state,
        pages: updatedPages,
        page: currentPage,
        isDirty: true,
      };
    }

    case 'MOVE_PAGE': {
      const idx = state.pages.findIndex(p => p.id === action.pageId);
      if (idx < 0) return state;
      const newIdx = action.direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= state.pages.length) return state;
      const newPages = [...state.pages];
      [newPages[idx], newPages[newIdx]] = [newPages[newIdx], newPages[idx]];
      return { ...state, pages: newPages, isDirty: true };
    }

    default:
      return state;
  }
}

// ===== CONTEXT =====

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  /** Convenience: ausgewähltes Element */
  selectedElement: VEElement | null;
  /** Breadcrumb-Pfad zum selektierten Element */
  breadcrumbs: VEElement[];
}

const EditorContext = createContext<EditorContextValue | null>(null);

// ===== PROVIDER =====

interface EditorProviderProps {
  initialPage?: VEPage;
  initialPages?: VEPage[];
  children: React.ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ initialPage, initialPages, children }) => {
  const pages = initialPages || (initialPage ? [initialPage] : []);
  const [state, dispatch] = useReducer(editorReducer, createInitialState(pages));

  const selectedElement = state.selectedId
    ? findElementById(state.page.body, state.selectedId)
    : null;

  const breadcrumbs = state.selectedId
    ? getBreadcrumbPath(state.page.body, state.selectedId)
    : [];

  return (
    <EditorContext.Provider value={{ state, dispatch, selectedElement, breadcrumbs }}>
      {children}
    </EditorContext.Provider>
  );
};

// ===== HOOK =====

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return ctx;
}

// ===== KEYBOARD SHORTCUTS HOOK =====

export function useEditorKeyboard() {
  const { state, dispatch } = useEditor();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Nicht auslösen wenn in einem Input/Textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl+Z / Cmd+Z → Undo
      if (ctrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      }

      // Ctrl+Shift+Z / Ctrl+Y / Cmd+Shift+Z → Redo
      if (ctrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }

      // Ctrl+S / Cmd+S → Speichern
      if (ctrlOrCmd && e.key === 's') {
        e.preventDefault();
        if (state.isDirty) {
          dispatch({ type: 'MARK_SAVED' });
          // TODO: Supabase save integration
        }
      }

      // Ctrl+C / Cmd+C → Kopieren
      if (ctrlOrCmd && e.key === 'c' && state.selectedId) {
        if (state.selectedId !== state.page.body.id) {
          e.preventDefault();
          dispatch({ type: 'COPY_ELEMENT', id: state.selectedId });
        }
      }

      // Ctrl+V / Cmd+V → Einfügen
      if (ctrlOrCmd && e.key === 'v' && state.selectedId && state.clipboard) {
        e.preventDefault();
        dispatch({ type: 'PASTE_ELEMENT', targetId: state.selectedId });
      }

      // Delete / Backspace → Element löschen
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedId) {
        // Nicht Body löschen
        if (state.selectedId !== state.page.body.id) {
          e.preventDefault();
          dispatch({ type: 'REMOVE_ELEMENT', id: state.selectedId });
        }
      }

      // Ctrl+D / Cmd+D → Duplizieren
      if (ctrlOrCmd && e.key === 'd' && state.selectedId) {
        if (state.selectedId !== state.page.body.id) {
          e.preventDefault();
          dispatch({ type: 'DUPLICATE_ELEMENT', id: state.selectedId });
        }
      }

      // Escape → Selektion aufheben oder Eltern wählen
      if (e.key === 'Escape') {
        if (state.selectedId && state.selectedId !== state.page.body.id) {
          // Navigate to parent instead of deselecting
          const parent = findParent(state.page.body, state.selectedId);
          dispatch({ type: 'SELECT_ELEMENT', id: parent ? parent.id : null });
        } else {
          dispatch({ type: 'SELECT_ELEMENT', id: null });
        }
      }

      // Arrow keys → Navigate tree
      if (e.key === 'ArrowUp' && state.selectedId) {
        e.preventDefault();
        const parent = findParent(state.page.body, state.selectedId);
        if (parent) {
          const siblings = getChildren(parent);
          const idx = siblings.findIndex(c => c.id === state.selectedId);
          if (idx > 0) {
            dispatch({ type: 'SELECT_ELEMENT', id: siblings[idx - 1].id });
          } else {
            // Navigate to parent
            dispatch({ type: 'SELECT_ELEMENT', id: parent.id });
          }
        }
      }

      if (e.key === 'ArrowDown' && state.selectedId) {
        e.preventDefault();
        const el = findElementById(state.page.body, state.selectedId);
        if (el) {
          const children = getChildren(el);
          if (children.length > 0) {
            // Go into first child
            dispatch({ type: 'SELECT_ELEMENT', id: children[0].id });
          } else {
            // Go to next sibling
            const parent = findParent(state.page.body, state.selectedId);
            if (parent) {
              const siblings = getChildren(parent);
              const idx = siblings.findIndex(c => c.id === state.selectedId);
              if (idx < siblings.length - 1) {
                dispatch({ type: 'SELECT_ELEMENT', id: siblings[idx + 1].id });
              }
            }
          }
        }
      }
    },
    [dispatch, state.selectedId, state.page.body.id, state.page.body, state.clipboard]
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
