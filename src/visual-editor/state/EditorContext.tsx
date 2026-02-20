// =====================================================
// VISUAL EDITOR – EDITOR STATE & CONTEXT
// Zentrales State Management für den Visual Editor
// =====================================================

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { VEPage, VEElement } from '../types/elements';
import type { VEViewport, StyleProperties, PseudoState, GlobalStyles, NamedStyle } from '../types/styles';
import type { FontTokenMap, TypographyTokenMap, FontToken, TypographyToken } from '../types/typographyTokens';
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
import { setGlobalStyles, setFontTokens, setTypographyTokens } from '../utils/styleResolver';

// ===== STATE =====

/** Snapshot for undo/redo: captures page, global styles, and typography tokens */
interface UndoSnapshot {
  page: VEPage;
  globalStyles: GlobalStyles;
  fontTokens: FontTokenMap;
  typographyTokens: TypographyTokenMap;
}

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
  undoStack: UndoSnapshot[];
  /** Redo-Stack */
  redoStack: UndoSnapshot[];
  /** Ob ungespeicherte Änderungen existieren */
  isDirty: boolean;
  /** Navigator Panel offen? */
  navigatorOpen: boolean;
  /** Aktiver Navigator Tab */
  navigatorTab: 'elements' | 'tree' | 'pages' | 'assets' | 'styles' | 'templates' | 'typography';
  /** Clipboard für Copy/Paste */
  clipboard: VEElement | null;
  /** ID des Elements das gerade inline editiert wird */
  editingId: string | null;
  /** Timestamp des letzten Undo-Pushes (für Debounce) */
  _lastUndoPush: number;
  /** Pro-Modus: Erweiterte CSS-Properties anzeigen */
  proMode: boolean;
  /** Active pseudo-state being edited (null = normal/none) */
  activeState: PseudoState | null;
  /** Global named style classes */
  globalStyles: GlobalStyles;
  /** Font tokens (Level 1) */
  fontTokens: FontTokenMap;
  /** Typography tokens (Level 2) */
  typographyTokens: TypographyTokenMap;
  /** Name of class currently being edited (null = editing element inline) */
  editingClass: string | null;
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
  | { type: 'SET_NAVIGATOR_TAB'; tab: 'elements' | 'tree' | 'pages' | 'assets' | 'styles' | 'templates' | 'typography' }
  // Page management
  | { type: 'SWITCH_PAGE'; pageId: string }
  | { type: 'ADD_PAGE'; name: string; route: string }
  | { type: 'DELETE_PAGE'; pageId: string }
  | { type: 'DUPLICATE_PAGE'; pageId: string }
  | { type: 'UPDATE_PAGE_META'; pageId: string; updates: Partial<Pick<VEPage, 'name' | 'route' | 'isPublished'>> }
  | { type: 'MOVE_PAGE'; pageId: string; direction: 'up' | 'down' }
  | { type: 'TOGGLE_PRO_MODE' }
  | { type: 'SET_ACTIVE_STATE'; state: PseudoState | null }
  | { type: 'UPDATE_PSEUDO_STYLES'; id: string; pseudoState: PseudoState; viewport: VEViewport; styles: Partial<StyleProperties> }
  | { type: 'APPLY_TO_SIBLING_CARDS'; sourceCardId: string }
  // ========== CLASS MANAGEMENT ==========
  | { type: 'CREATE_CLASS'; name: string; initialStyles?: NamedStyle }
  | { type: 'RENAME_CLASS'; oldName: string; newName: string }
  | { type: 'DELETE_CLASS'; name: string }
  | { type: 'UPDATE_CLASS_STYLES'; name: string; viewport: VEViewport; styles: Partial<StyleProperties> }
  | { type: 'UPDATE_CLASS_PSEUDO_STYLES'; name: string; pseudoState: PseudoState; viewport: VEViewport; styles: Partial<StyleProperties> }
  | { type: 'SET_CLASS_EXTENDS'; name: string; extendsName: string | undefined }
  | { type: 'ASSIGN_CLASS'; elementId: string; className: string }
  | { type: 'REMOVE_CLASS'; elementId: string; className: string }
  | { type: 'REORDER_CLASSES'; elementId: string; classNames: string[] }
  | { type: 'SET_EDITING_CLASS'; name: string | null }
  // ========== TYPOGRAPHY TOKEN MANAGEMENT ==========
  | { type: 'SET_FONT_TOKEN'; key: string; token: FontToken }
  | { type: 'SET_STANDARD_FONT_TOKEN'; key: string }
  | { type: 'DELETE_FONT_TOKEN'; key: string; replaceWith: string }
  | { type: 'SET_TYPOGRAPHY_TOKEN'; key: string; token: TypographyToken }
  | { type: 'SET_STANDARD_TYPOGRAPHY_TOKEN'; key: string }
  | { type: 'DELETE_TYPOGRAPHY_TOKEN'; key: string; replaceWith: string }
  | { type: 'RENAME_TYPOGRAPHY_TOKEN'; oldKey: string; newKey: string }
  | { type: 'SET_CLASS_TYPO'; className: string; typoKey: string | undefined };

