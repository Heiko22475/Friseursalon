import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Eye, Highlighter, Eraser } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Modal } from './Modal';
import StaticContent from '../StaticContent';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { useBlockBackgroundColor } from '../../hooks/useBlockBackgroundColor';

import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { useActiveTheme } from '../../hooks/useActiveTheme';
import { generateTextContrasts } from '../../utils/text-contrast-generator';

export const StaticContentEditor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const instanceId = parseInt(searchParams.get('instance') || '1');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load Active Theme Colors
  const { getBrandColor, getAccentColor } = useActiveTheme();

  const { backgroundColor, setBackgroundColor } = useBlockBackgroundColor({ blockType: 'static-content', instanceId });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-rose-500 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor min-h-[400px] focus:outline-none px-4 py-3 prose prose-slate max-w-none',
      },
    },
  });

  // Load content
  useEffect(() => {
    loadContent();
  }, [instanceId]);

  // Helper: Apply Smart Marker (Background + Contrast Text)
  const applySmartMarker = (bgColor: string) => {
    if (!editor) return;
    
    // Calculate optimal text color
    const contrasts = generateTextContrasts(bgColor);
    const textColor = contrasts.high; // Use highest contrast (AAA)

    // Apply Background and Text Color
    editor.chain().focus()
      .setHighlight({ color: bgColor })
      .setColor(textColor)
      .run();
  };

  // Helper: Reset Styles (Clear Marker & Color)
  const clearFormatting = () => {
    editor?.chain().focus().unsetHighlight().unsetColor().run();
  };

  useEffect(() => {
    if (editor && !loading) {
      loadContent();
    }
  }, [editor, loading]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('static_content')
        .select('*')
        .eq('instance_id', instanceId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setTitle(data.title);
        editor?.commands.setContent(data.content || '');
      }
    } catch (error) {
      console.error('Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const content = editor?.getHTML() || '';
      
      const { data: existing } = await supabase
        .from('static_content')
        .select('id')
        .eq('instance_id', instanceId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('static_content')
          .update({ title, content, updated_at: new Date().toISOString() })
          .eq('instance_id', instanceId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('static_content')
          .insert([{ instance_id: instanceId, title, content }]);

        if (error) throw error;
      }

      setMessage('Erfolgreich gespeichert!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving:', error);
      setMessage(error.message || 'Fehler beim Speichern!');
    }
  };

  const setLink = () => {
    const url = window.prompt('URL eingeben:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--admin-accent)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--admin-bg-surface)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 transition" style={{ color: 'var(--admin-text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </button>
          <div className="flex items-center gap-2">
            <BackgroundColorPicker
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              <Eye className="w-5 h-5" />
              Vorschau
            </button>
          </div>
        </div>

        <div className="rounded-xl p-8" style={{ backgroundColor: 'var(--admin-bg-card)', boxShadow: 'var(--admin-shadow)' }}>
          <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--admin-text-heading)' }}>
            Statischer Inhalt{instanceId > 1 && ` (Instanz #${instanceId})`}
          </h1>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes('Fehler')
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {message}
            </div>
          )}

          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>
              Titel
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Impressum oder Datenschutzerklärung"
              className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent" style={{ border: '1px solid var(--admin-border-strong)' }}
            />
          </div>

          {/* Editor Toolbar */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-secondary)' }}>
              Inhalt
            </label>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--admin-border-strong)', backgroundColor: 'var(--admin-bg-card)' }}>
              <div className="flex flex-wrap gap-1 p-2" style={{ borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-surface)' }}>
                {/* Text Formatting */}
                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className="px-3 py-1 rounded text-sm font-semibold"
                  style={{ backgroundColor: editor?.isActive('bold') ? 'var(--admin-accent)' : 'var(--admin-bg-input)', color: editor?.isActive('bold') ? 'white' : 'inherit' }}
                  title="Fett"
                >
                  B
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className="px-3 py-1 rounded text-sm italic"
                  style={{ backgroundColor: editor?.isActive('italic') ? 'var(--admin-accent)' : 'var(--admin-bg-input)', color: editor?.isActive('italic') ? 'white' : 'inherit' }}
                  title="Kursiv"
                >
                  I
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className="px-3 py-1 rounded text-sm underline"
                  style={{ backgroundColor: editor?.isActive('underline') ? 'var(--admin-accent)' : 'var(--admin-bg-input)', color: editor?.isActive('underline') ? 'white' : 'inherit' }}
                  title="Unterstrichen"
                >
                  U
                </button>

                <div className="w-px mx-1" style={{ backgroundColor: 'var(--admin-border-strong)' }}></div>

                {/* --- COLOR TOOLS --- */}
                {/* 1. Text Colors (Foreground) */}
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold uppercase px-1" style={{ color: 'var(--admin-text-muted)' }}>Text</span>
                  
                  {/* Brand Color Text */}
                  <button
                    onClick={() => editor?.chain().focus().setColor(getBrandColor()).run()}
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: getBrandColor(), border: '1px solid var(--admin-border-strong)', boxShadow: 'var(--admin-shadow)' }}
                    title="Markenfarbe (Text)"
                  />
                  
                  {/* Accent Color Text */}
                  <button
                    onClick={() => editor?.chain().focus().setColor(getAccentColor()).run()}
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: getAccentColor(), border: '1px solid var(--admin-border-strong)', boxShadow: 'var(--admin-shadow)' }}
                    title="Akzentfarbe (Text)"
                  />

                  {/* RESET Text */}
                   <button
                    onClick={() => editor?.chain().focus().unsetColor().run()}
                    className="p-1 rounded" style={{ color: 'var(--admin-text-secondary)' }}
                    title="Farbe entfernen (Schwarz)"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px mx-1" style={{ backgroundColor: 'var(--admin-border-strong)' }}></div>

                {/* 2. Smart Markers (Background + Auto Text) */}
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold uppercase px-1" style={{ color: 'var(--admin-text-muted)' }}>Marker</span>
                  
                  {/* Brand Marker */}
                  <button
                    onClick={() => applySmartMarker(getBrandColor())}
                    className="flex items-center justify-center w-6 h-6 rounded"
                    style={{ backgroundColor: getBrandColor(), border: '1px solid var(--admin-border-strong)', boxShadow: 'var(--admin-shadow)' }}
                    title="Marken-Highlight (Smart)"
                  >
                    <Highlighter className="w-3 h-3 text-white mix-blend-difference" />
                  </button>
                  
                  {/* Accent Marker */}
                  <button
                    onClick={() => applySmartMarker(getAccentColor())}
                    className="flex items-center justify-center w-6 h-6 rounded"
                    style={{ backgroundColor: getAccentColor(), border: '1px solid var(--admin-border-strong)', boxShadow: 'var(--admin-shadow)' }}
                    title="Akzent-Highlight (Smart)"
                  >
                    <Highlighter className="w-3 h-3 text-white mix-blend-difference" />
                  </button>

                   {/* Error/Important Marker (Red) */}
                   <button
                    onClick={() => applySmartMarker('#EF4444')}
                    className="flex items-center justify-center w-6 h-6 rounded bg-red-500" style={{ border: '1px solid var(--admin-border-strong)', boxShadow: 'var(--admin-shadow)' }}
                    title="Wichtig / Fehler"
                  >
                    <Highlighter className="w-3 h-3 text-white" />
                  </button>

                  {/* Clear All Formatting */}
                  <button
                    onClick={clearFormatting}
                    className="p-1 rounded" style={{ color: 'var(--admin-text-secondary)' }}
                    title="Markierung entfernen"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px mx-1" style={{ backgroundColor: 'var(--admin-border-strong)' }}></div>
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className="px-3 py-1 rounded text-sm font-semibold"
                  style={{ backgroundColor: editor?.isActive('heading', { level: 2 }) ? 'var(--admin-accent)' : 'var(--admin-bg-input)', color: editor?.isActive('heading', { level: 2 }) ? 'white' : 'inherit' }}
                  title="Überschrift 2"
                >
                  H2
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  className="px-3 py-1 rounded text-sm"
                  style={{ backgroundColor: editor?.isActive('heading', { level: 3 }) ? 'var(--admin-accent)' : 'var(--admin-bg-input)', color: editor?.isActive('heading', { level: 3 }) ? 'white' : 'inherit' }}
                  title="Überschrift 3"
                >
                  H3
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
                  className="px-3 py-1 rounded text-sm"
                  style={{ backgroundColor: editor?.isActive('heading', { level: 4 }) ? 'var(--admin-accent)' : 'var(--admin-bg-input)', color: editor?.isActive('heading', { level: 4 }) ? 'white' : 'inherit' }}
                  title="Überschrift 4"
                >
                  H4
                </button>

                <div className="w-px mx-1" style={{ backgroundColor: 'var(--admin-border-strong)' }}></div>

                {/* Lists */}
                <button
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className="px-3 py-1 rounded text-sm"
                  style={{ backgroundColor: editor?.isActive('bulletList') ? 'var(--admin-accent)' : 'var(--admin-bg-input)', color: editor?.isActive('bulletList') ? 'white' : 'inherit' }}
                  title="Aufzählung"
                >
                  • Liste
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className="px-3 py-1 rounded text-sm"
                  style={{ backgroundColor: editor?.isActive('orderedList') ? 'var(--admin-accent)' : 'var(--admin-bg-input)', color: editor?.isActive('orderedList') ? 'white' : 'inherit' }}
                  title="Nummerierte Liste"
                >
                  1. Liste
                </button>

                <div className="w-px mx-1" style={{ backgroundColor: 'var(--admin-border-strong)' }}></div>

                {/* Links */}
                <button
                  onClick={setLink}
                  className="px-3 py-1 rounded text-sm"
                  style={{ backgroundColor: editor?.isActive('link') ? 'var(--admin-accent)' : 'var(--admin-bg-input)', color: editor?.isActive('link') ? 'white' : 'inherit' }}
                  title="Link einfügen"
                >
                  🔗 Link
                </button>
                <button
                  onClick={removeLink}
                  disabled={!editor?.isActive('link')}
                  className="px-3 py-1 rounded text-sm disabled:opacity-50" style={{ backgroundColor: 'var(--admin-bg-input)' }}
                  title="Link entfernen"
                >
                  Link ✕
                </button>

                <div className="w-px mx-1" style={{ backgroundColor: 'var(--admin-border-strong)' }}></div>

                {/* Clear Formatting */}
                <button
                  onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
                  className="px-3 py-1 rounded text-sm" style={{ backgroundColor: 'var(--admin-bg-input)' }}
                  title="Formatierung entfernen"
                >
                  Löschen
                </button>
              </div>

              {/* Editor Content */}
              <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 text-white px-6 py-2 rounded-lg font-semibold transition" style={{ backgroundColor: 'var(--admin-accent)' }}
            >
              <Save className="w-4 h-4" />
              Speichern
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Vorschau"
          maxWidth="w-[1024px]"
        >
          <StaticContent instanceId={instanceId} />
        </Modal>
      </div>
    </div>
  );
};
