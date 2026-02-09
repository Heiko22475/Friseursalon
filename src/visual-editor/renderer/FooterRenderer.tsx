// =====================================================
// VISUAL EDITOR – FOOTER RENDERER
// Rendert ein VEFooter-Element im Canvas
// =====================================================

import React from 'react';
import type { VEFooter } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { FooterBlock } from '../../components/blocks/FooterBlock';

interface FooterRendererProps {
  element: VEFooter;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const FooterRenderer: React.FC<FooterRendererProps> = ({
  element,
  // viewport not used directly - FooterBlock handles its own responsiveness
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  return (
    <div
      data-ve-id={element.id}
      data-ve-type="Footer"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        onHover?.(element.id);
      }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={{ width: '100%', position: 'relative', marginTop: 'auto' }}
    >
      {/* Overlay to intercept clicks inside FooterBlock */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          cursor: 'pointer',
        }}
      />
      <FooterBlock config={element.config} isPreview />
    </div>
  );
};
