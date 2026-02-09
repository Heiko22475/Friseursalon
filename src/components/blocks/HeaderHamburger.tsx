// =====================================================
// HEADER HAMBURGER COMPONENT
// Minimalistischer Header mit Hamburger-Menü
// Auch auf Desktop immer Hamburger-Menü
// =====================================================

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWebsite } from '../../contexts/WebsiteContext';
import { useColorResolver } from '../../hooks/useColorResolver';
import {
  HeaderHamburgerConfig,
  NavigationItem,
  createDefaultHeaderHamburgerConfig,
  HEADER_HEIGHT_VALUES,
  SHADOW_VALUES_HEADER
} from '../../types/Header';
import { SPACING_VALUES, BORDER_RADIUS_VALUES } from '../../types/Cards';
import { SocialIconsHeader } from './SocialIconsHeader';

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
// HAMBURGER ICON COMPONENT
// =====================================================

interface HamburgerIconProps {
  isOpen: boolean;
  config: HeaderHamburgerConfig['hamburgerIcon'];
  onClick: () => void;
  resolveColor: (color: any) => string;
}

const HamburgerIcon: React.FC<HamburgerIconProps> = ({ isOpen, config, onClick, resolveColor }) => {
  const color = resolveColor(isOpen ? config.activeColor : config.color);

  // Lines style (animated)
  if (config.style === 'lines') {
    return (
      <button
        onClick={onClick}
        className="relative w-8 h-8 flex items-center justify-center focus:outline-none"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Menü schließen' : 'Menü öffnen'}
        style={{ color }}
      >
        <span className="sr-only">{isOpen ? 'Menü schließen' : 'Menü öffnen'}</span>
        <div className="relative w-6 h-5 flex flex-col justify-between">
          <span 
            className={`block h-0.5 w-full bg-current transform transition-all duration-300 origin-center ${
              isOpen ? 'rotate-45 translate-y-[9px]' : ''
            }`}
          />
          <span 
            className={`block h-0.5 w-full bg-current transition-all duration-300 ${
              isOpen ? 'opacity-0 scale-0' : ''
            }`}
          />
          <span 
            className={`block h-0.5 w-full bg-current transform transition-all duration-300 origin-center ${
              isOpen ? '-rotate-45 -translate-y-[9px]' : ''
            }`}
          />
        </div>
      </button>
    );
  }

  // X-rotate style
  if (config.style === 'x-rotate') {
    return (
      <button
        onClick={onClick}
        className="p-2 transition-transform duration-300"
        style={{ 
          color,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Menü schließen' : 'Menü öffnen'}
      >
        {isOpen ? <X size={config.size} /> : <Menu size={config.size} />}
      </button>
    );
  }

  // Dots style
  if (config.style === 'dots') {
    return (
      <button
        onClick={onClick}
        className="p-2 flex flex-col items-center justify-center gap-1.5"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Menü schließen' : 'Menü öffnen'}
      >
        {isOpen ? (
          <X size={config.size} style={{ color }} />
        ) : (
          <>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            </div>
          </>
        )}
      </button>
    );
  }

  // Default
  return (
    <button
      onClick={onClick}
      className="p-2"
      style={{ color }}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Menü schließen' : 'Menü öffnen'}
    >
      {isOpen ? <X size={config.size} /> : <Menu size={config.size} />}
    </button>
  );
};

// =====================================================
// FULLSCREEN MENU COMPONENT
// =====================================================

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeaderHamburgerConfig;
  navigation: NavigationItem[];
  resolveColor: (color: any) => string;
}

const FullscreenMenu: React.FC<FullscreenMenuProps> = ({
  isOpen,
  onClose,
  config,
  navigation,
  resolveColor
}) => {
  const bgColor = resolveColor(config.menu.backgroundColor);
  const textColor = resolveColor(config.menu.textColor);
  const ctaBgColor = config.cta ? resolveColor(config.cta.style.backgroundColor) : '';
  const ctaTextColor = config.cta ? resolveColor(config.cta.style.textColor) : '';
  const overlayColor = config.menu.overlayColor 
    ? resolveColor(config.menu.overlayColor) 
    : bgColor;

  const textSizeClasses = {
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl'
  };

  const textAlignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  // Animation classes
  const getAnimationClasses = () => {
    switch (config.menu.animation) {
      case 'fade':
        return isOpen ? 'opacity-100' : 'opacity-0';
      case 'scale':
        return isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0';
      case 'slide':
      default:
        return isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0';
    }
  };

  const handleNavClick = (item: NavigationItem) => {
    if (item.type === 'scroll' && item.target) {
      document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' });
    }
    onClose();
  };

  return (
    <div
      className={`
        fixed inset-0 z-[100]
        transition-all duration-500 ease-in-out
        ${isOpen ? 'visible' : 'invisible pointer-events-none'}
        ${getAnimationClasses()}
      `}
      style={{ 
        backgroundColor: overlayColor,
        opacity: isOpen ? (config.menu.overlayOpacity || 100) / 100 : 0
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
    >
      {/* Background with full color */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: bgColor }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6"
          style={{ height: `${HEADER_HEIGHT_VALUES[config.style.height]}px` }}
        >
          <Link 
            to="/" 
            onClick={onClose}
            style={{ color: textColor }}
            className="text-2xl font-bold"
          >
            {config.logo.text}
          </Link>

          <HamburgerIcon
            isOpen={true}
            config={{ ...config.hamburgerIcon, color: config.hamburgerIcon.activeColor }}
            onClick={onClose}
            resolveColor={resolveColor}
          />
        </div>

        {/* Navigation */}
        <nav 
          className={`
            flex-1 flex flex-col justify-center px-6
            ${textAlignClasses[config.menu.textAlign]}
          `}
        >
          <ul className="space-y-6">
            {navigation.map((item, index) => (
              <li 
                key={item.id}
                className={`
                  transform transition-all duration-500
                  ${isOpen 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-4 opacity-0'
                  }
                `}
                style={{ 
                  transitionDelay: isOpen ? `${index * 100}ms` : '0ms' 
                }}
              >
                {item.type === 'page' && item.target ? (
                  <Link
                    to={item.target === 'home' ? '/' : `/${item.target}`}
                    onClick={onClose}
                    className={`
                      ${textSizeClasses[config.menu.textSize]}
                      font-medium
                      transition-opacity duration-200
                      hover:opacity-70
                    `}
                    style={{ color: textColor }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleNavClick(item)}
                    className={`
                      ${textSizeClasses[config.menu.textSize]}
                      font-medium
                      transition-opacity duration-200
                      hover:opacity-70
                    `}
                    style={{ color: textColor }}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer: CTA + Social */}
        <div 
          className={`
            px-6 py-8
            flex flex-col gap-6
            ${config.menu.textAlign === 'center' ? 'items-center' : ''}
          `}
        >
          {config.menu.showCTA && config.cta?.enabled && (
            <button
              onClick={() => {
                if (config.cta?.action.type === 'scroll') {
                  document.getElementById(config.cta.action.target)?.scrollIntoView({ behavior: 'smooth' });
                }
                onClose();
              }}
              className="px-8 py-3 font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: ctaBgColor,
                color: ctaTextColor,
                borderRadius: config.cta ? BORDER_RADIUS_VALUES[config.cta.style.borderRadius] : '8px'
              }}
            >
              {config.cta.text}
            </button>
          )}

          {config.menu.showSocialMedia && (
            <SocialIconsHeader 
              size="lg"
              color={textColor}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// LOGO COMPONENT
// =====================================================

interface LogoProps {
  config: HeaderHamburgerConfig['logo'];
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
          fontSize: `${Math.max(config.maxHeight * 0.5, 18)}px`,
          fontWeight: fontWeightMap[config.fontWeight || 'bold'],
          fontFamily: config.fontFamily,
          color: config.textColor ? logoTextColor : textColor
        }}
      >
        {config.text || websiteRecord?.site_name || 'Salon'}
      </span>
    );
  }

  return null;
};

// =====================================================
// MAIN HEADER HAMBURGER COMPONENT
// =====================================================

interface HeaderHamburgerProps {
  config?: HeaderHamburgerConfig;
  isPreview?: boolean;
}

export const HeaderHamburger: React.FC<HeaderHamburgerProps> = ({ 
  config: propConfig,
  isPreview = false 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resolveColorValue: resolveColor } = useColorResolver();

  // Default config
  const config = propConfig || createDefaultHeaderHamburgerConfig();

  // Scroll state
  const { isScrolled } = useScrollState(
    config.sticky.showAfter,
    config.sticky.enabled
  );

  // Colors
  const bgColor = resolveColor(config.style.backgroundColor);
  const textColor = resolveColor(config.style.textColor);

  // Transparent mode handling
  const isTransparentMode = config.transparent.enabled && !isScrolled && !isMenuOpen;
  const currentBgColor = isTransparentMode ? 'transparent' : bgColor;
  const currentTextColor = isTransparentMode && config.transparent.textColorLight 
    ? '#FFFFFF' 
    : textColor;

  // Header height
  const headerHeight = HEADER_HEIGHT_VALUES[config.style.height];

  // Dynamic styles
  const headerStyles: React.CSSProperties = {
    backgroundColor: currentBgColor,
    color: currentTextColor,
    height: `${headerHeight}px`,
    boxShadow: isScrolled && !isTransparentMode 
      ? SHADOW_VALUES_HEADER[config.style.shadow] 
      : 'none',
    backdropFilter: isScrolled && config.sticky.style === 'blur' 
      ? 'blur(12px)' 
      : 'none',
    transition: 'all 300ms ease-in-out',
    padding: `0 ${SPACING_VALUES[config.style.padding]}`
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Visible navigation items
  const visibleNavItems = config.navigation.filter(item => item.visible);

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
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex-shrink-0"
            aria-label="Zur Startseite"
          >
            <Logo config={config.logo} textColor={currentTextColor} resolveColor={resolveColor} />
          </Link>

          {/* Hamburger Button */}
          <HamburgerIcon
            isOpen={isMenuOpen}
            config={{
              ...config.hamburgerIcon,
              color: isMenuOpen ? config.hamburgerIcon.activeColor : 
                     (isTransparentMode && config.transparent.textColorLight 
                       ? { kind: 'custom', hex: '#FFFFFF' } 
                       : config.hamburgerIcon.color)
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            resolveColor={resolveColor}
          />
        </div>
      </header>

      {/* Spacer for fixed header */}
      {config.sticky.enabled && !isPreview && (
        <div style={{ height: `${headerHeight}px` }} />
      )}

      {/* Fullscreen Menu */}
      <FullscreenMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        config={config}
        navigation={visibleNavItems}
        resolveColor={resolveColor}
      />
    </>
  );
};

export default HeaderHamburger;
