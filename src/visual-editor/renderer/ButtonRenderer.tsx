// =====================================================
// VISUAL EDITOR – BUTTON RENDERER
// Rendert ein VEButton-Element im Canvas
// =====================================================

import React from 'react';
import type { VEButton } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';

interface ButtonRendererProps {
  element: VEButton;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

const defaultButtonStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 24px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'opacity 0.2s',
};

export const ButtonRenderer: React.FC<ButtonRendererProps> = ({ element, viewport, isSelected, isHovered, onSelect, onHover }) => {
  const resolvedStyles = resolveStyles(element.styles, viewport, element);

  const combinedStyles: React.CSSProperties = {
    ...defaultButtonStyles,
    ...resolvedStyles,
  };

  return (
    <button
      data-ve-id={element.id}
      data-ve-type={element.type}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(element.id);
      }}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={combinedStyles}
      type="button"
    >
      {element.content.text}
    </button>
  );
};
