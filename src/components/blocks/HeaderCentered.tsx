// =====================================================
// HEADER CENTERED COMPONENT
// Logo zentriert oben, Navigation darunter
// Elegant für Salons und Boutiquen
// =====================================================

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useWebsite } from '../../contexts/WebsiteContext';
import { useColorResolver } from '../../hooks/useColorResolver';
import {
  HeaderCenteredConfig,
  NavigationItem,
  createDefaultHeaderCenteredConfig,
  HEADER_HEIGHT_VALUES,
  SHADOW_VALUES_HEADER
} from '../../types/Header';
import { SPACING_VALUES, BORDER_RADIUS_VALUES } from '../../types/Cards';
import { MobileMenu } from './MobileMenu';

// =====================================================
// HELPER HOOKS
// =====================================================

const useScrollState = (threshold: number, enabled: boolean) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, enabled]);

  return { isScrolled };
};

// =====================================================
// NAV ITEM COMPONENT
// =====================================================

interface NavItemProps {
  item: NavigationItem;
  textColor: string;
  activeColor: string;
  hoverColor: string;
  spacing: string;
  onClose?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  item, 
  textColor, 
  activeColor, 
  hoverColor,
  spacing,
  onClose 
}) => {
  const location = useLocation();

  const checkIsActive = () => {
    if (item.type === 'page' && item.target) {
      const currentPath = location.pathname;
      return currentPath === `/${item.target}` || 
             (item.target === 'home' && currentPath === '/');
    }
    return false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (item.type === 'scroll' && item.target) {
      e.preventDefault();
      const element = document.getElementById(item.target);
      element?.scrollIntoView({ behavior: 'smooth' });
      onClose?.();
    }
  };

  const isActive = checkIsActive();

  const content = (
    <span
      className="py-2 transition-colors duration-200 cursor-pointer inline-block text-sm uppercase tracking-wider"
      style={{ 
        color: isActive ? activeColor : textColor,
        padding: `0 ${spacing}`
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
      onMouseLeave={(e) => e.currentTarget.style.color = isActive ? activeColor : textColor}
    >
      {item.label}
    </span>
  );

  if (item.type === 'link' && item.target) {
    return (
      <a 
        href={item.target}
        target={item.openInNewTab ? '_blank' : undefined}
        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
        onClick={onClose}
      >
        {content}
      </a>
    );
  }

  if (item.type === 'page' && item.target) {
    return (
      <Link to={item.target === 'home' ? '/' : `/${item.target}`} onClick={onClose}>
        {content}
      </Link>
    );
  }

  if (item.type === 'scroll') {
    return (
      <button onClick={handleClick}>
        {content}
      </button>
    );
  }

  return null;
};

// =====================================================
// LOGO COMPONENT
// =====================================================

interface LogoProps {
  config: HeaderCenteredConfig['logo'];
  textColor?: string;
  resolveColor: (color: any) => string;
}

const Logo: React.FC<LogoProps> = ({ config, textColor, resolveColor }) => {
  const logoTextColor = resolveColor(config.textColor);
  const { websiteRecord } = useWebsite();

  if (config.type === 'image' && config.imageUrl) {
    return (
      <img
        src={config.imageUrl}
        alt={websiteRecord?.site_name || 'Logo'}
        style={{ maxHeight: `${config.maxHeight}px` }}
        className="h-auto w-auto object-contain"
      />
    );
  }

  if (config.type === 'text') {
    const fontWeightMap = {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    };

    return (
      <span
        className="whitespace-nowrap"
        style={{
          fontSize: `${Math.max(config.maxHeight * 0.6, 24)}px`,
          fontWeight: fontWeightMap[config.fontWeight || 'bold'],
          fontFamily: config.fontFamily,
          color: config.textColor ? logoTextColor : textColor,
          letterSpacing: '0.05em'
        }}
      >
        {config.text || websiteRecord?.site_name || 'Salon'}
      </span>
    );
  }

  return null;
};

// =====================================================
// DIVIDER COMPONENT
// =====================================================

interface DividerProps {
  config: HeaderCenteredConfig['divider'];
  resolveColor: (color: any) => string;
}

const Divider: React.FC<DividerProps> = ({ config, resolveColor }) => {
  const color = resolveColor(config.color);

  if (!config.enabled || config.style === 'none') return null;

  if (config.style === 'line') {
    return (
      <div 
        className="mx-auto my-3"
        style={{ 
          width: `${config.width}px`,
          height: '1px',
          backgroundColor: color
        }}
        aria-hidden="true"
      />
    );
  }

  if (config.style === 'dots') {
    return (
      <div className="flex items-center justify-center gap-2 my-3" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="rounded-full"
            style={{ 
              width: '4px',
              height: '4px',
              backgroundColor: color
            }}
          />
        ))}
      </div>
    );
  }

  if (config.style === 'gradient') {
    return (
      <div 
        className="mx-auto my-3"
        style={{ 
          width: `${config.width}px`,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`
        }}
        aria-hidden="true"
      />
    );
  }

  return null;
};

// =====================================================
// MAIN HEADER CENTERED COMPONENT
// =====================================================

interface HeaderCenteredProps {
  config?: HeaderCenteredConfig;
  isPreview?: boolean;
}

export const HeaderCentered: React.FC<HeaderCenteredProps> = ({ 
  config: propConfig,
  isPreview = false 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolveColorValue: resolveColor } = useColorResolver();

  // Default config
  const config = propConfig || createDefaultHeaderCenteredConfig();

  // Scroll state
  const { isScrolled } = useScrollState(
    config.sticky.showAfter,
    config.sticky.enabled
  );

  // Should show compact version
  const showCompact = config.compactOnScroll && isScrolled;

  // Colors
  const bgColor = resolveColor(config.style.backgroundColor);
  const textColor = resolveColor(config.style.textColor);
  const activeColor = resolveColor(config.style.activeColor);
  const hoverColor = resolveColor(config.style.hoverColor);

  // Transparent mode handling
  const isTransparentMode = config.transparent.enabled && !isScrolled;
  const currentBgColor = isTransparentMode ? 'transparent' : bgColor;
  const currentTextColor = isTransparentMode && config.transparent.textColorLight 
    ? '#FFFFFF' 
    : textColor;

  // Header height - taller for centered variant
  const baseHeight = HEADER_HEIGHT_VALUES[config.style.height];
  const fullHeight = showCompact ? baseHeight : baseHeight + 60;

  // Dynamic styles
  const headerStyles: React.CSSProperties = {
    backgroundColor: currentBgColor,
    color: currentTextColor,
    boxShadow: isScrolled && !isTransparentMode 
      ? SHADOW_VALUES_HEADER[config.style.shadow] 
      : 'none',
    backdropFilter: isScrolled && config.sticky.style === 'blur' 
      ? 'blur(12px)' 
      : 'none',
    transition: 'all 300ms ease-in-out',
    padding: `${SPACING_VALUES[config.style.padding]} 0`
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Visible navigation items
  const visibleNavItems = config.navigation.filter(item => item.visible);

  // Spacing for nav items
  const navSpacing = SPACING_VALUES[config.spacing.navItemSpacing];

  // CTA colors
  const ctaBgColor = config.cta?.enabled ? resolveColor(config.cta.style.backgroundColor) : '';
  const ctaTextColor = config.cta?.enabled ? resolveColor(config.cta.style.textColor) : '';

  return (
    <>
      <header
        className={`
          w-full z-50
          ${config.sticky.enabled && !isPreview ? 'fixed top-0 left-0 right-0' : 'relative'}
        `}
        style={headerStyles}
        role="banner"
      >
        {/* Desktop: Centered Layout */}
        <div className={`
          hidden text-center
          ${config.mobile.breakpoint === 768 ? 'md:block' : 'lg:block'}
        `}>
          {/* Compact Mode: Single Line */}
          {showCompact ? (
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
              <Link to="/" aria-label="Zur Startseite">
                <Logo config={config.logo} textColor={currentTextColor} resolveColor={resolveColor} />
              </Link>

              <nav className="flex items-center" role="navigation" aria-label="Hauptnavigation">
                {visibleNavItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    textColor={currentTextColor}
                    activeColor={activeColor}
                    hoverColor={hoverColor}
                    spacing={navSpacing}
                  />
                ))}
              </nav>

              {config.cta?.enabled && (
                <button
                  onClick={() => {
                    if (config.cta?.action.type === 'scroll') {
                      document.getElementById(config.cta.action.target)?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-5 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: ctaBgColor,
                    color: ctaTextColor,
                    borderRadius: BORDER_RADIUS_VALUES[config.cta.style.borderRadius]
                  }}
                >
                  {config.cta.text}
                </button>
              )}
            </div>
          ) : (
            /* Full Centered Mode */
            <div className="py-4">
              {/* Logo */}
              <Link 
                to="/" 
                className="inline-block"
                aria-label="Zur Startseite"
              >
                <Logo config={config.logo} textColor={currentTextColor} resolveColor={resolveColor} />
              </Link>

              {/* Divider */}
              <Divider config={config.divider} resolveColor={resolveColor} />

              {/* Navigation */}
              <nav 
                className="flex justify-center items-center flex-wrap"
                role="navigation"
                aria-label="Hauptnavigation"
              >
                {visibleNavItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    textColor={currentTextColor}
                    activeColor={activeColor}
                    hoverColor={hoverColor}
                    spacing={navSpacing}
                  />
                ))}

                {config.cta?.enabled && (
                  <button
                    onClick={() => {
                      if (config.cta?.action.type === 'scroll') {
                        document.getElementById(config.cta.action.target)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="ml-4 px-5 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
                    style={{
                      backgroundColor: ctaBgColor,
                      color: ctaTextColor,
                      borderRadius: BORDER_RADIUS_VALUES[config.cta.style.borderRadius]
                    }}
                  >
                    {config.cta.text}
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>

        {/* Mobile: Classic Layout */}
        <div className={`
          flex items-center justify-between px-4
          ${config.mobile.breakpoint === 768 ? 'md:hidden' : 'lg:hidden'}
        `}
          style={{ height: `${baseHeight}px` }}
        >
          <Link to="/" aria-label="Zur Startseite">
            <Logo config={config.logo} textColor={currentTextColor} resolveColor={resolveColor} />
          </Link>

          <button
            className="p-2 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
            style={{ color: currentTextColor }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      {config.sticky.enabled && !isPreview && (
        <div style={{ height: showCompact ? `${baseHeight}px` : `${fullHeight}px` }} />
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        config={config}
        navigation={visibleNavItems}
      />
    </>
  );
};

export default HeaderCentered;
