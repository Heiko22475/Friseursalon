// =====================================================
// VISUAL EDITOR – WEBSITE BLOCK RENDERER
// Rendert die echten Block-Komponenten (Hero, GenericCard, etc.)
// direkt im VE-Canvas.
//
// ZWEI MODI:
//   1. Unselektiert → Overlay darüber, Klick selektiert Block
//   2. Selektiert → Inhalt interaktiv, Texte inline editierbar
//
// Text-Editing: Klick auf Text → contentEditable Overlay.
// Blur / Enter → dispatch UPDATE_CONTENT.
// =====================================================

import React, { useCallback, useRef, useState, useEffect } from 'react';
import type { VEWebsiteBlock } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { useEditor } from '../state/EditorContext';

// Actual block components
import { Hero } from '../../components/blocks/Hero';
import { GenericCard } from '../../components/blocks/GenericCard';

// ===== INLINE TEXT EDITOR =====

interface InlineEditState {
  fieldPath: string;
  rect: DOMRect;
  value: string;
  style: React.CSSProperties;
}

const InlineTextEditor: React.FC<{
  editState: InlineEditState;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  onSave: (path: string, newValue: string) => void;
  onCancel: () => void;
}> = ({ editState, wrapperRef, onSave, onCancel }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      // Select all text
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, []);

  const handleBlur = () => {
    const newValue = editorRef.current?.innerText || '';
    if (newValue !== editState.value) {
      onSave(editState.fieldPath, newValue);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(editState.fieldPath, editorRef.current?.innerText || '');
    }
  };

  // Position relative to wrapper
  const wr = wrapperRef.current?.getBoundingClientRect();
  const top = editState.rect.top - (wr?.top || 0);
  const left = editState.rect.left - (wr?.left || 0);

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        width: `${editState.rect.width}px`,
        minHeight: `${editState.rect.height}px`,
        minWidth: '60px',
        zIndex: 20,
        ...editState.style,
        outline: '2px solid #3b82f6',
        outlineOffset: '2px',
        borderRadius: '2px',
        padding: '2px 4px',
        margin: '-2px -4px',
        cursor: 'text',
        boxShadow: '0 0 0 4px rgba(59,130,246,0.15)',
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxDecorationBreak: 'clone' as any,
      }}
    >
      {editState.value}
    </div>
  );
};

// ===== BLOCK LABEL MAP =====

const BLOCK_LABELS: Record<string, string> = {
  hero: 'Hero',
  'generic-card': 'Karten',
  static_content: 'Statisch',
  'static-content': 'Statisch',
  gallery: 'Galerie',
  services: 'Services',
  reviews: 'Bewertungen',
  contact: 'Kontakt',
};

// ===== MAIN COMPONENT =====

