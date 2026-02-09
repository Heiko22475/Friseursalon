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
  onSelect: (id: string) => void;
}

const defaultContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

export const ContainerRenderer: React.FC<ContainerRendererProps> = ({ element, viewport, selectedId, onSelect }) => {
  const resolvedStyles = resolveStyles(element.styles, viewport);
  const isSelected = selectedId === element.id;

  const combinedStyles: React.CSSProperties = {
    ...defaultContainerStyles,
    ...resolvedStyles,
  };

  return (
    <div
      data-ve-id={element.id}
      data-ve-type={element.type}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onSelect(element.id);
        }
      }}
      className={isSelected ? 've-selected' : ''}
      style={combinedStyles}
    >
      {element.children.map(child => (
        <ElementRenderer
          key={child.id}
          element={child}
          viewport={viewport}
          selectedId={selectedId}
          onSelect={onSelect}
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
