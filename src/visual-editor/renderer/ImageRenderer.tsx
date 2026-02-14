// =====================================================
// VISUAL EDITOR – IMAGE RENDERER
// Rendert ein VEImage-Element im Canvas
// =====================================================

import React from 'react';
import type { VEImage } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';

interface ImageRendererProps {
  element: VEImage;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({ element, viewport, isSelected, isHovered, onSelect, onHover }) => {
  const resolvedStyles = resolveStyles(element.styles, viewport);
  const { src, alt } = element.content;

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
          style={{
            width: '100%',
            height: resolvedStyles.height || '200px',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b0b7c3',
            fontSize: '14px',
            borderRadius: resolvedStyles.borderRadius,
          }}
        >
          Bild auswählen
        </div>
      )}
    </div>
  );
};
