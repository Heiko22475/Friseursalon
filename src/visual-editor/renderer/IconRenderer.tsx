// =====================================================
// VISUAL EDITOR – ICON RENDERER
// Rendert ein VEIcon-Element (Lucide Icon)
// =====================================================

import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { VEIcon } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { useVETheme } from '../theme/VEThemeBridge';

interface IconRendererProps {
  element: VEIcon;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

/**
 * Resolves a Lucide icon component by name.
 * Falls back to a placeholder if the icon is not found.
 */
function getLucideIcon(name: string): React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> | null {
  // Lucide exports icons in PascalCase
  const icons = LucideIcons as any;
  return icons[name] || null;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  element,
  viewport,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  const resolvedStyles = resolveStyles(element.styles, viewport, element);
  const { iconName, size, sizeUnit = 'px', color, strokeWidth, containerBg, containerBorderRadius } = element.content;
  const { resolveColorValue } = useVETheme();
  const resolvedColor = resolveColorValue(color);
  const resolvedBg = containerBg ? resolveColorValue(containerBg) : undefined;

  const IconComponent = getLucideIcon(iconName);

  // For px: use numeric size for the Lucide component.
  // For %, em: use '100%' for the SVG and let the container CSS define the actual size.
  const isPx = sizeUnit === 'px';
  const cssSize = `${size}${sizeUnit}`;
  const svgSize = isPx ? size : '100%';

  // Container size is intrinsic: determined by icon size + padding from styles.
  // We only pull margin from resolvedStyles, everything else is content-driven.
  const {
    width: _w, height: _h, minWidth: _mw, minHeight: _mh,
    maxWidth: _xw, maxHeight: _xh,
    ...passthrough
  } = resolvedStyles as any;

  return (
    <div
      data-ve-id={element.id}
      data-ve-type={element.type}
      onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'content-box',
        // Container is square – sized by icon, padded by styles
        width: cssSize,
        height: cssSize,
        borderRadius: containerBorderRadius > 0 ? `${containerBorderRadius}px` : undefined,
        backgroundColor: resolvedBg,
        ...passthrough,
      }}
    >
      {IconComponent ? (
        <IconComponent size={svgSize as any} color={resolvedColor} strokeWidth={strokeWidth} />
      ) : (
        <div
          style={{
            width: cssSize,
            height: cssSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fee2e2',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#ef4444',
          }}
        >
          ?
        </div>
      )}
    </div>
  );
};
