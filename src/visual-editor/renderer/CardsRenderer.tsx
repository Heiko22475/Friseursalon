// =====================================================
// VISUAL EDITOR – CARDS RENDERER
// Rendert ein VECards-Element als responsive Karten-Grid.
// Jede Karte ist ein generischer VEContainer, der über
// ElementRenderer gerendert wird (inkl. inline editing).
// =====================================================

import React from 'react';
import type { VECards } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { sizeValueToCSS } from '../utils/sizeValue';
import { ElementRenderer } from './ElementRenderer';

interface CardsRendererProps {
  element: VECards;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
  /** Pass through for nested selection */
  selectedId?: string | null;
  hoveredId?: string | null;
}

export const CardsRenderer: React.FC<CardsRendererProps> = ({
  element,
  viewport,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  selectedId,
  hoveredId,
}) => {
  const resolvedStyles = resolveStyles(element.styles, viewport);

  // Resolve responsive layout
  const layoutDesktop = element.layout.desktop;
  const layoutTablet = element.layout.tablet;
  const layoutMobile = element.layout.mobile;

  let columns: number;
  let gap: string;

  switch (viewport) {
    case 'mobile':
      columns = layoutMobile?.columns ?? layoutTablet?.columns ?? 1;
      gap = sizeValueToCSS(layoutMobile?.gap ?? layoutTablet?.gap ?? layoutDesktop.gap) ?? '16px';
      break;
    case 'tablet':
      columns = layoutTablet?.columns ?? Math.min(layoutDesktop.columns, 2);
      gap = sizeValueToCSS(layoutTablet?.gap ?? layoutDesktop.gap) ?? '16px';
      break;
    default:
      columns = layoutDesktop.columns;
      gap = sizeValueToCSS(layoutDesktop.gap) ?? '24px';
  }

  const handleGridClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
  };

  const children = element.children || [];

  return (
    <div
      data-ve-id={element.id}
      data-ve-type="Cards"
      onClick={handleGridClick}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={{
        position: 'relative',
        ...resolvedStyles,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
          width: '100%',
        }}
      >
        {children.map(child => (
          <ElementRenderer
            key={child.id}
            element={child}
            viewport={viewport}
            selectedId={selectedId ?? null}
            hoveredId={hoveredId ?? null}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
      {children.length === 0 && (
        <div
          style={{
            padding: '40px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            color: '#b0b7c3',
            textAlign: 'center',
            fontSize: '14px',
            width: '100%',
          }}
        >
          Keine Karten – klicke um Karten hinzuzufügen
        </div>
      )}
    </div>
  );
};
