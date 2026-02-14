// =====================================================
// NAVBAR BLOCK – Frontend Renderer
// Rendert einen navbar-Block aus dem Website-JSON.
// Nutzt die serialisierten VE-Kinder (Text, Button, Container, Image)
// und rendert sie als native HTML-Elemente.
// =====================================================

import React, { useState, useEffect } from 'react';
import { sizeValueToCSS } from '../../visual-editor/utils/sizeValue';
import type { ColorValue } from '../../types/theme';

// ===== TYPES =====

interface NavbarChild {
  id: string;
  type: 'Text' | 'Button' | 'Image' | 'Container';
  label?: string;
  content?: any;
  textStyle?: string;
  style?: {
    desktop?: Record<string, any>;
    tablet?: Record<string, any>;
    mobile?: Record<string, any>;
  };
  children?: NavbarChild[];
}

interface NavbarConfig {
  stickyMode?: 'none' | 'sticky' | 'fixed' | 'always';
  mobileBreakpoint?: number;
  children?: NavbarChild[];
}

interface NavbarBlockProps {
  config: NavbarConfig;
}

// ===== HELPERS =====

function resolveColor(cv: ColorValue | string | undefined | null): string | undefined {
  if (!cv) return undefined;
  if (typeof cv === 'string') return cv;
  if (cv.kind === 'custom') return cv.hex;
  if (cv.kind === 'tokenRef') return `var(--${cv.ref.replace(/\./g, '-')})`;
  return undefined;
}

function resolveChildStyles(style: NavbarChild['style']): React.CSSProperties {
  if (!style?.desktop) return {};
  const desktop = style.desktop;
  const css: React.CSSProperties = {};

  // Map each property
  for (const [key, val] of Object.entries(desktop)) {
    if (val === undefined || val === null) continue;

    // Color properties need color resolution
    if (['color', 'backgroundColor', 'borderColor'].includes(key)) {
      (css as any)[key] = resolveColor(val as ColorValue);
    }
    // Size value properties
    else if (typeof val === 'object' && 'value' in val && 'unit' in val) {
      (css as any)[key] = sizeValueToCSS(val);
    }
    // Direct values (string, number)
    else {
      (css as any)[key] = val;
    }
  }

  return css;
}

// ===== CHILD RENDERER =====

const NavbarChildRenderer: React.FC<{ child: NavbarChild }> = ({ child }) => {
  const styles = resolveChildStyles(child.style);

  switch (child.type) {
    case 'Text':
      return (
        <span style={styles}>
          {child.content || ''}
        </span>
      );

    case 'Button': {
      const text = typeof child.content === 'object' ? child.content?.text : child.content;
      const link = typeof child.content === 'object' ? child.content?.link : '#';
      return (
        <a href={link || '#'} style={{ textDecoration: 'none', ...styles }}>
          {text || ''}
        </a>
      );
    }

    case 'Image': {
      const src = typeof child.content === 'object' ? child.content?.src : child.content;
      const alt = typeof child.content === 'object' ? child.content?.alt : '';
      return <img src={src} alt={alt || ''} style={styles} />;
    }

    case 'Container':
      return (
        <div style={styles}>
          {(child.children || []).map(c => (
            <NavbarChildRenderer key={c.id} child={c} />
          ))}
        </div>
      );

    default:
      return null;
  }
};

// ===== NAVBAR BLOCK =====

export const NavbarBlock: React.FC<NavbarBlockProps> = ({ config }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const breakpoint = config.mobileBreakpoint || 768;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  const children = config.children || [];

  // Separate logo (first child), nav links, and CTA
  // Simple heuristic: first Text = logo, Containers = nav links, Buttons = CTA
  const stickyMode = config.stickyMode || 'none';

  const navStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '16px 32px',
    boxSizing: 'border-box',
  };

  const headerStyles: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#F9F7F2',
    borderBottom: '1px solid #DED9D0',
    zIndex: 100,
    ...(stickyMode === 'sticky' || stickyMode === 'always'
      ? { position: 'sticky' as const, top: 0 }
      : stickyMode === 'fixed'
        ? { position: 'fixed' as const, top: 0, left: 0, right: 0 }
        : {}
    ),
  };

  if (isMobile) {
    return (
      <header style={headerStyles}>
        <div style={{ ...navStyles, flexWrap: 'wrap' }}>
          {/* Render logo (first child) */}
          {children.length > 0 && (
            <NavbarChildRenderer child={children[0]} />
          )}
          {/* Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '24px', lineHeight: 1, padding: '4px',
            }}
            aria-label="Menü"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
          {/* Mobile dropdown */}
          {isMobileMenuOpen && (
            <div style={{
              width: '100%', display: 'flex', flexDirection: 'column',
              gap: '16px', padding: '16px 0',
            }}>
              {children.slice(1).map(c => (
                <NavbarChildRenderer key={c.id} child={c} />
              ))}
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header style={headerStyles}>
      <nav style={navStyles}>
        {children.map(child => (
          <NavbarChildRenderer key={child.id} child={child} />
        ))}
      </nav>
    </header>
  );
};
