// =====================================================
// VISUAL EDITOR – IMAGE RENDERER
// Rendert ein VEImage-Element im Canvas
// =====================================================

import React from 'react';
import { ImagePlus } from 'lucide-react';
import type { VEImage } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { useMediaDialog } from '../state/VEMediaDialogContext';
import { useEditor } from '../state/EditorContext';

interface ImageRendererProps {
  element: VEImage;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({ element, viewport, isSelected, isHovered, onSelect, onHover }) => {
  const resolvedStyles = resolveStyles(element.styles, viewport, element);
  const { src, alt } = element.content;
  const { openMediaDialog } = useMediaDialog();
  const { dispatch } = useEditor();

  /** Öffnet den zentralen Mediathek-Dialog und setzt das gewählte Bild als src */
  const handlePickImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
    openMediaDialog((url) => {
      dispatch({
        type: 'UPDATE_CONTENT',
        id: element.id,
        updates: { content: { ...element.content, src: url } },
      });
    });
  };

  return (
    <div
      data-ve-id={element.id}
      data-ve-type={element.type}
      onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={{ position: 'relative', ...resolvedStyles }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: resolvedStyles.objectFit || 'cover',
            objectPosition: resolvedStyles.objectPosition,
          }}
          draggable={false}
        />
      ) : (
        <div
          onClick={handlePickImage}
          style={{
            width: '100%',
            height: resolvedStyles.height || '200px',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#9ca3af',
            fontSize: '13px',
            borderRadius: resolvedStyles.borderRadius,
            cursor: 'pointer',
            transition: 'all 0.15s',
            border: '2px dashed #d1d5db',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.color = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.color = '#9ca3af';
          }}
        >
          <ImagePlus size={28} />
          <span>Bild auswählen</span>
        </div>
      )}
    </div>
  );
};
