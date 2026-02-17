// =====================================================
// V2 SELECTION OVERLAY
// Handles click-to-select via event delegation on
// data-v2-id attributes. Adds hover + selection outlines
// via a dynamic <style> tag.
// No changes needed in V2ElementRenderer.
// =====================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import { useV2Edit, type SelectedV2Element } from './V2EditContext';

/** The edit-id prefix V2EditableText uses with EditModeContext */
const TEXT_EDIT_PREFIX = 'v2:';

interface V2SelectionOverlayProps {
  /** The wrapper element that contains all v2 rendered content */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** The page body element tree (for looking up element metadata) */
  pageBody: any;
}

/**
 * Walk up the DOM tree from the clicked element to find the
 * nearest element with a data-v2-id attribute.
 */
function findV2Element(target: HTMLElement, container: HTMLElement): HTMLElement | null {
  let el: HTMLElement | null = target;
  while (el && el !== container) {
    if (el.dataset.v2Id) return el;
    el = el.parentElement;
  }
  return null;
}

/**
 * Find element metadata in the v2 body tree by ID.
 */
function findElementData(root: any, id: string): { tag: string; classes: string[]; styles: any; label?: string } | null {
  if (!root) return null;
  if (root.id === id) {
    return {
      tag: root.tag || 'unknown',
      classes: root.class || [],
      styles: root.styles,
      label: root.label || root.text || root.html?.replace(/<[^>]+>/g, '').slice(0, 30),
    };
  }
  if (root.children) {
    for (const child of root.children) {
      const found = findElementData(child, id);
      if (found) return found;
    }
  }
  return null;
}

export const V2SelectionOverlay: React.FC<V2SelectionOverlayProps> = ({
  containerRef,
  pageBody,
}) => {
  const { isEditMode, isEditing } = useEditMode();
  const { selectedElement, selectElement } = useV2Edit();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── CLICK HANDLER (event delegation) ──────────────────

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isEditMode || !containerRef.current || !pageBody) return;

    const target = e.target as HTMLElement;
    const v2El = findV2Element(target, containerRef.current);

    if (!v2El) {
      // Clicked outside any v2 element → deselect
      selectElement(null);
      return;
    }

    const v2Id = v2El.dataset.v2Id!;
    const elData = findElementData(pageBody, v2Id);
    if (!elData) return;

    // Don't select body
    if (elData.tag === 'body') return;

    // If a TipTap editor is currently active inside this element, let clicks through
    if (isEditing(`${TEXT_EDIT_PREFIX}${v2Id}`)) {
      return;
    }

    // If clicking on an already-selected text element, let the click
    // reach V2EditableText so it can start TipTap editing
    if (selectedElement?.id === v2Id && elData.tag === 'text') {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    const rect = v2El.getBoundingClientRect();
    const sel: SelectedV2Element = {
      id: v2Id,
      tag: elData.tag,
      classes: elData.classes,
      inlineStyles: elData.styles,
      label: elData.label,
      rect,
    };
    selectElement(sel);
  }, [isEditMode, isEditing, containerRef, pageBody, selectElement, selectedElement]);

  // ─── HOVER HANDLER ─────────────────────────────────────

  const handleMouseOver = useCallback((e: MouseEvent) => {
    if (!isEditMode || !containerRef.current || !pageBody) return;

    const target = e.target as HTMLElement;
    const v2El = findV2Element(target, containerRef.current);

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    if (!v2El || v2El.dataset.v2Id === pageBody.id) {
      hoverTimeoutRef.current = setTimeout(() => setHoveredId(null), 100);
      return;
    }

    setHoveredId(v2El.dataset.v2Id!);
  }, [isEditMode, containerRef, pageBody]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredId(null);
  }, []);

  // ─── ATTACH LISTENERS ──────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isEditMode) return;

    container.addEventListener('click', handleClick, true); // capture phase
    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('click', handleClick, true);
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isEditMode, handleClick, handleMouseOver, handleMouseLeave, containerRef]);

  // ─── DYNAMIC STYLES ───────────────────────────────────

  if (!isEditMode) return null;

  // Build CSS for hover + selection outlines
  const cssRules: string[] = [];

  // Hover outline (only if not the selected element)
  if (hoveredId && hoveredId !== selectedElement?.id) {
    cssRules.push(`
      [data-v2-id="${hoveredId}"] {
        outline: 2px dashed rgba(244,63,94,0.5) !important;
        outline-offset: 2px;
        cursor: pointer;
      }
    `);
  }

  // Selection outline
  if (selectedElement) {
    cssRules.push(`
      [data-v2-id="${selectedElement.id}"] {
        outline: 2px solid #e11d48 !important;
        outline-offset: 2px;
      }
    `);
  }

  // General edit mode cursor
  cssRules.push(`
    .v2-edit-mode [data-v2-id] {
      cursor: pointer;
    }
  `);

  if (cssRules.length === 0) return null;

  return (
    <style dangerouslySetInnerHTML={{ __html: cssRules.join('\n') }} />
  );
};