// ===== INITIAL STATE =====

export function createInitialState(
  pages: VEPage[],
  globalStyles: GlobalStyles = {},
  fontTokens: FontTokenMap = {},
  typographyTokens: TypographyTokenMap = {},
): EditorState {
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
    proMode: typeof window !== 'undefined' && localStorage.getItem('ve-pro-mode') === 'true',
    activeState: null,
    globalStyles,
    fontTokens,
    typographyTokens,
    editingClass: null,
  };
}

// ===== REDUCER =====

const MAX_UNDO = 50;

function pushUndo(state: EditorState): EditorState {
  const snapshot: UndoSnapshot = {
    page: state.page,
    globalStyles: state.globalStyles,
    fontTokens: state.fontTokens,
    typographyTokens: state.typographyTokens,
  };
  const undoStack = [...state.undoStack, snapshot].slice(-MAX_UNDO);
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

/**
 * Sync the current page back into the pages array.
 * Must be called on every reducer result that modifies state.page
 * so that state.pages always reflects the latest edits.
 */
function syncPageToPages(result: EditorState): EditorState {
  return {
    ...result,
    pages: result.pages.map(p =>
      p.id === result.page.id ? result.page : p
    ),
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  const result = editorReducerInner(state, action);

  // Auto-sync: whenever state.page changes, keep state.pages in sync.
  // This ensures that save() always reads the latest edits from state.pages.
  if (result.page !== state.page && result !== state) {
    return syncPageToPages(result);
  }

  return result;
}

function editorReducerInner(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SELECT_ELEMENT':
      return { ...state, selectedId: action.id, activeState: null, editingClass: null };

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

    case 'APPLY_TO_SIBLING_CARDS': {
      const sourceCard = findElementById(state.page.body, action.sourceCardId);
      if (!sourceCard) return state;
      const cardsParent = findParent(state.page.body, action.sourceCardId);
      if (!cardsParent || cardsParent.type !== 'Cards') return state;
      const siblings = getChildren(cardsParent);
      if (siblings.length <= 1) return state;

      /**
       * Recursively apply the source element's styles, content, and label
       * to a target element, matching children by index.
       * IDs are kept — only appearance properties are overwritten.
       */
      function applyAppearance(source: VEElement, target: VEElement): VEElement {
        // Copy styles + content + label from source, keep target's id + type + children structure
        const result: any = {
          ...target,
          styles: source.styles ? JSON.parse(JSON.stringify(source.styles)) : target.styles,
          label: source.label,
        };
        // Copy content (for Text, Image, Button, Icon, Divider, etc.)
        if ('content' in source) {
          result.content = JSON.parse(JSON.stringify((source as any).content));
        }
        // Copy textStyle for Text elements
        if ('textStyle' in source) {
          result.textStyle = (source as any).textStyle;
        }
        // Copy layout for Cards elements (if a card contains nested Cards)
        if ('layout' in source) {
          result.layout = JSON.parse(JSON.stringify((source as any).layout));
        }

        // Recursively match children by index
        const sourceChildren = getChildren(source);
        const targetChildren = getChildren(target);
        if (sourceChildren.length > 0 && targetChildren.length > 0) {
          const newChildren = targetChildren.map((tChild, i) => {
            if (i < sourceChildren.length) {
              return applyAppearance(sourceChildren[i], tChild);
            }
            return tChild; // extra target children are left as-is
          });
          result.children = newChildren;
        }

        return result as VEElement;
      }

      const newSiblings = siblings.map(card => {
        if (card.id === sourceCard.id) return card; // skip the source itself
        return applyAppearance(sourceCard, card);
      });

      const newParent = { ...cardsParent, children: newSiblings } as VEElement;
      const newBody = replaceElement(state.page.body, cardsParent.id, newParent) as any;
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
      const currentSnapshot: UndoSnapshot = {
        page: state.page,
        globalStyles: state.globalStyles,
        fontTokens: state.fontTokens,
        typographyTokens: state.typographyTokens,
      };
      return {
        ...state,
        page: previous.page,
        globalStyles: previous.globalStyles,
        fontTokens: previous.fontTokens,
        typographyTokens: previous.typographyTokens,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, currentSnapshot],
        isDirty: true,
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      const currentSnapshot: UndoSnapshot = {
        page: state.page,
        globalStyles: state.globalStyles,
        fontTokens: state.fontTokens,
        typographyTokens: state.typographyTokens,
      };
      return {
        ...state,
        page: next.page,
        globalStyles: next.globalStyles,
        fontTokens: next.fontTokens,
        typographyTokens: next.typographyTokens,
        undoStack: [...state.undoStack, currentSnapshot],
        redoStack: state.redoStack.slice(0, -1),
        isDirty: true,
      };
    }

    case 'MARK_SAVED':
      return { ...state, isDirty: false };

    case 'TOGGLE_PRO_MODE': {
      const newPro = !state.proMode;
      try { localStorage.setItem('ve-pro-mode', String(newPro)); } catch {}
      return { ...state, proMode: newPro };
    }

    case 'SET_ACTIVE_STATE':
      return { ...state, activeState: action.state };

    case 'UPDATE_PSEUDO_STYLES': {
      const el = findElementById(state.page.body, action.id);
      if (!el) return state;

      const currentStyles = el.styles || { desktop: {} };
      const ps = currentStyles.pseudoStyles || {};
      const currentPseudo = ps[action.pseudoState] || { desktop: {} };
      const currentVP = currentPseudo[action.viewport] || {};

      const updatedPseudo = {
        ...currentPseudo,
        [action.viewport]: { ...currentVP, ...action.styles },
      };

      const newStyles = {
        ...currentStyles,
        pseudoStyles: { ...ps, [action.pseudoState]: updatedPseudo },
      };

      const newBody = replaceElement(state.page.body, action.id, { ...el, styles: newStyles }) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

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

    // ========== CLASS MANAGEMENT ==========

    case 'CREATE_CLASS': {
      if (state.globalStyles[action.name]) return state; // already exists
      const newStyle: NamedStyle = action.initialStyles || { desktop: {} };
      return {
        ...pushUndo(state),
        globalStyles: { ...state.globalStyles, [action.name]: newStyle },
        isDirty: true,
      };
    }

    case 'RENAME_CLASS': {
      const renOld = action.oldName;
      const renNew = action.newName;
      if (!state.globalStyles[renOld]) return state;
      if (state.globalStyles[renNew]) return state; // target exists
      const { [renOld]: classToRename, ...rest } = state.globalStyles;
      const updatedGS = { ...rest, [renNew]: classToRename };
      // Update all element references in current page
      function renameClassInTree(el: VEElement): VEElement {
        const cn = el.classNames;
        const newCn = cn?.map(c => c === renOld ? renNew : c);
        const changed = cn && newCn && cn.some((c, i) => c !== newCn[i]);
        const children = el.children?.map(renameClassInTree);
        const childrenChanged = el.children && children && el.children.some((c, i) => c !== children![i]);
        if (!changed && !childrenChanged) return el;
        return { ...el, ...(changed ? { classNames: newCn } : {}), ...(childrenChanged ? { children } : {}) } as VEElement;
      }
      // Update _extends references
      for (const [k, v] of Object.entries(updatedGS)) {
        if (v._extends === renOld) {
          updatedGS[k] = { ...v, _extends: renNew };
        }
      }
      const newBody = renameClassInTree(state.page.body) as any;
      // Also update all pages
      const newPages = state.pages.map(p => ({
        ...p,
        body: renameClassInTree(p.body) as any,
      }));
      return {
        ...pushUndo(state),
        globalStyles: updatedGS,
        page: { ...state.page, body: newBody },
        pages: newPages,
        editingClass: state.editingClass === renOld ? renNew : state.editingClass,
        isDirty: true,
      };
    }

    case 'DELETE_CLASS': {
      const delName = action.name;
      if (!state.globalStyles[delName]) return state;
      const { [delName]: _deleted, ...remainingGS } = state.globalStyles;
      // Remove from all element references
      function removeClassInTree(el: VEElement): VEElement {
        const cn = el.classNames;
        const newCn = cn?.filter(c => c !== delName);
        const changed = cn && newCn && cn.length !== newCn.length;
        const children = el.children?.map(removeClassInTree);
        const childrenChanged = el.children && children && el.children.some((c, i) => c !== children![i]);
        if (!changed && !childrenChanged) return el;
        return {
          ...el,
          ...(changed ? { classNames: newCn!.length > 0 ? newCn : undefined } : {}),
          ...(childrenChanged ? { children } : {}),
        } as VEElement;
      }
      // Clear _extends references
      for (const [k, v] of Object.entries(remainingGS)) {
        if (v._extends === delName) {
          remainingGS[k] = { ...v, _extends: undefined };
        }
      }
      const newBody = removeClassInTree(state.page.body) as any;
      const newPages = state.pages.map(p => ({
        ...p,
        body: removeClassInTree(p.body) as any,
      }));
      return {
        ...pushUndo(state),
        globalStyles: remainingGS,
        page: { ...state.page, body: newBody },
        pages: newPages,
        editingClass: state.editingClass === delName ? null : state.editingClass,
        isDirty: true,
      };
    }

    case 'UPDATE_CLASS_STYLES': {
      const cls = state.globalStyles[action.name];
      if (!cls) return state;
      const currentVP = cls[action.viewport] || {};
      const updated: NamedStyle = {
        ...cls,
        [action.viewport]: { ...currentVP, ...action.styles },
      };
      return {
        ...pushUndo(state),
        globalStyles: { ...state.globalStyles, [action.name]: updated },
        isDirty: true,
      };
    }

    case 'UPDATE_CLASS_PSEUDO_STYLES': {
      const cls = state.globalStyles[action.name];
      if (!cls) return state;
      const ps = cls.pseudoStyles || {};
      const currentPseudo = ps[action.pseudoState] || { desktop: {} };
      const currentVP = currentPseudo[action.viewport] || {};
      const updated: NamedStyle = {
        ...cls,
        pseudoStyles: {
          ...ps,
          [action.pseudoState]: {
            ...currentPseudo,
            [action.viewport]: { ...currentVP, ...action.styles },
          },
        },
      };
      return {
        ...pushUndo(state),
        globalStyles: { ...state.globalStyles, [action.name]: updated },
        isDirty: true,
      };
    }

    case 'SET_CLASS_EXTENDS': {
      const cls = state.globalStyles[action.name];
      if (!cls) return state;
      return {
        ...pushUndo(state),
        globalStyles: {
          ...state.globalStyles,
          [action.name]: { ...cls, _extends: action.extendsName },
        },
        isDirty: true,
      };
    }

    case 'ASSIGN_CLASS': {
      const el = findElementById(state.page.body, action.elementId);
      if (!el) return state;
      const current = el.classNames || [];
      if (current.includes(action.className)) return state;
      const updated = { ...el, classNames: [...current, action.className] } as VEElement;
      const newBody = replaceElement(state.page.body, action.elementId, updated) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

    case 'REMOVE_CLASS': {
      const el = findElementById(state.page.body, action.elementId);
      if (!el) return state;
      const current = el.classNames || [];
      const filtered = current.filter(c => c !== action.className);
      const updated = { ...el, classNames: filtered.length > 0 ? filtered : undefined } as VEElement;
      const newBody = replaceElement(state.page.body, action.elementId, updated) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

    case 'REORDER_CLASSES': {
      const el = findElementById(state.page.body, action.elementId);
      if (!el) return state;
      const updated = { ...el, classNames: action.classNames.length > 0 ? action.classNames : undefined } as VEElement;
      const newBody = replaceElement(state.page.body, action.elementId, updated) as any;
      return {
        ...pushUndo(state),
        page: { ...state.page, body: newBody },
        isDirty: true,
      };
    }

    case 'SET_EDITING_CLASS':
      return { ...state, editingClass: action.name };

    // ========== TYPOGRAPHY TOKEN MANAGEMENT ==========

    case 'SET_FONT_TOKEN': {
      return {
        ...pushUndo(state),
        fontTokens: { ...state.fontTokens, [action.key]: action.token },
        isDirty: true,
      };
    }

    case 'SET_STANDARD_FONT_TOKEN': {
      // Clear standard from all, set on the target
      const updatedFT: FontTokenMap = {};
      for (const [k, v] of Object.entries(state.fontTokens)) {
        updatedFT[k] = { ...v, standard: k === action.key };
      }
      return {
        ...pushUndo(state),
        fontTokens: updatedFT,
        isDirty: true,
      };
    }

    case 'DELETE_FONT_TOKEN': {
      const { [action.key]: _deleted, ...remainingFT } = state.fontTokens;
      // Replace all TypographyToken references to the deleted FontToken
      const updatedTT: TypographyTokenMap = {};
      for (const [k, v] of Object.entries(state.typographyTokens)) {
        updatedTT[k] = v.fontToken === action.key
          ? { ...v, fontToken: action.replaceWith }
          : v;
      }
      return {
        ...pushUndo(state),
        fontTokens: remainingFT,
        typographyTokens: updatedTT,
        isDirty: true,
      };
    }

    case 'SET_TYPOGRAPHY_TOKEN': {
      return {
        ...pushUndo(state),
        typographyTokens: { ...state.typographyTokens, [action.key]: action.token },
        isDirty: true,
      };
    }

    case 'SET_STANDARD_TYPOGRAPHY_TOKEN': {
      const updatedTT2: TypographyTokenMap = {};
      for (const [k, v] of Object.entries(state.typographyTokens)) {
        updatedTT2[k] = { ...v, standard: k === action.key };
      }
      return {
        ...pushUndo(state),
        typographyTokens: updatedTT2,
        isDirty: true,
      };
    }

    case 'DELETE_TYPOGRAPHY_TOKEN': {
      const { [action.key]: _deletedTT, ...remainingTT } = state.typographyTokens;
      // Replace all _typo references in globalStyles
      const updatedGS: GlobalStyles = {};
      for (const [k, v] of Object.entries(state.globalStyles)) {
        updatedGS[k] = v._typo === action.key
          ? { ...v, _typo: action.replaceWith }
          : v;
      }
      return {
        ...pushUndo(state),
        typographyTokens: remainingTT,
        globalStyles: updatedGS,
        isDirty: true,
      };
    }

    case 'RENAME_TYPOGRAPHY_TOKEN': {
      const { oldKey, newKey } = action;
      if (!state.typographyTokens[oldKey] || state.typographyTokens[newKey]) return state;
      const { [oldKey]: tokenToRename, ...restTT } = state.typographyTokens;
      const renamedTT = { ...restTT, [newKey]: tokenToRename };
      // Update all _typo references in globalStyles
      const renamedGS: GlobalStyles = {};
      for (const [k, v] of Object.entries(state.globalStyles)) {
        renamedGS[k] = v._typo === oldKey
          ? { ...v, _typo: newKey }
          : v;
      }
      return {
        ...pushUndo(state),
        typographyTokens: renamedTT,
        globalStyles: renamedGS,
        isDirty: true,
      };
    }

    case 'SET_CLASS_TYPO': {
      const cls = state.globalStyles[action.className];
      if (!cls) return state;
      return {
        ...pushUndo(state),
        globalStyles: {
          ...state.globalStyles,
          [action.className]: { ...cls, _typo: action.typoKey },
        },
        isDirty: true,
      };
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
  initialGlobalStyles?: GlobalStyles;
  initialFontTokens?: FontTokenMap;
  initialTypographyTokens?: TypographyTokenMap;
  children: React.ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  initialPage,
  initialPages,
  initialGlobalStyles,
  initialFontTokens,
  initialTypographyTokens,
  children,
}) => {
  const pages = initialPages || (initialPage ? [initialPage] : []);
  const [state, dispatch] = useReducer(
    editorReducer,
    createInitialState(pages, initialGlobalStyles || {}, initialFontTokens || {}, initialTypographyTokens || {}),
  );

  // Keep the module-level globalStyles reference in sync for resolveStyles()
  // MUST be synchronous (not in useEffect) so renderers see updated classes
  // within the same render cycle that dispatched the change.
  setGlobalStyles(state.globalStyles);
  setFontTokens(state.fontTokens);
  setTypographyTokens(state.typographyTokens);

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

      // Ctrl+S / Cmd+S → Speichern (handled by TopBar with VESaveContext)
      if (ctrlOrCmd && e.key === 's') {
        e.preventDefault();
        // Save is handled by TopBar which has access to VESaveContext
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
