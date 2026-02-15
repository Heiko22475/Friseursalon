// =====================================================
// V2 ELEMENT RENDERER
// Renders v2 JSON elements directly as HTML.
// Used by DynamicPage for the frontend website view.
// No editor overhead – pure rendering.
// =====================================================

import React from 'react';
import {
  resolveV2ElementStyles,
  isV2ElementVisible,
} from '../visual-editor/converters/v2Converter';
import type { Viewport } from '../hooks/useViewport';
import * as LucideIcons from 'lucide-react';

interface V2ElementRendererProps {
  element: any;
  allStyles: Record<string, any>;
  themeColors: Record<string, string>;
  viewport: Viewport;
}

/**
 * Renders a v2 format element and its children recursively.
 * Handles all v2 tags: body, section, container, text, image, button, icon, link, nav, etc.
 */
export const V2ElementRenderer: React.FC<V2ElementRendererProps> = ({
  element,
  allStyles,
  themeColors,
  viewport,
}) => {
  if (!element) return null;

  // Check visibility for current viewport
  if (!isV2ElementVisible(element.visible, viewport)) {
    return null;
  }

  // Resolve styles: class[] + inline → CSS
  const css = resolveV2ElementStyles(
    element.class,
    element.styles,
    allStyles,
    viewport,
    themeColors,
  );

  // Render children recursively
  const renderChildren = () => {
    if (!element.children || element.children.length === 0) return null;
    return element.children.map((child: any) => (
      <V2ElementRenderer
        key={child.id}
        element={child}
        allStyles={allStyles}
        themeColors={themeColors}
        viewport={viewport}
      />
    ));
  };

  // Build common HTML attributes
  const htmlAttrs: Record<string, any> = {};
  if (element.attrs) {
    Object.assign(htmlAttrs, element.attrs);
  }

  switch (element.tag) {
    // ===== BODY =====
    case 'body':
      return (
        <div data-v2-id={element.id} style={css}>
          {renderChildren()}
        </div>
      );

    // ===== SECTION =====
    case 'section':
      return (
        <section
          data-v2-id={element.id}
          id={element.anchorId || undefined}
          style={css}
          {...htmlAttrs}
        >
          {renderChildren()}
        </section>
      );

    // ===== CONTAINER =====
    case 'container':
      return (
        <div data-v2-id={element.id} style={css} {...htmlAttrs}>
          {renderChildren()}
        </div>
      );

    // ===== TEXT =====
    case 'text':
      return (
        <div
          data-v2-id={element.id}
          style={css}
          dangerouslySetInnerHTML={{ __html: element.html || '' }}
          {...htmlAttrs}
        />
      );

    // ===== IMAGE =====
    case 'image': {
      const src = element.src || '';
      if (!src) {
        // Placeholder for empty images
        return (
          <div
            data-v2-id={element.id}
            style={{
              ...css,
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '14px',
            }}
          >
            Bild
          </div>
        );
      }
      return (
        <img
          data-v2-id={element.id}
          src={src}
          alt={element.alt || ''}
          style={css}
          loading="lazy"
          {...htmlAttrs}
        />
      );
    }

    // ===== BUTTON =====
    case 'button': {
      const href = element.href || '#';
      return (
        <a
          data-v2-id={element.id}
          href={href}
          target={element.newTab ? '_blank' : undefined}
          rel={element.newTab ? 'noopener noreferrer' : undefined}
          style={{
            ...css,
            textDecoration: css.textDecoration || 'none',
          }}
          {...htmlAttrs}
        >
          {element.text || ''}
        </a>
      );
    }

    // ===== LINK =====
    case 'link': {
      const href = element.href || '#';
      return (
        <a
          data-v2-id={element.id}
          href={href}
          target={element.newTab ? '_blank' : undefined}
          rel={element.newTab ? 'noopener noreferrer' : undefined}
          style={{
            ...css,
            textDecoration: css.textDecoration || 'none',
            color: css.color || 'inherit',
          }}
          {...htmlAttrs}
        >
          {element.text || ''}
          {renderChildren()}
        </a>
      );
    }

    // ===== ICON =====
    case 'icon': {
      const iconName = element.icon || 'Circle';
      const strokeWidth = element.stroke ?? 2;
      const IconComponent = (LucideIcons as any)[iconName];

      if (!IconComponent) {
        return (
          <span
            data-v2-id={element.id}
            style={css}
            title={`Icon: ${iconName}`}
          >
            ●
          </span>
        );
      }

      return (
        <span data-v2-id={element.id} style={css} {...htmlAttrs}>
          <IconComponent
            size={css.width ? undefined : 24}
            strokeWidth={strokeWidth}
            style={{
              width: css.width,
              height: css.height,
              color: css.color,
            }}
          />
        </span>
      );
    }

    // ===== NAV =====
    case 'nav': {
      const navStyle: React.CSSProperties = { ...css };
      if (element.sticky === 'sticky' || element.sticky === true) {
        navStyle.position = 'sticky';
        navStyle.top = '0';
        navStyle.zIndex = navStyle.zIndex ?? 100;
      } else if (element.sticky === 'fixed') {
        navStyle.position = 'fixed';
        navStyle.top = '0';
        navStyle.left = '0';
        navStyle.right = '0';
        navStyle.zIndex = navStyle.zIndex ?? 100;
      }

      return (
        <nav data-v2-id={element.id} style={navStyle} {...htmlAttrs}>
          {renderChildren()}
        </nav>
      );
    }

    // ===== DIVIDER =====
    case 'divider': {
      const lineStyle = element.lineStyle || 'solid';
      return (
        <hr
          data-v2-id={element.id}
          style={{
            ...css,
            borderStyle: lineStyle,
          }}
          {...htmlAttrs}
        />
      );
    }

    // ===== SPACER =====
    case 'spacer':
      return <div data-v2-id={element.id} style={css} {...htmlAttrs} />;

    // ===== LIST =====
    case 'list': {
      const Tag = element.ordered ? 'ol' : 'ul';
      return (
        <Tag data-v2-id={element.id} style={css} {...htmlAttrs}>
          {renderChildren()}
        </Tag>
      );
    }

    // ===== VIDEO =====
    case 'video':
      return (
        <video
          data-v2-id={element.id}
          src={element.src}
          poster={element.poster}
          autoPlay={element.autoplay}
          loop
          muted
          playsInline
          style={css}
          {...htmlAttrs}
        />
      );

    // ===== COMPONENT (placeholder) =====
    case 'component':
      return (
        <div data-v2-id={element.id} style={css}>
          {/* Components are resolved at import time or rendered as placeholder */}
          {renderChildren()}
        </div>
      );

    // ===== FALLBACK =====
    default:
      console.warn(`[V2Renderer] Unknown tag: "${element.tag}"`);
      return (
        <div data-v2-id={element.id} style={css}>
          {renderChildren()}
        </div>
      );
  }
};
