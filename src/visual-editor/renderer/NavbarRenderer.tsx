// =====================================================
// VISUAL EDITOR – NAVBAR RENDERER
// Rendert ein VENavbar-Element als <nav> mit Flexbox.
//
// Convention:
//   1. Kind  = Logo   (immer sichtbar)
//   Letztes Kind = Hamburger (Container mit Icon)
//   Dazwischen = Menü-Elemente
//
// DESKTOP: Logo + Menüpunkte horizontal, Hamburger wird
//          NICHT gerendert (vom Renderer ausgelassen).
// MOBILE:  Hamburger LINKS, Logo RECHTS im Top-Bar,
//          Menü-Elemente in vertikalem Dropdown.
//
// Klick auf Hamburger im Navigator-Tree auf Desktop
// → Viewport wechselt automatisch zur mobileFrom-Ansicht.
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import type { VENavbar } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { ElementRenderer } from './ElementRenderer';
import { useEditor } from '../state/EditorContext';

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
  element, viewport, isSelected, isHovered, onSelect, onHover, selectedId, hoveredId,
}) => {
  const { dispatch } = useEditor();
  const resolvedStyles = resolveStyles(element.styles, viewport, element);
  const [mobileOpen, setMobileOpen] = useState(false);

  const children = element.children || [];
  const mobileFrom = element.mobileFrom ?? 'mobile';

  // Derive child roles by convention
  const logoChild = children.length > 0 ? children[0] : null;
  const hamburgerChild = children.length > 1 ? children[children.length - 1] : null;
  const menuChildren = children.length > 2 ? children.slice(1, -1) : [];

  // Is mobile layout active for the current viewport?
  const showMobile =
    mobileFrom === 'tablet'
      ? viewport === 'tablet' || viewport === 'mobile'
      : viewport === 'mobile';

  // ─── VIEWPORT SWITCH ────────────────────────────────
  // When the hamburger element is selected on desktop (via Navigator tree),
  // automatically switch the viewport so the user sees the mobile layout.
  // IMPORTANT: only react when selectedId itself changes to the hamburger —
  // not when showMobile changes while the hamburger is already selected
  // (that would cause an infinite loop: desktop→mobile→desktop→…).
  const prevSelectedId = useRef<string | null>(null);
  useEffect(() => {
    const justSelected = selectedId !== prevSelectedId.current;
    prevSelectedId.current = selectedId ?? null;
    if (justSelected && !showMobile && hamburgerChild && selectedId === hamburgerChild.id) {
      const target: VEViewport = mobileFrom === 'tablet' ? 'tablet' : 'mobile';
      dispatch({ type: 'SET_VIEWPORT', viewport: target });
    }
  }, [selectedId, showMobile, hamburgerChild, mobileFrom, dispatch]);

  // Close dropdown when switching back to desktop
  useEffect(() => {
    if (!showMobile) setMobileOpen(false);
  }, [showMobile]);

  // ─── STICKY / FIXED ─────────────────────────────────
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

  const navStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    ...stickyStyles,
    ...resolvedStyles,
  };

  const handleNavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
  };

  // ─── MOBILE LAYOUT ──────────────────────────────────
  // Hamburger (LEFT) + Logo (RIGHT) in top bar.
  // Menu items in animated vertical dropdown.
  if (showMobile && children.length > 0) {
    return (
      <nav
        data-ve-id={element.id}
        data-ve-type="Navbar"
        onClick={handleNavClick}
        onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
        className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
        style={{ ...navStyles, flexWrap: 'wrap' }}
      >
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          {/* Hamburger (last child) → rendered LEFT */}
          {hamburgerChild && (
            <div
              onClick={(e) => { e.stopPropagation(); setMobileOpen(prev => !prev); }}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ElementRenderer
                element={hamburgerChild}
                viewport={viewport}
                selectedId={selectedId}
                hoveredId={hoveredId ?? null}
                onSelect={onSelect}
                onHover={onHover}
              />
            </div>
          )}

          {/* Logo (first child) → rendered RIGHT */}
          {logoChild && (
            <ElementRenderer
              element={logoChild}
              viewport={viewport}
              selectedId={selectedId}
              hoveredId={hoveredId ?? null}
              onSelect={onSelect}
              onHover={onHover}
            />
          )}
        </div>

        {/* Dropdown: menu items – vertical flex */}
        {menuChildren.length > 0 && (
          <div style={{
            width: '100%',
            overflow: 'hidden',
            maxHeight: mobileOpen ? `${menuChildren.length * 80 + 40}px` : '0px',
            opacity: mobileOpen ? 1 : 0,
            transition: 'max-height 0.3s ease, opacity 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            paddingTop: mobileOpen ? '12px' : '0px',
            borderTop: mobileOpen ? '1px solid #e5e7eb' : 'none',
            marginTop: mobileOpen ? '8px' : '0px',
          }}>
            {menuChildren.map(child => (
              <ElementRenderer
                key={child.id}
                element={child}
                viewport={viewport}
                selectedId={selectedId}
                hoveredId={hoveredId ?? null}
                onSelect={onSelect}
                onHover={onHover}
              />
            ))}
          </div>
        )}
      </nav>
    );
  }

  // ─── DESKTOP LAYOUT ─────────────────────────────────
  // Render all children EXCEPT the hamburger (last child).
  // The hamburger is not visible on desktop – the renderer
  // simply excludes it from the DOM.
  const desktopChildren = hamburgerChild ? children.slice(0, -1) : children;

  return (
    <nav
      data-ve-id={element.id}
      data-ve-type="Navbar"
      onClick={handleNavClick}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={navStyles}
    >
      {desktopChildren.map(child => (
        <ElementRenderer
          key={child.id}
          element={child}
          viewport={viewport}
          selectedId={selectedId}
          hoveredId={hoveredId ?? null}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
      {children.length === 0 && (
        <div style={{
          padding: '20px 40px',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          color: '#b0b7c3',
          textAlign: 'center',
          fontSize: '14px',
          width: '100%',
        }}>
          Navbar ist leer – füge Logo, Links und Buttons hinzu
        </div>
      )}
    </nav>
  );
};