interface WebsiteBlockRendererProps {
  element: VEWebsiteBlock;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const WebsiteBlockRenderer: React.FC<WebsiteBlockRendererProps> = ({
  element,
  viewport: _viewport,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  const { dispatch } = useEditor();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [editState, setEditState] = useState<InlineEditState | null>(null);

  // ── Click handling ──
  const handleWrapperClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isSelected) {
      // First click → select the block
      onSelect(element.id);
      return;
    }

    // Already selected → check if user clicked on editable text
    const target = e.target as HTMLElement;
    const textEl = findEditableText(target);

    if (textEl) {
      e.preventDefault();
      const rect = textEl.getBoundingClientRect();
      const cs = window.getComputedStyle(textEl);
      const fieldPath = resolveFieldPath(textEl, element);

      if (fieldPath) {
        setEditState({
          fieldPath,
          rect,
          value: textEl.innerText,
          style: {
            fontFamily: cs.fontFamily,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight as any,
            color: cs.color,
            textAlign: cs.textAlign as any,
            lineHeight: cs.lineHeight,
            letterSpacing: cs.letterSpacing,
          },
        });
      }
    }
  }, [isSelected, element, onSelect]);

  // ── Save inline edit → dispatch ──
  const handleInlineSave = useCallback((fieldPath: string, newValue: string) => {
    const newConfig = JSON.parse(JSON.stringify(element.blockConfig));
    setNestedValue(newConfig, fieldPath, newValue);

    dispatch({
      type: 'UPDATE_CONTENT',
      id: element.id,
      updates: { blockConfig: newConfig },
    });

    setEditState(null);
  }, [dispatch, element.id, element.blockConfig]);

  const handleInlineCancel = useCallback(() => {
    setEditState(null);
  }, []);

  // Close editor on deselect
  useEffect(() => {
    if (!isSelected && editState) setEditState(null);
  }, [isSelected, editState]);

  // ── Render block content ──
  const renderBlockContent = () => {
    switch (element.blockType) {
      case 'hero':
        return <Hero config={element.blockConfig} instanceId={element.blockPosition} />;
      case 'generic-card':
        return <GenericCard config={element.blockConfig} instanceId={element.blockPosition} />;
      case 'static_content':
      case 'static-content':
        return (
          <div style={{ padding: '48px 24px', backgroundColor: '#f9fafb', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
            Statischer Inhalt: {element.blockConfig?.type || 'Unbekannt'}
          </div>
        );
      default:
        return (
          <div style={{ padding: '48px 24px', backgroundColor: '#fef2f2', textAlign: 'center', color: '#dc2626', fontSize: '14px', border: '2px dashed #fca5a5', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
            Block-Typ „{element.blockType}" wird noch nicht unterstützt
          </div>
        );
    }
  };

  const blockLabel = BLOCK_LABELS[element.blockType] || element.blockType;

  return (
    <div
      ref={wrapperRef}
      data-ve-id={element.id}
      data-ve-type={blockLabel}
      data-ve-block-type={element.blockType}
      onClick={handleWrapperClick}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      onMouseLeave={(e) => { e.stopPropagation(); onHover?.(null); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={{
        position: 'relative',
        width: '100%',
        cursor: isSelected ? 'default' : 'pointer',
      }}
    >
      {/* Block content – pointer events enabled when selected */}
      <div
        style={{ pointerEvents: isSelected ? 'auto' : 'none' }}
        onClick={(e) => {
          if (!isSelected) return;
          // Prevent links/buttons from navigating
          const t = e.target as HTMLElement;
          if (t.closest('a')) e.preventDefault();
          if (t.closest('button')) e.preventDefault();
        }}
      >
        {renderBlockContent()}
      </div>

      {/* Overlay: only when NOT selected */}
      {!isSelected && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            cursor: 'pointer',
            zIndex: 1,
            backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
            transition: 'background-color 0.15s',
          }}
        />
      )}

      {/* Block badge */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          backgroundColor: '#0ea5e9', color: '#fff',
          fontSize: '11px', fontWeight: 600,
          padding: '2px 8px', borderRadius: '0 0 0 6px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          zIndex: 10, pointerEvents: 'none',
        }}>
          {blockLabel}
        </div>
      )}

      {/* Edit hint */}
      {isSelected && !editState && (
        <div style={{
          position: 'absolute', bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff',
          fontSize: '11px', padding: '3px 10px',
          borderRadius: '4px 4px 0 0',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          zIndex: 10, pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          Klicke auf Text zum Bearbeiten
        </div>
      )}

      {/* Inline text editor */}
      {editState && (
        <InlineTextEditor
          editState={editState}
          wrapperRef={wrapperRef}
          onSave={handleInlineSave}
          onCancel={handleInlineCancel}
        />
      )}
    </div>
  );
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/** Walk up the DOM to find a text-bearing element */
function findEditableText(target: HTMLElement): HTMLElement | null {
  let el: HTMLElement | null = target;
  for (let i = 0; i < 6 && el; i++) {
    if (isTextElement(el)) return el;
    el = el.parentElement;
  }
  return null;
}

function isTextElement(el: HTMLElement | null): boolean {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'li'].includes(tag)) return true;
  // Div with direct text (no complex block children)
  if (tag === 'div') {
    const hasText = Array.from(el.childNodes).some(
      n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()
    );
    const noBlocks = !el.querySelector('div, section, article, ul, ol, table, header, footer');
    if (hasText && noBlocks) return true;
  }
  return false;
}

/** Match clicked text to a config field path */
function resolveFieldPath(textEl: HTMLElement, element: VEWebsiteBlock): string | null {
  const text = textEl.innerText.trim();
  if (!text) return null;
  const config = element.blockConfig;

  if (element.blockType === 'hero') {
    for (let i = 0; i < (config?.texts || []).length; i++) {
      const clean = stripHtml(config.texts[i].content || '').trim();
      if (fuzzyMatch(clean, text)) return `texts.${i}.content`;
    }
    for (let i = 0; i < (config?.buttons || []).length; i++) {
      if ((config.buttons[i].text || '').trim() === text) return `buttons.${i}.text`;
    }
  }

  if (element.blockType === 'generic-card') {
    const ss = config?.sectionStyle || {};
    if (stripHtml(ss.title || '').trim() === text) return 'sectionStyle.title';
    if (stripHtml(ss.subtitle || '').trim() === text) return 'sectionStyle.subtitle';

    for (let i = 0; i < (config?.cards || []).length; i++) {
      const c = config.cards[i];
      if ((c.title || '').trim() === text) return `cards.${i}.title`;
      if ((c.subtitle || '').trim() === text) return `cards.${i}.subtitle`;
      if ((c.overline || '').trim() === text) return `cards.${i}.overline`;
      if (stripHtml(c.description || '').trim() === text) return `cards.${i}.description`;
      if ((c.price || '').trim() === text) return `cards.${i}.price`;
      if ((c.buttonText || '').trim() === text) return `cards.${i}.buttonText`;
    }
  }

  return null;
}

function fuzzyMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  // Normalize whitespace
  const na = a.replace(/\s+/g, ' ');
  const nb = b.replace(/\s+/g, ' ');
  return na === nb || na.includes(nb) || nb.includes(na);
}

function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    const idx = Number(k);
    cur = !isNaN(idx) ? cur[idx] : (cur[k] ??= {});
  }
  const last = parts[parts.length - 1];
  const li = Number(last);
  if (!isNaN(li)) cur[li] = value;
  else cur[last] = value;
}

function stripHtml(html: string): string {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || d.innerText || '';
}
