// =====================================================
// VISUAL EDITOR – ELEMENT RENDERER
// Zentraler Dispatcher: routet zum richtigen Renderer
// =====================================================

import React from 'react';
import type { VEElement } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { BodyRenderer } from './BodyRenderer';
import { SectionRenderer } from './SectionRenderer';
import { ContainerRenderer } from './ContainerRenderer';
import { TextRenderer } from './TextRenderer';
import { ImageRenderer } from './ImageRenderer';
import { ButtonRenderer } from './ButtonRenderer';

interface ElementRendererProps {
  element: VEElement;
  viewport: VEViewport;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, viewport, selectedId, onSelect }) => {
  const isSelected = selectedId === element.id;

  switch (element.type) {
    case 'Body':
      return (
        <BodyRenderer
          element={element}
          viewport={viewport}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      );

    case 'Section':
      return (
        <SectionRenderer
          element={element}
          viewport={viewport}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      );

    case 'Container':
      return (
        <ContainerRenderer
          element={element}
          viewport={viewport}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      );

    case 'Text':
      return (
        <TextRenderer
          element={element}
          viewport={viewport}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      );

    case 'Image':
      return (
        <ImageRenderer
          element={element}
          viewport={viewport}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      );

    case 'Button':
      return (
        <ButtonRenderer
          element={element}
          viewport={viewport}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      );

    case 'Cards':
      // Phase 2 – Platzhalter
      return (
        <div
          data-ve-id={element.id}
          data-ve-type="Cards"
          onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
          className={isSelected ? 've-selected' : ''}
          style={{
            padding: '24px',
            backgroundColor: '#f9fafb',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          📇 Cards Block (wird in Phase 2 implementiert)
        </div>
      );

    case 'ComponentInstance':
      // Phase 4 – Platzhalter
      return (
        <div
          data-ve-id={element.id}
          data-ve-type="ComponentInstance"
          onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
          className={isSelected ? 've-selected' : ''}
          style={{
            padding: '16px',
            backgroundColor: '#eff6ff',
            border: '2px dashed #93c5fd',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#3b82f6',
            fontSize: '14px',
          }}
        >
          🧩 Component (wird in Phase 4 implementiert)
        </div>
      );

    default:
      return (
        <div style={{ color: 'red', padding: '8px' }}>
          Unknown element type: {(element as any).type}
        </div>
      );
  }
};
