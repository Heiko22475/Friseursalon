// =====================================================
// V2 EDITABLE TEXT
// Inline-Editing für Text-Elemente im v2-Format.
// Wird von V2ElementRenderer eingebunden wenn EditMode aktiv.
//
// Verwendet TipTap direkt inline: der Text wird an Ort
// und Stelle editierbar, mit einer kleinen Floating-Toolbar.
// =====================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Save, X, Loader2, Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import BoldExt from '@tiptap/extension-bold';
import ItalicExt from '@tiptap/extension-italic';
import UnderlineExt from '@tiptap/extension-underline';
import LinkExt from '@tiptap/extension-link';
import { useEditMode } from '../contexts/EditModeContext';
import { useWebsite } from '../contexts/WebsiteContext';

interface V2EditableTextProps {
  /** The v2 element ID */
  elementId: string;
  /** Current HTML content */
  html: string;
  /** Resolved CSS styles for the element */
  css: React.CSSProperties;
  /** Additional HTML attributes */
  htmlAttrs?: Record<string, any>;
  /** Page ID this element belongs to */
  pageId: string;
}

/**
 * Deep-find an element by id in a v2 element tree and update its html.
 * Returns a new tree (immutable) or null if not found.
 */
function updateElementHtml(root: any, targetId: string, newHtml: string): any {
  if (!root) return null;

  if (root.id === targetId) {
    return { ...root, html: newHtml };
  }

  if (root.children && root.children.length > 0) {
    const newChildren = root.children.map((child: any) => {
      const updated = updateElementHtml(child, targetId, newHtml);
      return updated || child;
    });

    const changed = newChildren.some((c: any, i: number) => c !== root.children[i]);
    if (changed) {
      return { ...root, children: newChildren };
    }
  }

  return null;
}

