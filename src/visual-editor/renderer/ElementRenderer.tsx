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
import { HeaderRenderer } from './HeaderRenderer';
import { FooterRenderer } from './FooterRenderer';
import { CardsRenderer } from './CardsRenderer';
import { NavbarRenderer } from './NavbarRenderer';
import { WebsiteBlockRenderer } from './WebsiteBlockRenderer';
import { DividerRenderer } from './DividerRenderer';
import { SpacerRenderer } from './SpacerRenderer';
import { IconRenderer } from './IconRenderer';
import { ListRenderer } from './ListRenderer';
import type { VEHeader, VEFooter, VECards, VENavbar, VEWebsiteBlock, VEDivider, VESpacer, VEIcon, VEList } from '../types/elements';

interface ElementRendererProps {
  element: VEElement;
  viewport: VEViewport;
  selectedId: string | null;
  hoveredId?: string | null;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, viewport, selectedId, hoveredId, onSelect, onHover }) => {
  const isSelected = selectedId === element.id;
  const isHovered = hoveredId === element.id;

  switch (element.type) {
    case 'Body':
      return (
        <BodyRenderer
          element={element}
          viewport={viewport}
          selectedId={selectedId}
          hoveredId={hoveredId ?? null}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'Section':
      return (
        <SectionRenderer
          element={element}
          viewport={viewport}
          selectedId={selectedId}
          hoveredId={hoveredId ?? null}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'Container':
      return (
        <ContainerRenderer
          element={element}
          viewport={viewport}
          selectedId={selectedId}
          hoveredId={hoveredId ?? null}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'Text':
      return (
        <TextRenderer
          element={element}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={isHovered}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'Image':
      return (
        <ImageRenderer
          element={element}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={isHovered}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'Button':
      return (
        <ButtonRenderer
          element={element}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={isHovered}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'Cards':
      return (
        <CardsRenderer
          element={element as VECards}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={!!isHovered}
          onSelect={onSelect}
          onHover={onHover}
          selectedId={selectedId}
          hoveredId={hoveredId}
        />
      );

    case 'Navbar':
      return (
        <NavbarRenderer
          element={element as VENavbar}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={!!isHovered}
          onSelect={onSelect}
          onHover={onHover}
          selectedId={selectedId}
          hoveredId={hoveredId}
        />
      );

    case 'Header':
      return (
        <HeaderRenderer
          element={element as VEHeader}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={!!isHovered}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'Footer':
      return (
        <FooterRenderer
          element={element as VEFooter}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={!!isHovered}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'WebsiteBlock':
      return (
        <WebsiteBlockRenderer
          element={element as VEWebsiteBlock}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={!!isHovered}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'Divider':
      return (
        <DividerRenderer
          element={element as VEDivider}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={!!isHovered}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'Spacer':
      return (
        <SpacerRenderer
          element={element as VESpacer}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={!!isHovered}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'Icon':
      return (
        <IconRenderer
          element={element as VEIcon}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={!!isHovered}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

    case 'List':
      return (
        <ListRenderer
          element={element as VEList}
          viewport={viewport}
          isSelected={isSelected}
          isHovered={!!isHovered}
          onSelect={onSelect}
          onHover={onHover}
          selectedId={selectedId}
          hoveredId={hoveredId}
        />
      );

    case 'ListItem':
      // ListItem is rendered by ListRenderer, not directly
      return null;

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
