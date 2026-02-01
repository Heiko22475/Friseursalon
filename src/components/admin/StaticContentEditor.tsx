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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition"
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

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Impressum oder Datenschutzerklärung"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Editor Toolbar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inhalt
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
              <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
                {/* Text Formatting */}
                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    editor?.isActive('bold') ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Fett"
                >
                  B
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`px-3 py-1 rounded text-sm italic ${
                    editor?.isActive('italic') ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Kursiv"
                >
                  I
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={`px-3 py-1 rounded text-sm underline ${
                    editor?.isActive('underline') ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Unterstrichen"
                >
                  U
                </button>

                <div className="w-px bg-gray-300 mx-1"></div>

                {/* --- COLOR TOOLS --- */}
                {/* 1. Text Colors (Foreground) */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase px-1">Text</span>
                  
                  {/* Brand Color Text */}
                  <button
                    onClick={() => editor?.chain().focus().setColor(getBrandColor()).run()}
                    className="w-6 h-6 rounded border border-gray-300 shadow-sm"
                    style={{ backgroundColor: getBrandColor() }}
                    title="Markenfarbe (Text)"
                  />
                  
                  {/* Accent Color Text */}
                  <button
                    onClick={() => editor?.chain().focus().setColor(getAccentColor()).run()}
                    className="w-6 h-6 rounded border border-gray-300 shadow-sm"
                    style={{ backgroundColor: getAccentColor() }}
                    title="Akzentfarbe (Text)"
                  />

                  {/* RESET Text */}
                   <button
                    onClick={() => editor?.chain().focus().unsetColor().run()}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600"
                    title="Farbe entfernen (Schwarz)"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px bg-gray-300 mx-1"></div>

                {/* 2. Smart Markers (Background + Auto Text) */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase px-1">Marker</span>
                  
                  {/* Brand Marker */}
                  <button
                    onClick={() => applySmartMarker(getBrandColor())}
                    className="flex items-center justify-center w-6 h-6 rounded border border-gray-300 shadow-sm"
                    style={{ backgroundColor: getBrandColor() }}
                    title="Marken-Highlight (Smart)"
                  >
                    <Highlighter className="w-3 h-3 text-white mix-blend-difference" />
                  </button>
                  
                  {/* Accent Marker */}
                  <button
                    onClick={() => applySmartMarker(getAccentColor())}
                    className="flex items-center justify-center w-6 h-6 rounded border border-gray-300 shadow-sm"
                    style={{ backgroundColor: getAccentColor() }}
                    title="Akzent-Highlight (Smart)"
                  >
                    <Highlighter className="w-3 h-3 text-white mix-blend-difference" />
                  </button>

                   {/* Error/Important Marker (Red) */}
                   <button
                    onClick={() => applySmartMarker('#EF4444')}
                    className="flex items-center justify-center w-6 h-6 rounded border border-gray-300 shadow-sm bg-red-500"
                    title="Wichtig / Fehler"
                  >
                    <Highlighter className="w-3 h-3 text-white" />
                  </button>

                  {/* Clear All Formatting */}
                  <button
                    onClick={clearFormatting}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600"
                    title="Markierung entfernen"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px bg-gray-300 mx-1"></div>
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    editor?.isActive('heading', { level: 2 }) ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Überschrift 2"
                >
                  H2
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`px-3 py-1 rounded text-sm ${
                    editor?.isActive('heading', { level: 3 }) ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Überschrift 3"
                >
                  H3
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
                  className={`px-3 py-1 rounded text-sm ${
                    editor?.isActive('heading', { level: 4 }) ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Überschrift 4"
                >
                  H4
                </button>

                <div className="w-px bg-gray-300 mx-1"></div>

                {/* Lists */}
                <button
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={`px-3 py-1 rounded text-sm ${
                    editor?.isActive('bulletList') ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Aufzählung"
                >
                  • Liste
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={`px-3 py-1 rounded text-sm ${
                    editor?.isActive('orderedList') ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Nummerierte Liste"
                >
                  1. Liste
                </button>

                <div className="w-px bg-gray-300 mx-1"></div>

                {/* Links */}
                <button
                  onClick={setLink}
                  className={`px-3 py-1 rounded text-sm ${
                    editor?.isActive('link') ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Link einfügen"
                >
                  🔗 Link
                </button>
                <button
                  onClick={removeLink}
                  disabled={!editor?.isActive('link')}
                  className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                  title="Link entfernen"
                >
                  Link ✕
                </button>

                <div className="w-px bg-gray-300 mx-1"></div>

                {/* Clear Formatting */}
                <button
                  onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
                  className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
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
              className="flex items-center gap-2 bg-rose-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-rose-600 transition"
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
