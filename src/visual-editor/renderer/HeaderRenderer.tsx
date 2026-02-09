// =====================================================
// VISUAL EDITOR – HEADER RENDERER
// Rendert ein VEHeader-Element im Canvas
// =====================================================

import React from 'react';
import type { VEHeader } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { HeaderBlock } from '../../components/blocks/HeaderBlock';

interface HeaderRendererProps {
  element: VEHeader;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const HeaderRenderer: React.FC<HeaderRendererProps> = ({
  element,
  // viewport not used directly - HeaderBlock handles its own responsiveness
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  return (
    <div
      data-ve-id={element.id}
      data-ve-type="Header"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        onHover?.(element.id);
      }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={{ width: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {/* Overlay to intercept clicks inside HeaderBlock */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          cursor: 'pointer',
        }}
      />
      <HeaderBlock config={element.config} isPreview />
    </div>
  );
};
