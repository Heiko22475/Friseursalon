// =====================================================
// V2 EDIT CONTEXT
// Selection, Undo/Redo und Panel-State für das
// Frontend Style-Editing (rechter Drawer).
// =====================================================

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

// ===== TYPES =====

/** Eine einzelne Style-Änderung (für Undo/Redo) */
export interface EditCommand {
  id: string;
  label: string;
  /** 'class' = betrifft alle Elemente mit dieser Klasse, 'inline' = nur dieses Element */
  scope: 'class' | 'inline';
  /** Snapshot VOR der Änderung (zum Rückgängigmachen) */
  prevState: any;
  /** Snapshot NACH der Änderung */
  nextState: any;
  /** Pfad im Content: z.B. 'styles.heading-lg' oder 'pages[0].body.…' */
  path: string;
}

/** Selektiertes Element im Frontend */
export interface SelectedV2Element {
  /** Element-ID im v2 body tree */
  id: string;
  /** Element tag (text, container, section, etc.) */
  tag: string;
  /** Klassen des Elements */
  classes: string[];
  /** Inline-Styles Objekt (v2 format) */
  inlineStyles: Record<string, any> | undefined;
  /** Label / Display-Text */
  label?: string;
  /** DOM-Rect für Toolbar-Positionierung */
  rect?: DOMRect;
}

/** Editing-Scope: Klasse (alle ähnliche) oder nur dieses Element */
export type EditScope = 'class' | 'inline';

// ===== CONTEXT VALUE =====

interface V2EditContextValue {
  // Selection
  selectedElement: SelectedV2Element | null;
  selectElement: (el: SelectedV2Element | null) => void;

  // Panel
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;

  // Scope (class vs inline)
  editScope: EditScope;
  setEditScope: (scope: EditScope) => void;

  // Viewport for style editing
  editViewport: 'desktop' | 'tablet' | 'mobile';
  setEditViewport: (vp: 'desktop' | 'tablet' | 'mobile') => void;

  // Undo/Redo
  pushCommand: (cmd: EditCommand) => void;
  undo: () => EditCommand | null;
  redo: () => EditCommand | null;
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null;
  redoLabel: string | null;
}

const V2EditContext = createContext<V2EditContextValue | undefined>(undefined);

// ===== PROVIDER =====

const MAX_UNDO_STACK = 50;

export const V2EditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedElement, setSelectedElement] = useState<SelectedV2Element | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editScope, setEditScope] = useState<EditScope>('class');
  const [editViewport, setEditViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Undo/Redo stacks
  const undoStackRef = useRef<EditCommand[]>([]);
  const redoStackRef = useRef<EditCommand[]>([]);
  const [, setUndoVersion] = useState(0); // trigger re-render

  const selectElement = useCallback((el: SelectedV2Element | null) => {
    setSelectedElement(el);
    // If element has no classes, default to inline mode
    if (el && (!el.classes || el.classes.length === 0)) {
      setEditScope('inline');
    } else if (el) {
      setEditScope('class');
    }
  }, []);

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    // Don't deselect element — allows reopening
  }, []);

  const pushCommand = useCallback((cmd: EditCommand) => {
    undoStackRef.current = [...undoStackRef.current.slice(-MAX_UNDO_STACK + 1), cmd];
    redoStackRef.current = []; // clear redo on new action
    setUndoVersion(v => v + 1);
  }, []);

  const undo = useCallback((): EditCommand | null => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return null;
    const cmd = stack[stack.length - 1];
    undoStackRef.current = stack.slice(0, -1);
    redoStackRef.current = [...redoStackRef.current, cmd];
    setUndoVersion(v => v + 1);
    return cmd;
  }, []);

  const redo = useCallback((): EditCommand | null => {
    const stack = redoStackRef.current;
    if (stack.length === 0) return null;
    const cmd = stack[stack.length - 1];
    redoStackRef.current = stack.slice(0, -1);
    undoStackRef.current = [...undoStackRef.current, cmd];
    setUndoVersion(v => v + 1);
    return cmd;
  }, []);

  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;
  const undoLabel = canUndo ? undoStackRef.current[undoStackRef.current.length - 1].label : null;
  const redoLabel = canRedo ? redoStackRef.current[redoStackRef.current.length - 1].label : null;

  const value: V2EditContextValue = {
    selectedElement,
    selectElement,
    isPanelOpen,
    openPanel,
    closePanel,
    editScope,
    setEditScope,
    editViewport,
    setEditViewport,
    pushCommand,
    undo,
    redo,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
  };

  return (
    <V2EditContext.Provider value={value}>
      {children}
    </V2EditContext.Provider>
  );
};

// ===== HOOK =====

export function useV2Edit(): V2EditContextValue {
  const ctx = useContext(V2EditContext);
  if (!ctx) {
    throw new Error('useV2Edit must be used within V2EditProvider');
  }
  return ctx;
}
