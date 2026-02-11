// =====================================================
// VISUAL EDITOR – SECTION RENDERER
// Rendert eine VESection mit Kindern
// =====================================================

import React from 'react';
import type { VESection } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { ElementRenderer } from './ElementRenderer';

interface SectionRendererProps {
  element: VESection;
  viewport: VEViewport;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

const defaultSectionStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  position: 'relative',
};

export const SectionRenderer: React.FC<SectionRendererProps> = ({ element, viewport, selectedId, hoveredId, onSelect, onHover }) => {
  const resolvedStyles = resolveStyles(element.styles, viewport);
  const isSelected = selectedId === element.id;
  const isHovered = hoveredId === element.id && !isSelected;

  const combinedStyles: React.CSSProperties = {
    ...defaultSectionStyles,
    ...resolvedStyles,
  };

  return (
    <section
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
            padding: '40px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            color: '#9ca3af',
            textAlign: 'center',
            fontSize: '14px',
            width: '100%',
            maxWidth: '600px',
          }}
        >
          Section ist leer – füge Elemente hinzu
        </div>
      )}
    </section>
  );
};
