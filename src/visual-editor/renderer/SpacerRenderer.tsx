// =====================================================
// VISUAL EDITOR – SPACER RENDERER
// Rendert ein VESpacer-Element (vertikaler Abstand)
// =====================================================

import React from 'react';
import type { VESpacer } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';

interface SpacerRendererProps {
  element: VESpacer;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const SpacerRenderer: React.FC<SpacerRendererProps> = ({
  element,
  viewport,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  const resolvedStyles = resolveStyles(element.styles, viewport);
  const { height } = element.content;

  return (
    <div
      data-ve-id={element.id}
      data-ve-type={element.type}
      onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={{
        height: `${height}px`,
        position: 'relative',
        ...resolvedStyles,
      }}
    >
      {/* Visual indicator when selected */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderTop: '1px dashed rgba(59, 130, 246, 0.3)',
            borderBottom: '1px dashed rgba(59, 130, 246, 0.3)',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              color: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              padding: '1px 6px',
              borderRadius: '3px',
            }}
          >
            {height}px
          </span>
        </div>
      )}
    </div>
  );
};
