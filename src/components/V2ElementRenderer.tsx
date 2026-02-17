// =====================================================
// V2 ELEMENT RENDERER
// Renders v2 JSON elements directly as HTML.
// Used by DynamicPage for the frontend website view.
// No editor overhead – pure rendering.
// =====================================================

import React, { useMemo } from 'react';
import {
  resolveV2ElementStyles,
  resolveV2ResponsiveStyles,
  isV2ElementVisible,
} from '../visual-editor/converters/v2Converter';
import type { Viewport } from '../hooks/useViewport';
import * as LucideIcons from 'lucide-react';
import { V2EditableText } from './V2EditableText';

interface V2ElementRendererProps {
  element: any;
  allStyles: Record<string, any>;
  themeColors: Record<string, string>;
  viewport: Viewport;
  /** Page ID for inline editing save path */
  pageId?: string;
  /** Internal: whether this is the root call (renders <style> tag) */
  _isRoot?: boolean;
}

// =====================================================
// PSEUDO-STATE CSS GENERATOR
// Collects :hover/:focus/:active from element tree
// and generates scoped CSS rules.
// =====================================================

const PSEUDO_KEYS = [':hover', ':focus', ':active'] as const;

/** Convert camelCase to kebab-case for CSS properties */
function toKebab(str: string): string {
  return str.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
}

/**
 * Collect pseudo-state CSS rules from the entire element tree.
 * Resolves named classes + inline styles for each pseudo-state,
 * then emits CSS rules like [data-v2-id="xxx"]:hover { ... }
 */
function collectPseudoCSS(
  element: any,
  allStyles: Record<string, any>,
  viewport: 'desktop' | 'tablet' | 'mobile',
  themeColors: Record<string, string>,
): string[] {
  const rules: string[] = [];

  // Merge class-level + inline-level pseudo-states for this element
  const mergedStyles: Record<string, any> = {};

  // From classes
  if (element.class && Array.isArray(element.class)) {
    for (const cls of element.class) {
      const classDef = allStyles[cls];
      if (!classDef) continue;
      // Resolve _extends chain to get all pseudo-states
      const resolved = resolveClassChain(cls, allStyles);
      for (const pk of PSEUDO_KEYS) {
        if (resolved[pk]) {
          if (!mergedStyles[pk]) mergedStyles[pk] = {};
          Object.assign(mergedStyles[pk], resolved[pk]);
        }
      }
    }
  }

  // From inline styles (override class-level)
  if (element.styles) {
    for (const pk of PSEUDO_KEYS) {
      if (element.styles[pk]) {
        if (!mergedStyles[pk]) mergedStyles[pk] = {};
        Object.assign(mergedStyles[pk], element.styles[pk]);
      }
      // Also check inside @tablet/@mobile for nested pseudo-states
      if (viewport === 'tablet' || viewport === 'mobile') {
        const bpKey = `@${viewport}`;
        if (element.styles[bpKey]?.[pk]) {
          if (!mergedStyles[pk]) mergedStyles[pk] = {};
          Object.assign(mergedStyles[pk], element.styles[bpKey][pk]);
        }
      }
      // For mobile, also check @tablet (cascade)
      if (viewport === 'mobile' && element.styles['@tablet']?.[pk]) {
        if (!mergedStyles[pk]) mergedStyles[pk] = {};
        // Tablet first, then mobile overrides
        const combined = { ...element.styles['@tablet'][pk] };
        if (element.styles['@mobile']?.[pk]) {
          Object.assign(combined, element.styles['@mobile'][pk]);
        }
        mergedStyles[pk] = { ...mergedStyles[pk], ...combined };
      }
    }
  }

  // Generate CSS rules
  for (const pk of PSEUDO_KEYS) {
    const pseudoProps = mergedStyles[pk];
    if (!pseudoProps || Object.keys(pseudoProps).length === 0) continue;

    // Resolve v2 values to CSS via resolveV2ResponsiveStyles (desktop-only, no breakpoints inside pseudo)
    const cssObj = resolveV2ResponsiveStyles(pseudoProps, 'desktop', themeColors);
    const declarations = Object.entries(cssObj)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${toKebab(k)}: ${v}`)
      .join('; ');

    if (declarations) {
      rules.push(`[data-v2-id="${element.id}"]${pk} { ${declarations} }`);
    }
  }

  // Also check for transition on the element (needed for hover transitions to work)
  // We handle this via inline styles already, but ensure transition CSS property is present
  // if pseudo-states exist but no transition was set inline
  if (Object.keys(mergedStyles).length > 0) {
    const inlineTransition = element.styles?.transition;
    const classTransition = element.class?.reduce((t: string | undefined, cls: string) => {
      const resolved = resolveClassChain(cls, allStyles);
      return resolved.transition || t;
    }, undefined);
    const transition = inlineTransition || classTransition;
    if (transition) {
      rules.push(`[data-v2-id="${element.id}"] { transition: ${transition} }`);
    }
  }

  // Recurse children
  if (element.children) {
    for (const child of element.children) {
      rules.push(...collectPseudoCSS(child, allStyles, viewport, themeColors));
    }
  }

  return rules;
}

/** Resolve a full class chain including _extends */
function resolveClassChain(name: string, allStyles: Record<string, any>, visited = new Set<string>()): Record<string, any> {
  if (visited.has(name)) return {};
  visited.add(name);
  const def = allStyles[name];
  if (!def) return {};

  let resolved: Record<string, any> = {};
  if (def._extends) {
    resolved = resolveClassChain(def._extends, allStyles, visited);
  }
  for (const [key, val] of Object.entries(def)) {
    if (key === '_extends') continue;
    if (key.startsWith(':')) {
      // Merge pseudo sub-objects
      resolved[key] = { ...(resolved[key] || {}), ...(val as Record<string, any>) };
    } else {
      resolved[key] = val;
    }
  }
  return resolved;
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
  pageId,
  _isRoot = true,
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

  // Collect pseudo-state CSS rules for the entire tree (only at root level)
  const pseudoCSSRules = useMemo(() => {
    if (!_isRoot) return '';
    const rules = collectPseudoCSS(element, allStyles, viewport, themeColors);
    return rules.length > 0 ? rules.join('\n') : '';
  }, [_isRoot, element, allStyles, viewport, themeColors]);

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
        pageId={pageId}
        _isRoot={false}
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
          {pseudoCSSRules && (
            <style dangerouslySetInnerHTML={{ __html: pseudoCSSRules }} />
          )}
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
      if (pageId) {
        return (
          <V2EditableText
            elementId={element.id}
            html={element.html || ''}
            css={css}
            htmlAttrs={htmlAttrs}
            pageId={pageId}
          />
        );
      }
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