export const V2EditableText: React.FC<V2EditableTextProps> = ({
  elementId,
  html,
  css,
  htmlAttrs = {},
  pageId,
}) => {
  const { isEditMode, startEditing, stopEditing, isEditing } = useEditMode();
  const { websiteRecord, updatePage } = useWebsite();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editedHtmlRef = useRef(html);

  const editId = `v2:${elementId}`;
  const isCurrentlyEditing = isEditing(editId);

  // TipTap editor — only active when editing
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      BoldExt,
      ItalicExt,
      UnderlineExt,
      LinkExt.configure({ openOnClick: false }),
    ],
    content: html || '',
    editable: isCurrentlyEditing,
    onUpdate: ({ editor: ed }) => {
      editedHtmlRef.current = ed.getHTML();
    },
    editorProps: {
      attributes: {
        style: 'outline: none;',
      },
    },
  }, [isCurrentlyEditing]);  // recreate when editing state changes

  // Sync content when html prop changes while NOT editing
  useEffect(() => {
    if (!isCurrentlyEditing && editor) {
      editor.commands.setContent(html || '');
      editedHtmlRef.current = html;
    }
  }, [html, isCurrentlyEditing, editor]);

  // Focus editor when editing starts
  useEffect(() => {
    if (isCurrentlyEditing && editor) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        editor.commands.focus('end');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isCurrentlyEditing, editor]);

  // Position the floating toolbar above the element
  const updateToolbarPos = useCallback(() => {
    if (!isCurrentlyEditing || !wrapperRef.current) {
      setToolbarPos(null);
      return;
    }
    const rect = wrapperRef.current.getBoundingClientRect();
    setToolbarPos({
      top: rect.top,   // viewport-relative for position:fixed
      left: rect.left,
    });
  }, [isCurrentlyEditing]);

  useEffect(() => {
    updateToolbarPos();
    if (isCurrentlyEditing) {
      window.addEventListener('scroll', updateToolbarPos, true);
      window.addEventListener('resize', updateToolbarPos);
      return () => {
        window.removeEventListener('scroll', updateToolbarPos, true);
        window.removeEventListener('resize', updateToolbarPos);
      };
    }
  }, [isCurrentlyEditing, updateToolbarPos]);

  // ─── SAVE ────────────────────────────────────────────
  const handleSave = async () => {
    const newHtml = editedHtmlRef.current;
    if (newHtml === html) {
      stopEditing();
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (!websiteRecord) throw new Error('Website nicht geladen');
      const page = websiteRecord.content.pages.find((p) => p.id === pageId);
      if (!page || !page.body) throw new Error('Seite nicht gefunden');

      const updatedBody = updateElementHtml(page.body, elementId, newHtml);
      if (!updatedBody) throw new Error('Element nicht gefunden');

      await updatePage(pageId, { body: updatedBody });
      stopEditing();
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    editor?.commands.setContent(html || '');
    editedHtmlRef.current = html;
    setError(null);
    stopEditing();
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isCurrentlyEditing) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isCurrentlyEditing, html]);

  // ===== NOT IN EDIT MODE =====
  if (!isEditMode) {
    return (
      <div
        data-v2-id={elementId}
        style={css}
        dangerouslySetInnerHTML={{ __html: html }}
        {...htmlAttrs}
      />
    );
  }

  // ===== EDIT MODE ACTIVE (hover indicators + inline TipTap) =====

  const setLink = () => {
    const url = window.prompt('URL eingeben:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  // Floating toolbar (rendered as portal for z-index)
  const toolbar = isCurrentlyEditing && toolbarPos ? createPortal(
    <div
      className="fixed z-[9999] flex items-center gap-1 px-2 py-1.5 bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        top: `${toolbarPos.top - 48}px`,
        left: `${toolbarPos.left}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded transition ${editor?.isActive('bold') ? 'bg-rose-500 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Fett"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded transition ${editor?.isActive('italic') ? 'bg-rose-500 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Kursiv"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded transition ${editor?.isActive('underline') ? 'bg-rose-500 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Unterstrichen"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded transition ${editor?.isActive('link') ? 'bg-rose-500 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Link einfügen"
      >
        <LinkIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-1 px-2.5 py-1 bg-rose-500 text-white rounded text-xs font-medium hover:bg-rose-600 disabled:opacity-50 transition"
        title="Speichern (Ctrl+Enter)"
      >
        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
        Speichern
      </button>
      <button
        onClick={handleCancel}
        disabled={isSaving}
        className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 text-xs transition"
        title="Abbrechen (Esc)"
      >
        <X className="w-3 h-3" />
      </button>

      {error && (
        <span className="text-xs text-red-500 ml-1">⚠️ {error}</span>
      )}
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <div
        ref={wrapperRef}
        data-v2-id={elementId}
        className={`group relative ${isCurrentlyEditing ? '' : 'cursor-pointer'}`}
        style={{
          ...css,
          // Editing outline
          ...(isCurrentlyEditing ? {
            outline: '2px solid #e11d48',
            outlineOffset: '2px',
            borderRadius: '4px',
          } : {}),
        }}
        onClick={(e) => {
          if (!isCurrentlyEditing) {
            e.stopPropagation();
            startEditing(editId);
          }
        }}
        title={isCurrentlyEditing ? undefined : 'Klicken zum Bearbeiten'}
        {...htmlAttrs}
      >
        {/* When editing: show TipTap inline */}
        {isCurrentlyEditing && editor ? (
          <EditorContent editor={editor} />
        ) : (
          // When not editing: show HTML + hover indicators
          <>
            <span dangerouslySetInnerHTML={{ __html: html }} />

            {/* Edit indicator on hover */}
            <button
              onClick={(e) => { e.stopPropagation(); startEditing(editId); }}
              className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-rose-600 hover:scale-110 z-10"
              title="Text bearbeiten"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            {/* Hover outline */}
            <div className="absolute inset-0 border-2 border-dashed border-rose-500 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200" />
          </>
        )}
      </div>

      {toolbar}
    </>
  );
};
