// =====================================================
// VISUAL EDITOR – DIVIDER RENDERER
// Rendert ein VEDivider-Element (horizontale Trennlinie)
// =====================================================

import React from 'react';
import type { VEDivider } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { useVETheme } from '../theme/VEThemeBridge';

interface DividerRendererProps {
  element: VEDivider;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const DividerRenderer: React.FC<DividerRendererProps> = ({
  element,
  viewport,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  const resolvedStyles = resolveStyles(element.styles, viewport, element);
  const { lineStyle, thickness, color, width } = element.content;
  const { resolveColorValue } = useVETheme();
  const resolvedColor = resolveColorValue(color);

  return (
    <div
      data-ve-id={element.id}
      data-ve-type={element.type}
      onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...resolvedStyles,
      }}
    >
      <hr
        style={{
          width,
          border: 'none',
          borderTop: `${thickness}px ${lineStyle} ${resolvedColor}`,
          margin: 0,
        }}
      />
    </div>
  );
};
