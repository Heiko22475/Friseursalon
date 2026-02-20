// =====================================================
// VISUAL EDITOR – RICH TEXT EDITOR
// TipTap-basierter Inline-Editor für Text-Inhalte
//
// Features:
//   • Bold, Italic, Unterstrichen
//   • Links einfügen / bearbeiten / entfernen
//   • Echtzeit-Ausgabe als HTML-String
//   • Dark-Theme passend zum Visual Editor
// =====================================================

import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';

// ===== TYPES =====

interface VERichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// ===== TOOLBAR BUTTON =====

const ToolbarButton: React.FC<{
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
}> = ({ icon, active, disabled, title, onClick }) => (
  <button
    type="button"
    onClick={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    style={{
      width: '26px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: active ? '#3b82f6' : 'transparent',
      border: 'none',
      borderRadius: '3px',
      cursor: disabled ? 'default' : 'pointer',
      color: active ? '#fff' : disabled ? 'var(--admin-text-secondary)' : 'var(--admin-text-icon)',
      transition: 'all 0.1s',
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={(e) => {
      if (!active && !disabled) e.currentTarget.style.backgroundColor = 'var(--admin-border)';
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.backgroundColor = 'transparent';
    }}
  >
    {icon}
  </button>
);

// ===== LINK DIALOG =====

const LinkDialog: React.FC<{
  initialUrl: string;
  onSubmit: (url: string) => void;
  onCancel: () => void;
}> = ({ initialUrl, onSubmit, onCancel }) => {
  const [url, setUrl] = useState(initialUrl);

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      zIndex: 200,
      marginTop: '4px',
      backgroundColor: 'var(--admin-bg-card)',
      border: '1px solid var(--admin-border-strong)',
      borderRadius: '6px',
      padding: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontSize: '10px', color: 'var(--admin-text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Link URL
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        <input
          autoFocus
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); onSubmit(url); }
            if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
          }}
          placeholder="https:// oder /seite"
          style={{
            flex: 1,
            padding: '5px 8px',
            backgroundColor: 'var(--admin-bg-input)',
            border: '1px solid var(--admin-border-strong)',
            borderRadius: '4px',
            color: 'var(--admin-text)',
            fontSize: '12px',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => onSubmit(url)}
          style={{
            padding: '5px 10px',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '11px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          OK
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '5px 8px',
            backgroundColor: 'var(--admin-bg-input)',
            border: '1px solid var(--admin-border-strong)',
            borderRadius: '4px',
            color: 'var(--admin-text-icon)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const VERichTextEditor: React.FC<VERichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable features we don't need to keep it lightweight
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
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: null,
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        style: [
          'min-height: 60px',
          'max-height: 200px',
          'overflow-y: auto',
          'padding: 8px',
          'color: #d1d5db',
          'font-size: 13px',
          'line-height: 1.5',
          'outline: none',
          'font-family: inherit',
        ].join('; '),
      },
    },
  });

  const handleLinkSubmit = useCallback((url: string) => {
    if (!editor) return;
    setShowLinkDialog(false);

    if (!url || url.trim() === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    // Normalize URL
    let href = url.trim();
    if (!href.startsWith('/') && !href.startsWith('#') && !href.startsWith('http')) {
      href = 'https://' + href;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href })
      .run();
  }, [editor]);

  if (!editor) return null;

  const currentLinkUrl = editor.getAttributes('link').href || '';

  return (
    <div style={{ position: 'relative' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1px',
        padding: '3px 4px',
        backgroundColor: 'var(--admin-bg-surface)',
        borderRadius: '4px 4px 0 0',
        border: '1px solid var(--admin-border-strong)',
        borderBottom: 'none',
      }}>
        <ToolbarButton
          icon={<Bold size={13} />}
          active={editor.isActive('bold')}
          title="Fett (Ctrl+B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={<Italic size={13} />}
          active={editor.isActive('italic')}
          title="Kursiv (Ctrl+I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={<UnderlineIcon size={13} />}
          active={editor.isActive('underline')}
          title="Unterstrichen (Ctrl+U)"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />

        {/* Separator */}
        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--admin-border-strong)', margin: '0 4px' }} />

        <ToolbarButton
          icon={<LinkIcon size={13} />}
          active={editor.isActive('link')}
          title="Link einfügen"
          onClick={() => setShowLinkDialog(!showLinkDialog)}
        />
        {editor.isActive('link') && (
          <ToolbarButton
            icon={<Unlink size={13} />}
            title="Link entfernen"
            onClick={() => editor.chain().focus().unsetLink().run()}
          />
        )}
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <LinkDialog
          initialUrl={currentLinkUrl}
          onSubmit={handleLinkSubmit}
          onCancel={() => setShowLinkDialog(false)}
        />
      )}

      {/* Editor Area */}
      <div style={{
        backgroundColor: 'var(--admin-bg-input)',
        border: '1px solid var(--admin-border-strong)',
        borderRadius: '0 0 4px 4px',
      }}>
        <EditorContent editor={editor} />
      </div>

      {/* Hint */}
      {placeholder && !value && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          fontSize: '12px',
          color: 'var(--admin-text-secondary)',
          pointerEvents: 'none',
        }}>
          {placeholder}
        </div>
      )}
    </div>
  );
};
