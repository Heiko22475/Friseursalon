// =====================================================
// EDITABLE TEXT COMPONENT
// Macht Text-Elemente auf der Live-Webseite editierbar
// MVP Version: Einfaches Textarea statt TipTap
// =====================================================

import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import { Edit2, Save, X, Loader2 } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';
import { useWebsite } from '../../contexts/WebsiteContext';
import _ from 'lodash';

interface EditableTextProps {
  // Identification
  blockId: string;
  fieldPath: string; // e.g., "title", "texts[0].content"
  
  // Content
  value: string;
  
  // Styling (optional)
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  style?: CSSProperties;
  
  // Callbacks
  onSave?: (newValue: string) => void;
  
  // Options
  multiline?: boolean;
  maxLength?: number;
}

export const EditableText: React.FC<EditableTextProps> = ({
  blockId,
  fieldPath,
  value,
  as: Component = 'div',
  className = '',
  style = {},
  onSave,
  multiline = true,
  maxLength = 5000,
}) => {
  const { isEditMode, startEditing, stopEditing, isEditing } = useEditMode();
  const { website, updatePages } = useWebsite();
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const editId = `${blockId}:${fieldPath}`;
  const isCurrentlyEditing = isEditing(editId);

  // Update local value when prop changes
  useEffect(() => {
    if (!isCurrentlyEditing) {
      setLocalValue(value);
    }
  }, [value, isCurrentlyEditing]);

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (isCurrentlyEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isCurrentlyEditing]);

  const handleSave = async () => {
    if (localValue === value) {
      stopEditing();
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (!website) throw new Error('Website data not loaded');

      // 1. Find the page and block
      const pages = website.pages || [];
      let targetPage = null;
      let targetBlock = null;

      for (const page of pages) {
        const block = page.blocks?.find(b => b.id === blockId);
        if (block) {
          targetPage = page;
          targetBlock = block;
          break;
        }
      }

      if (!targetPage || !targetBlock) {
        throw new Error('Block not found in any page');
      }

      // 2. Update the specific field in the block's config
      const updatedConfig = _.set({ ...targetBlock.config }, fieldPath, localValue);

      // 3. Update the pages array with the new config
      const updatedPages = pages.map(page => {
        if (page.id === targetPage!.id) {
          return {
            ...page,
            blocks: page.blocks.map(block => {
              if (block.id === blockId) {
                return { ...block, config: updatedConfig };
              }
              return block;
            })
          };
        }
        return page;
      });

      // 4. Save to database via WebsiteContext
      await updatePages(updatedPages);

      // 5. Success - close editor and trigger callback
      stopEditing();
      onSave?.(localValue);
      
      console.log('✅ Text erfolgreich gespeichert');

    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalValue(value); // Reset to original
    setError(null);
    stopEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      // Cmd/Ctrl + Enter to save
      e.preventDefault();
      handleSave();
    }
  };

  // Normal view (edit mode off)
  if (!isEditMode) {
    return (
      <Component className={className} style={style}>
        {value}
      </Component>
    );
  }

  // Edit view (currently editing this field)
  if (isCurrentlyEditing) {
    return (
      <div className="relative inline-edit-container">
        {/* Editor */}
        <div className="relative">
          {multiline ? (
            <textarea
              ref={textareaRef}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={maxLength}
              disabled={isSaving}
              className={`
                w-full border-2 border-rose-500 rounded-lg p-4
                bg-white text-gray-900
                focus:outline-none focus:ring-2 focus:ring-rose-300
                disabled:opacity-50 disabled:cursor-not-allowed
                resize-none shadow-lg
              `}
              style={{
                minHeight: '120px',
                fontSize: '24px',
                fontFamily: style.fontFamily || 'inherit',
                fontWeight: style.fontWeight || 'inherit',
                lineHeight: '1.4',
              }}
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={maxLength}
              disabled={isSaving}
              className="
                w-full border-2 border-rose-500 rounded-lg px-4 py-3
                bg-white text-gray-900 shadow-lg
                focus:outline-none focus:ring-2 focus:ring-rose-300
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              style={{
                fontSize: '24px',
                fontFamily: style.fontFamily || 'inherit',
                fontWeight: style.fontWeight || 'inherit',
              }}
            />
          )}
          
          {/* Character count */}
          {multiline && (
            <div className="absolute bottom-3 right-3 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {localValue.length} / {maxLength}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 p-3 bg-white rounded-lg shadow-md border border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving || localValue === value}
            className="
              flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg
              hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors font-medium text-sm shadow-sm
            "
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Speichert...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Speichern
              </>
            )}
          </button>
          
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="
              flex items-center gap-2 px-4 py-2 border border-gray-300 
              rounded-lg hover:bg-gray-50 disabled:opacity-50 
              disabled:cursor-not-allowed transition-colors text-sm
            "
          >
            <X className="w-4 h-4" />
            Abbrechen
          </button>
          
          <span className="text-xs text-gray-500 ml-2">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">Esc</kbd> zum Abbrechen
            {' · '}
            <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">⌘/Ctrl + Enter</kbd> zum Speichern
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>
    );
  }

  // Edit mode on, but not currently editing (show edit indicator)
  return (
    <div className="relative inline-block group editable-text-wrapper">
      <Component 
        className={`${className} transition-all cursor-pointer`} 
        style={style}
        onClick={() => startEditing(editId)}
        title="Klicken zum Bearbeiten"
      >
        {value}
      </Component>
      
      {/* Edit indicator (appears on hover) */}
      <button
        onClick={() => startEditing(editId)}
        className="
          absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 
          rounded-full shadow-lg opacity-0 group-hover:opacity-100
          transition-opacity duration-200 hover:bg-rose-600 hover:scale-110
          z-10
        "
        title="Text bearbeiten"
      >
        <Edit2 className="w-3 h-3" />
      </button>
      
      {/* Hover outline */}
      <div className="
        absolute inset-0 border-2 border-dashed border-rose-500 rounded
        opacity-0 group-hover:opacity-100 pointer-events-none
        transition-opacity duration-200 -z-10
      " />
    </div>
  );
};
