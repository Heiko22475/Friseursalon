// =====================================================
// VISUAL EDITOR – TEXT RENDERER
// Rendert ein VEText-Element im Canvas
// Doppelklick → Inline TipTap Editor
// =====================================================

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor as useTipTapEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import type { VEText, TextStylePreset } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { useEditor } from '../state/EditorContext';

interface TextRendererProps {
  element: VEText;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

/** Default-Styles pro TextStylePreset */
const presetDefaults: Record<TextStylePreset, React.CSSProperties> = {
  h1: { fontSize: '48px', fontWeight: 700, lineHeight: 1.2, margin: 0 },
  h2: { fontSize: '36px', fontWeight: 700, lineHeight: 1.3, margin: 0 },
  h3: { fontSize: '28px', fontWeight: 600, lineHeight: 1.3, margin: 0 },
  h4: { fontSize: '24px', fontWeight: 600, lineHeight: 1.4, margin: 0 },
  h5: { fontSize: '20px', fontWeight: 600, lineHeight: 1.4, margin: 0 },
  h6: { fontSize: '18px', fontWeight: 600, lineHeight: 1.4, margin: 0 },
  body: { fontSize: '16px', fontWeight: 400, lineHeight: 1.6, margin: 0 },
  'body-sm': { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, margin: 0 },
  caption: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4, margin: 0 },
  price: { fontSize: '24px', fontWeight: 700, lineHeight: 1.2, margin: 0 },
  label: { fontSize: '14px', fontWeight: 600, lineHeight: 1.4, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: 0 },
};

/** HTML-Tag pro Preset */
const presetTag: Record<TextStylePreset, string> = {
  h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
  body: 'p', 'body-sm': 'p', caption: 'span', price: 'span', label: 'span',
};

// ===== INLINE EDITOR (shown on double-click) =====

const InlineTextEditor: React.FC<{
  element: VEText;
  combinedStyles: React.CSSProperties;
  onDone: (html: string) => void;
}> = ({ element, combinedStyles, onDone }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [initialContent] = useState(element.content);

  const editor = useTipTapEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', class: null },
      }),
    ],
    content: initialContent,
    autofocus: 'end',
    editorProps: {
      attributes: {
        style: Object.entries({
          ...combinedStyles,
          outline: 'none',
          cursor: 'text',
          // Reset margin/padding to avoid double spacing
          margin: '0',
          padding: '0',
        })
          .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
          .join('; '),
      },
    },
  });

  // Handle Escape to finish editing
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (editor) {
          onDone(editor.getHTML());
        }
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [editor, onDone]);

  // Handle click outside to finish editing
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        if (editor) {
          onDone(editor.getHTML());
        }
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [editor, onDone]);

  if (!editor) return null;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        outline: '2px solid #3b82f6',
        outlineOffset: '2px',
        borderRadius: '2px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Mini toolbar */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          left: '0',
          display: 'flex',
          gap: '1px',
          padding: '2px 3px',
          backgroundColor: '#1e1e2e',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 200,
        }}
      >
        {[
          { key: 'bold', label: 'B', style: { fontWeight: 700 } },
          { key: 'italic', label: 'I', style: { fontStyle: 'italic' } },
          { key: 'underline', label: 'U', style: { textDecoration: 'underline' } },
        ].map(({ key, label, style }) => (
          <button
            key={key}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              if (key === 'bold') editor.chain().focus().toggleBold().run();
              if (key === 'italic') editor.chain().focus().toggleItalic().run();
              if (key === 'underline') editor.chain().focus().toggleUnderline().run();
            }}
            style={{
              width: '24px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: editor.isActive(key) ? '#3b82f6' : 'transparent',
              border: 'none',
              borderRadius: '3px',
              color: editor.isActive(key) ? '#fff' : '#9ca3af',
              fontSize: '12px',
              cursor: 'pointer',
              ...style,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const TextRenderer: React.FC<TextRendererProps> = ({ element, viewport, isSelected, isHovered, onSelect, onHover }) => {
  const { dispatch } = useEditor();
  const [isEditing, setIsEditing] = useState(false);
  // Track whether we just became selected via this click (to distinguish
  // "first click to select" from "click on already-selected to edit").
  const justSelectedRef = useRef(false);

  const resolvedStyles = resolveStyles(element.styles, viewport);
  const preset = element.textStyle || 'body';
  const defaults = presetDefaults[preset];
  const tag = presetTag[preset];

  const combinedStyles: React.CSSProperties = {
    ...defaults,
    ...resolvedStyles,
    // Ensure small text elements have a reasonable click target
    minHeight: '1em',
    cursor: isSelected ? 'text' : 'default',
  };

  // Split styles into layout (for wrapper) and typography (for editor content).
  // Layout properties must stay on the outer wrapper so the element doesn't
  // jump position when entering edit mode.
  const layoutKeys = new Set([
    'position', 'top', 'right', 'bottom', 'left',
    'zIndex', 'display', 'flexGrow', 'flexShrink', 'alignSelf',
    'gridColumn', 'gridRow',
    'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'transform', 'opacity', 'overflow',
  ]);

  const wrapperStyles: React.CSSProperties = {};
  const typographyStyles: React.CSSProperties = {};

  for (const [key, value] of Object.entries(combinedStyles)) {
    if (layoutKeys.has(key)) {
      (wrapperStyles as any)[key] = value;
    } else {
      (typographyStyles as any)[key] = value;
    }
  }

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelected) {
      // Already selected → enter edit mode on second click
      // (but not if we *just* became selected from this same click)
      if (!justSelectedRef.current) {
        setIsEditing(true);
      }
    } else {
      // First click → select
      justSelectedRef.current = true;
      onSelect(element.id);
      // Reset the flag after this event cycle
      requestAnimationFrame(() => { justSelectedRef.current = false; });
    }
  }, [element.id, isSelected, onSelect]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Always enter edit mode on double-click regardless of selection state
    onSelect(element.id);
    setIsEditing(true);
  }, [element.id, onSelect]);

  const handleEditDone = useCallback((html: string) => {
    setIsEditing(false);
    if (html !== element.content) {
      dispatch({
        type: 'UPDATE_CONTENT',
        id: element.id,
        updates: { content: html },
      });
    }
  }, [dispatch, element.id, element.content]);

  // When we become deselected externally, exit editing
  useEffect(() => {
    if (!isSelected && isEditing) {
      setIsEditing(false);
    }
  }, [isSelected, isEditing]);

  // Inline editing mode
  if (isEditing) {
    return (
      <div
        data-ve-id={element.id}
        data-ve-type={element.type}
        className={isSelected ? 've-selected' : ''}
        style={wrapperStyles}
      >
        <InlineTextEditor
          element={element}
          combinedStyles={typographyStyles}
          onDone={handleEditDone}
        />
      </div>
    );
  }

  // Normal display mode
  return React.createElement(tag, {
    'data-ve-id': element.id,
    'data-ve-type': element.type,
    style: combinedStyles,
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
    onMouseEnter: (e: React.MouseEvent) => { e.stopPropagation(); onHover?.(element.id); },
    className: `${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`,
    dangerouslySetInnerHTML: { __html: element.content },
  });
};
