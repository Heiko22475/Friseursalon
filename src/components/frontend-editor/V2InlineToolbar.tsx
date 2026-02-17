// =====================================================
// V2 INLINE TOOLBAR
// Floating Toolbar über dem selektierten Element.
// Zeigt Typ-Label, "Stile bearbeiten" Button.
// Positioniert sich per position:fixed über dem Element.
// =====================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Settings, GripHorizontal } from 'lucide-react';
import { useV2Edit } from './V2EditContext';
import { useEditMode } from '../../contexts/EditModeContext';

// Tag → German label
const TAG_LABELS: Record<string, string> = {
  text: 'Text',
  container: 'Container',
  section: 'Abschnitt',
  button: 'Button',
  link: 'Link',
  image: 'Bild',
  icon: 'Icon',
  nav: 'Navigation',
  body: 'Body',
  divider: 'Trennlinie',
  spacer: 'Abstand',
  list: 'Liste',
};

// Tag → dot color for type indicator
const TAG_COLORS: Record<string, string> = {
  text: '#f43f5e',
  container: '#3b82f6',
  section: '#8b5cf6',
  button: '#f59e0b',
  link: '#f59e0b',
  image: '#10b981',
  icon: '#6366f1',
  nav: '#14b8a6',
  body: '#6b7280',
  divider: '#9ca3af',
  spacer: '#9ca3af',
};

export const V2InlineToolbar: React.FC = () => {
  const { selectedElement, openPanel, isPanelOpen } = useV2Edit();
  const { isEditMode } = useEditMode();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  // Track position of selected element
  const updatePos = useCallback(() => {
    if (!selectedElement?.rect) {
      setPos(null);
      return;
    }
    // Try to get the live DOM element via data-v2-id
    const domEl = document.querySelector(`[data-v2-id="${selectedElement.id}"]`) as HTMLElement | null;
    if (domEl) {
      const rect = domEl.getBoundingClientRect();
      setPos({ top: rect.top, left: rect.left });
    } else {
      setPos({ top: selectedElement.rect.top, left: selectedElement.rect.left });
    }
  }, [selectedElement]);

  useEffect(() => {
    updatePos();
    if (!selectedElement) return;

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePos);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [selectedElement, updatePos]);

  if (!isEditMode || !selectedElement || !pos) return null;

  const tagColor = TAG_COLORS[selectedElement.tag] || '#6b7280';
  const tagText = TAG_LABELS[selectedElement.tag] || selectedElement.tag;

  // Position toolbar above the element, accounting for panel width
  const toolbarLeft = Math.max(8, Math.min(pos.left, (isPanelOpen ? window.innerWidth - 320 : window.innerWidth) - 200));
  const toolbarTop = Math.max(4, pos.top - 36);

  return createPortal(
    <div
      className="fixed z-[9985] flex items-center gap-1 px-1.5 py-1 rounded-md shadow-lg"
      style={{
        top: `${toolbarTop}px`,
        left: `${toolbarLeft}px`,
        backgroundColor: 'rgba(30,30,46,0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag handle (visual only for now) */}
      <GripHorizontal className="w-3 h-3 text-gray-600 flex-shrink-0" />

      {/* Type dot + label */}
      <div className="flex items-center gap-1.5 px-1.5">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: tagColor }}
        />
        <span className="text-[11px] font-medium text-gray-300 whitespace-nowrap">
          {tagText}
        </span>
        {selectedElement.classes.length > 0 && (
          <span className="text-[10px] text-gray-500 font-mono">
            .{selectedElement.classes[0]}
          </span>
        )}
      </div>

      {/* Separator */}
      <div className="w-px h-4 bg-white/10" />

      {/* Open style panel */}
      <button
        onClick={() => openPanel()}
        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition ${
          isPanelOpen
            ? 'bg-rose-500/20 text-rose-400'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title="Stile bearbeiten"
      >
        <Settings className="w-3 h-3" />
        <span>Stile</span>
      </button>
    </div>,
    document.body,
  );
};
