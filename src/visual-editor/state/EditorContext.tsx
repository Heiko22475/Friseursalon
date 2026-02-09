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
} from '../utils/elementHelpers';

// ===== STATE =====

export interface EditorState {
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
  navigatorTab: 'elements' | 'tree' | 'pages';
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
  | { type: 'UPDATE_CONTENT'; id: string; updates: Partial<VEElement> }
  | { type: 'REPLACE_ELEMENT'; id: string; newElement: VEElement }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'MARK_SAVED' }
  | { type: 'TOGGLE_NAVIGATOR' }
  | { type: 'SET_NAVIGATOR_TAB'; tab: 'elements' | 'tree' | 'pages' };

// ===== INITIAL STATE =====

export function createInitialState(page: VEPage): EditorState {
  return {
    page,
    selectedId: null,
    hoveredId: null,
    viewport: 'desktop',
    undoStack: [],
    redoStack: [],
    isDirty: false,
    navigatorOpen: true,
    navigatorTab: 'tree',
  };
}

// ===== REDUCER =====

const MAX_UNDO = 50;

function pushUndo(state: EditorState): EditorState {
  const undoStack = [...state.undoStack, state.page].slice(-MAX_UNDO);
  return { ...state, undoStack, redoStack: [] };
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
  initialPage: VEPage;
  children: React.ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ initialPage, children }) => {
  const [state, dispatch] = useReducer(editorReducer, createInitialState(initialPage));

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

      // Ctrl+Z / Cmd+Z → Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      }

      // Ctrl+Shift+Z / Ctrl+Y / Cmd+Shift+Z → Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
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
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && state.selectedId) {
        if (state.selectedId !== state.page.body.id) {
          e.preventDefault();
          dispatch({ type: 'DUPLICATE_ELEMENT', id: state.selectedId });
        }
      }

      // Escape → Selektion aufheben
      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_ELEMENT', id: null });
      }
    },
    [dispatch, state.selectedId, state.page.body.id]
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
