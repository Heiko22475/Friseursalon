// =====================================================
// MOBILE MENU COMPONENT
// Responsive Navigation für alle Header-Varianten
// =====================================================

import React, { useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useColorResolver } from '../../hooks/useColorResolver';
import { 
  HeaderConfig, 
  NavigationItem,
  HEADER_HEIGHT_VALUES
} from '../../types/Header';
import { BORDER_RADIUS_VALUES } from '../../types/Cards';
import { SocialIconsHeader } from './SocialIconsHeader';

// =====================================================
// MOBILE NAV ITEM
// =====================================================

interface MobileNavItemProps {
  item: NavigationItem;
  textColor: string;
  activeColor: string;
  textSize: string;
  textAlign: 'left' | 'center' | 'right';
  onClose: () => void;
  depth?: number;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({
  item,
  textColor,
  activeColor,
  textSize,
  textAlign,
  onClose,
  depth = 0
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleClick = () => {
    if (item.type === 'scroll' && item.target) {
      const element = document.getElementById(item.target);
      element?.scrollIntoView({ behavior: 'smooth' });
      onClose();
    } else if (item.type === 'dropdown') {
      setIsExpanded(!isExpanded);
    } else {
      onClose();
    }
  };

  const textSizeClasses = {
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const paddingLeft = depth > 0 ? `${depth * 16}px` : '0';

  // Dropdown item
  if (item.type === 'dropdown' && item.children) {
    return (
      <div>
        <button
          onClick={handleClick}
          className={`
            w-full py-3 flex items-center justify-between
            ${textSizeClasses[textSize as keyof typeof textSizeClasses] || 'text-xl'}
            transition-colors duration-200
          `}
          style={{ 
            color: textColor,
            paddingLeft
          }}
        >
          <span>{item.label}</span>
          <ChevronRight 
            size={20} 
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </button>

        {isExpanded && (
          <div className="space-y-1">
            {item.children.filter(child => child.visible).map((child) => (
              <MobileNavItem
                key={child.id}
                item={child}
                textColor={textColor}
                activeColor={activeColor}
                textSize="md"
                textAlign={textAlign}
                onClose={onClose}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Link content
  const content = (
    <span
      className={`
        block py-3 w-full
        ${textSizeClasses[textSize as keyof typeof textSizeClasses] || 'text-xl'}
        ${alignClasses[textAlign]}
        transition-colors duration-200
        hover:opacity-80
      `}
      style={{ 
        color: textColor,
        paddingLeft
      }}
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
      <Link 
        to={item.target === 'home' ? '/' : `/${item.target}`}
        onClick={onClose}
      >
        {content}
      </Link>
    );
  }

  if (item.type === 'scroll') {
    return (
      <button onClick={handleClick} className="w-full">
        {content}
      </button>
    );
  }

  return null;
};

// =====================================================
// MOBILE MENU COMPONENT
// =====================================================

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeaderConfig;
  navigation: NavigationItem[];
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  config,
  navigation
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { resolveColorValue: resolveColor } = useColorResolver();

  // Get menu configuration based on variant
  const getMenuConfig = () => {
    if (config.variant === 'hamburger') {
      return config.menu;
    }
    // Default mobile config for other variants
    return {
      style: config.mobile.menuStyle,
      backgroundColor: config.style.backgroundColor,
      textColor: config.style.textColor,
      textSize: 'lg' as const,
      textAlign: 'left' as const,
      animation: 'slide' as const,
      showSocialMedia: config.socialMedia.enabled,
      showCTA: config.mobile.showCTA
    };
  };

  const menuConfig = getMenuConfig();

  // Colors
  const bgColor = resolveColor(menuConfig.backgroundColor);
  const textColor = resolveColor(menuConfig.textColor);
  const activeColor = resolveColor(config.style.activeColor);
  const ctaBgColor = config.cta ? resolveColor(config.cta.style.backgroundColor) : '';
  const ctaTextColor = config.cta ? resolveColor(config.cta.style.textColor) : '';

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  // Animation duration
  const animationDuration = config.mobile.animationDuration;

  // Menu style variants
  const getMenuStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: bgColor,
      transition: `all ${animationDuration}ms ease-in-out`
    };

    switch (menuConfig.style) {
      case 'fullscreen':
        return {
          ...baseStyles,
          position: 'fixed',
          inset: 0,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          zIndex: 100
        };

      case 'slide-right':
        return {
          ...baseStyles,
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '320px',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          zIndex: 100
        };

      case 'slide-left':
        return {
          ...baseStyles,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '320px',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          zIndex: 100
        };

      case 'dropdown':
        return {
          ...baseStyles,
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: isOpen ? '80vh' : '0',
          overflow: 'hidden',
          zIndex: 100
        };

      default:
        return baseStyles;
    }
  };

  // Overlay for slide menus
  const showOverlay = menuConfig.style === 'slide-right' || menuConfig.style === 'slide-left';

  // CTA handler
  const handleCTAClick = () => {
    if (config.cta) {
      const action = config.cta.action;
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
      }
    }
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {showOverlay && (
        <div
          className={`
            fixed inset-0 bg-black/50 z-90
            transition-opacity duration-300
            ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
          `}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        style={getMenuStyles()}
      >
        {/* Header with close button (for fullscreen and slide) */}
        {(menuConfig.style === 'fullscreen' || menuConfig.style === 'slide-right' || menuConfig.style === 'slide-left') && (
          <div 
            className="flex items-center justify-between px-4"
            style={{ height: `${HEADER_HEIGHT_VALUES[config.style.height]}px` }}
          >
            {/* Logo or spacer */}
            <div className="flex-1">
              {config.mobile.showLogo && config.logo.type === 'text' && (
                <span 
                  className="text-xl font-bold"
                  style={{ color: textColor }}
                >
                  {config.logo.text}
                </span>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 transition-opacity hover:opacity-70"
              style={{ color: textColor }}
              aria-label="Menü schließen"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav 
          className={`
            px-6 py-4
            ${menuConfig.style === 'fullscreen' ? 'flex flex-col items-center justify-center min-h-[60vh]' : ''}
          `}
        >
          <div className={`
            space-y-2
            ${menuConfig.style === 'fullscreen' ? 'text-center' : ''}
          `}>
            {navigation.map((item) => (
              <MobileNavItem
                key={item.id}
                item={item}
                textColor={textColor}
                activeColor={activeColor}
                textSize={menuConfig.textSize}
                textAlign={menuConfig.textAlign}
                onClose={onClose}
              />
            ))}
          </div>
        </nav>

        {/* Footer: CTA + Social */}
        <div className={`
          px-6 py-8 mt-auto
          ${menuConfig.style === 'fullscreen' ? 'text-center' : ''}
        `}>
          {/* CTA Button */}
          {menuConfig.showCTA && config.cta?.enabled && (
            <button
              onClick={handleCTAClick}
              className="w-full py-3 px-6 font-medium rounded-lg transition-opacity hover:opacity-90 mb-6"
              style={{
                backgroundColor: ctaBgColor,
                color: ctaTextColor,
                borderRadius: config.cta ? BORDER_RADIUS_VALUES[config.cta.style.borderRadius] : '8px'
              }}
            >
              {config.cta.text}
            </button>
          )}

          {/* Social Media Icons */}
          {menuConfig.showSocialMedia && (
            <div className={`
              flex gap-4
              ${menuConfig.style === 'fullscreen' || menuConfig.textAlign === 'center' 
                ? 'justify-center' 
                : 'justify-start'
              }
            `}>
              <SocialIconsHeader 
                size="lg"
                color={textColor}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
