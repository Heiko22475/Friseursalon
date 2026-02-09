// =====================================================
// HEADER CLASSIC COMPONENT
// Logo links, Navigation rechts - Standard-Layout
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useWebsite } from '../../contexts/WebsiteContext';
import { useColorResolver } from '../../hooks/useColorResolver';
import {
  HeaderClassicConfig,
  NavigationItem,
  ButtonAction,
  createDefaultHeaderClassicConfig,
  HEADER_HEIGHT_VALUES,
  SHADOW_VALUES_HEADER
} from '../../types/Header';
import { SPACING_VALUES, BORDER_RADIUS_VALUES } from '../../types/Cards';
import { MobileMenu } from './MobileMenu';
import { SocialIconsHeader } from './SocialIconsHeader';

// =====================================================
// HELPER HOOKS
// =====================================================

const useScrollState = (threshold: number, enabled: boolean) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > threshold);
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, enabled, lastScrollY]);

  return { isScrolled, scrollDirection };
};

// =====================================================
// NAV ITEM COMPONENT
// =====================================================

interface NavItemProps {
  item: NavigationItem;
  textColor: string;
  activeColor: string;
  hoverColor: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  item, 
  textColor, 
  activeColor, 
  hoverColor,
  isActive,
  onClick 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  // Check if this nav item is active
  const checkIsActive = useCallback(() => {
    if (item.type === 'page' && item.target) {
      const currentPath = location.pathname;
      return currentPath === `/${item.target}` || 
             (item.target === 'home' && currentPath === '/');
    }
    return false;
  }, [item, location.pathname]);

  const handleClick = (e: React.MouseEvent) => {
    if (item.type === 'scroll' && item.target) {
      e.preventDefault();
      const element = document.getElementById(item.target);
      element?.scrollIntoView({ behavior: 'smooth' });
      onClick?.();
    } else if (item.type === 'dropdown') {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const currentlyActive = isActive ?? checkIsActive();

  // Dropdown
  if (item.type === 'dropdown' && item.children) {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          className="flex items-center gap-1 px-3 py-2 transition-colors duration-200"
          style={{ color: currentlyActive ? activeColor : textColor }}
          onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
          onMouseLeave={(e) => e.currentTarget.style.color = currentlyActive ? activeColor : textColor}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          {item.label}
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div 
            className="absolute top-full left-0 mt-1 min-w-[200px] bg-white rounded-lg shadow-lg py-2 z-50"
            role="menu"
          >
            {item.children.filter(child => child.visible).map((child) => (
              <NavItem
                key={child.id}
                item={child}
                textColor="#374151"
                activeColor={activeColor}
                hoverColor={hoverColor}
                onClick={() => {
                  setIsDropdownOpen(false);
                  onClick?.();
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Link or Scroll
  const content = (
    <span
      className="px-3 py-2 transition-colors duration-200 cursor-pointer block"
      style={{ color: currentlyActive ? activeColor : textColor }}
      onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
      onMouseLeave={(e) => e.currentTarget.style.color = currentlyActive ? activeColor : textColor}
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
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  if (item.type === 'page' && item.target) {
    return (
      <Link to={item.target === 'home' ? '/' : `/${item.target}`} onClick={onClick}>
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
// CTA BUTTON COMPONENT
// =====================================================

interface CTAButtonProps {
  config: NonNullable<HeaderClassicConfig['cta']>;
  resolveColor: (color: any) => string;
  onClick?: () => void;
}

const CTAButton: React.FC<CTAButtonProps> = ({ config, resolveColor, onClick }) => {
  const bgColor = resolveColor(config.style.backgroundColor);
  const textColor = resolveColor(config.style.textColor);

  const handleAction = (action: ButtonAction) => {
    switch (action.type) {
      case 'scroll':
        document.getElementById(action.target)?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'link':
        window.location.href = action.target;
        break;
      case 'phone':
        window.location.href = `tel:${action.target}`;
        break;
      case 'email':
        window.location.href = `mailto:${action.target}`;
        break;
      case 'modal':
        // TODO: Modal handling
        break;
    }
    onClick?.();
  };

  const sizeClasses = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-5 py-2 text-base',
    lg: 'px-6 py-2.5 text-lg'
  };

  return (
    <button
      onClick={() => handleAction(config.action)}
      className={`
        font-medium transition-all duration-200
        hover:opacity-90 hover:scale-105
        ${sizeClasses[config.style.size]}
      `}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: BORDER_RADIUS_VALUES[config.style.borderRadius]
      }}
    >
      {config.text}
    </button>
  );
};

// =====================================================
// LOGO COMPONENT
// =====================================================

interface LogoProps {
  config: HeaderClassicConfig['logo'];
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

  // Logo-Designer: TODO
  return null;
};

// =====================================================
// MAIN HEADER CLASSIC COMPONENT
// =====================================================

interface HeaderClassicProps {
  config?: HeaderClassicConfig;
  isPreview?: boolean;
}

export const HeaderClassic: React.FC<HeaderClassicProps> = ({ 
  config: propConfig,
  isPreview = false 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolveColorValue: resolveColor } = useColorResolver();

  // Default config
  const config = propConfig || createDefaultHeaderClassicConfig();

  // Scroll state
  const { isScrolled, scrollDirection } = useScrollState(
    config.sticky.showAfter,
    config.sticky.enabled
  );

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

  // Hide on scroll down
  const shouldHide = config.sticky.hideOnScrollDown && 
                     isScrolled && 
                     scrollDirection === 'down';

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
    transform: shouldHide ? 'translateY(-100%)' : 'translateY(0)',
    transition: 'all 300ms ease-in-out',
    padding: `0 ${SPACING_VALUES[config.style.padding]}`
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

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

          {/* Desktop Navigation */}
          <nav
            className={`
              hidden items-center
              ${config.mobile.breakpoint === 768 ? 'md:flex' : 'lg:flex'}
              ${config.navPosition === 'center' ? 'flex-1 justify-center' : ''}
            `}
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
              />
            ))}
          </nav>

          {/* Right Side: Social + CTA */}
          <div className={`
            hidden items-center gap-4
            ${config.mobile.breakpoint === 768 ? 'md:flex' : 'lg:flex'}
          `}>
            {/* Social Media Icons */}
            {config.socialMedia.enabled && config.socialMedia.position === 'right' && (
              <SocialIconsHeader 
                size={config.socialMedia.size}
                color={currentTextColor}
              />
            )}

            {/* CTA Button */}
            {config.cta?.enabled && (
              <CTAButton config={config.cta} resolveColor={resolveColor} />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`
              p-2 transition-colors duration-200
              ${config.mobile.breakpoint === 768 ? 'md:hidden' : 'lg:hidden'}
            `}
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
        <div style={{ height: `${headerHeight}px` }} />
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

export default HeaderClassic;
