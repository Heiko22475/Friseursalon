// =====================================================
// VISUAL EDITOR – CONTAINER RENDERER
// Rendert einen VEContainer mit Kindern
// =====================================================

import React from 'react';
import type { VEContainer } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { ElementRenderer } from './ElementRenderer';

interface ContainerRendererProps {
  element: VEContainer;
  viewport: VEViewport;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

const defaultContainerStyles: React.CSSProperties = {
  display: 'flex',
  // NOTE: Do NOT set flexDirection here. CSS defaults to 'row' when display:flex.
  // Imported elements (nav-links, hero-cta-row, price-row etc.) rely on this default.
  // VE-created containers already set flexDirection:'column' in their element.styles.
  position: 'relative',
};

export const ContainerRenderer: React.FC<ContainerRendererProps> = ({ element, viewport, selectedId, hoveredId, onSelect, onHover }) => {
  const resolvedStyles = resolveStyles(element.styles, viewport, element);
  const isSelected = selectedId === element.id;
  const isHovered = hoveredId === element.id && !isSelected;

  const combinedStyles: React.CSSProperties = {
    ...defaultContainerStyles,
    ...resolvedStyles,
  };

  return (
    <div
      data-ve-id={element.id}
      data-ve-type={element.type}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={combinedStyles}
    >
      {element.children.map(child => (
        <ElementRenderer
          key={child.id}
          element={child}
          viewport={viewport}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
      {element.children.length === 0 && (
        <div
          style={{
            padding: '24px',
            border: '1px dashed #e5e7eb',
            borderRadius: '4px',
            color: '#d1d5db',
            textAlign: 'center',
            fontSize: '13px',
          }}
        >
          Leerer Container
        </div>
      )}
    </div>
  );
};
