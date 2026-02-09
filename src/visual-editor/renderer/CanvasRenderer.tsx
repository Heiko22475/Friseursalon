// =====================================================
// VISUAL EDITOR – CANVAS RENDERER
// Hauptkomponente: rendert die gesamte Page im Canvas
// =====================================================

import React from 'react';
import type { VEPage } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { BodyRenderer } from './BodyRenderer';

interface CanvasRendererProps {
  page: VEPage;
  viewport: VEViewport;
  selectedId: string | null;
  hoveredId?: string | null;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

const viewportWidths: Record<VEViewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({ page, viewport, selectedId, onSelect, onHover }) => {
  return (
    <div
      className="ve-canvas"
      style={{
        width: viewportWidths[viewport],
        maxWidth: '100%',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        minHeight: '100%',
        transition: 'width 0.3s ease',
        position: 'relative',
      }}
      onMouseLeave={() => onHover?.(null)}
    >
      <BodyRenderer
        element={page.body}
        viewport={viewport}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  );
};
