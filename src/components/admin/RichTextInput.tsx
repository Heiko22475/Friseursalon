import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import { Type } from 'lucide-react';

interface RichTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

// Custom Document that allows inline content without wrapping in <p>
const CustomDocument = Document.extend({
  content: 'block+',
});

const CustomParagraph = Paragraph.extend({
  renderHTML() {
    return ['span', 0];
  },
});

export const RichTextInput: React.FC<RichTextInputProps> = ({
  value,
  onChange,
  placeholder = '',
  label,
  className = '',
}) => {
  const [isRichMode, setIsRichMode] = useState(false);

  const editor = useEditor({
    extensions: [
      CustomDocument,
      CustomParagraph,
      Text,
      Bold,
      Italic,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-rose-500 underline',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Remove wrapping <p> tags and clean up &nbsp;
      let cleanHtml = html.replace(/^<p>|<\/p>$/g, '').replace(/<p>/g, '').replace(/<\/p>/g, ' ');
      cleanHtml = cleanHtml.replace(/&nbsp;/g, ' ').trim();
      onChange(cleanHtml);
    },
    editorProps: {
      attributes: {
        class: 'rich-text-input-editor focus:outline-none px-3 py-2 min-h-[2.5rem]',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const setLink = () => {
    const url = window.prompt('URL eingeben:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  if (!isRichMode) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type="text"
            value={value.replace(/<[^>]*>/g, '')} // Show plain text in simple mode
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setIsRichMode(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-rose-500 transition"
            title="Rich-Text Modus"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-transparent">
        {/* Mini Toolbar */}
        <div className="flex gap-1 p-2 border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded text-sm font-semibold ${
              editor?.isActive('bold') ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            title="Fett"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded text-sm italic ${
              editor?.isActive('italic') ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            title="Kursiv"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`px-2 py-1 rounded text-sm underline ${
              editor?.isActive('underline') ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            title="Unterstrichen"
          >
            U
          </button>
          
          <div className="w-px bg-gray-300 mx-1"></div>
          
          <button
            type="button"
            onClick={setLink}
            className={`px-2 py-1 rounded text-sm ${
              editor?.isActive('link') ? 'bg-rose-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            title="Link einfügen"
          >
            🔗
          </button>
          {editor?.isActive('link') && (
            <button
              type="button"
              onClick={removeLink}
              className="px-2 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
              title="Link entfernen"
            >
              ✕
            </button>
          )}

          <div className="flex-1"></div>

          <button
            type="button"
            onClick={() => {
              setIsRichMode(false);
              editor?.commands.blur();
            }}
            className="px-2 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
            title="Einfacher Modus"
          >
            Fertig
          </button>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
