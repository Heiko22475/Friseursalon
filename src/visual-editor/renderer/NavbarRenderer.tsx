// =====================================================
// VISUAL EDITOR – NAVBAR RENDERER
// Rendert ein VENavbar-Element als <nav> mit Flexbox.
// Kinder sind frei editierbare VE-Elemente (Text, Image,
// Button, Container etc.) – kein opaker Block.
// =====================================================

import React, { useState } from 'react';
import type { VENavbar } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { ElementRenderer } from './ElementRenderer';

interface NavbarRendererProps {
  element: VENavbar;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
  selectedId: string | null;
  hoveredId?: string | null;
}

export const NavbarRenderer: React.FC<NavbarRendererProps> = ({
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine if we're below the mobile breakpoint
  const isMobile = viewport === 'mobile' || viewport === 'tablet';

  // Sticky / fixed positioning
  const stickyStyles: React.CSSProperties = {};
  if (element.stickyMode === 'sticky') {
    stickyStyles.position = 'sticky';
    stickyStyles.top = 0;
    stickyStyles.zIndex = 100;
  } else if (element.stickyMode === 'fixed') {
    stickyStyles.position = 'fixed';
    stickyStyles.top = 0;
    stickyStyles.left = 0;
    stickyStyles.right = 0;
    stickyStyles.zIndex = 100;
  }

  const combinedStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    ...stickyStyles,
    ...resolvedStyles,
  };

  const handleNavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
  };

  // Handle mobile menu toggle: intercept clicks on buttons with link=#mobile-menu
  const handleChildClick = (childId: string) => {
    const child = element.children?.find(c => c.id === childId);
    if (child && child.type === 'Button' && (child as any).content?.link === '#mobile-menu') {
      setMobileOpen(!mobileOpen);
    }
    onSelect(childId);
  };

  const children = element.children || [];

  return (
    <nav
      data-ve-id={element.id}
      data-ve-type="Navbar"
      onClick={handleNavClick}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={combinedStyles}
    >
      {children.map(child => (
        <ElementRenderer
          key={child.id}
          element={child}
          viewport={viewport}
          selectedId={selectedId}
          hoveredId={hoveredId ?? null}
          onSelect={handleChildClick}
          onHover={onHover}
        />
      ))}
      {children.length === 0 && (
        <div
          style={{
            padding: '20px 40px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            color: '#b0b7c3',
            textAlign: 'center',
            fontSize: '14px',
            width: '100%',
          }}
        >
          Navbar ist leer – füge Logo, Links und Buttons hinzu
        </div>
      )}
    </nav>
  );
};
