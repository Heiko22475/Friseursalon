// =====================================================
// VISUAL EDITOR – BODY RENDERER
// Rendert den VEBody (Root) mit seinen Kindern
// =====================================================

import React from 'react';
import type { VEBody } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { ElementRenderer } from './ElementRenderer';

interface BodyRendererProps {
  element: VEBody;
  viewport: VEViewport;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const BodyRenderer: React.FC<BodyRendererProps> = ({ element, viewport, selectedId, onSelect }) => {
  const resolvedStyles = resolveStyles(element.styles, viewport);
  const isSelected = selectedId === element.id;

  const combinedStyles: React.CSSProperties = {
    minHeight: '100%',
    position: 'relative',
    ...resolvedStyles,
  };

  return (
    <div
      data-ve-id={element.id}
      data-ve-type="Body"
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 40px',
            color: '#9ca3af',
            fontSize: '16px',
            textAlign: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '40px' }}>+</span>
          <span>Füge eine Section hinzu, um zu beginnen</span>
        </div>
      )}
    </div>
  );
};
