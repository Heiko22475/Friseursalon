// =====================================================
// HEADER BLOCK COMPONENT
// Universeller Header-Wrapper der die richtige Variante rendert
// =====================================================

import React from 'react';
import {
  HeaderConfig,
  HeaderClassicConfig,
  HeaderCenteredConfig,
  HeaderHamburgerConfig,
  createDefaultHeaderClassicConfig
} from '../../types/Header';
import { HeaderClassic } from './HeaderClassic';
import { HeaderCentered } from './HeaderCentered';
import { HeaderHamburger } from './HeaderHamburger';

// =====================================================
// PROPS
// =====================================================

interface HeaderBlockProps {
  config?: HeaderConfig;
  isPreview?: boolean;
}

// =====================================================
// TYPE GUARDS
// =====================================================

function isClassicConfig(config: HeaderConfig): config is HeaderClassicConfig {
  return config.variant === 'classic';
}

function isCenteredConfig(config: HeaderConfig): config is HeaderCenteredConfig {
  return config.variant === 'centered';
}

function isHamburgerConfig(config: HeaderConfig): config is HeaderHamburgerConfig {
  return config.variant === 'hamburger';
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export const HeaderBlock: React.FC<HeaderBlockProps> = ({ 
  config: propConfig,
  isPreview = false 
}) => {
  // Get config from props or use default
  // Note: Header config should be stored in websiteRecord.content when implemented
  const config = propConfig || createDefaultHeaderClassicConfig();

  // Render the appropriate variant
  if (isClassicConfig(config)) {
    return <HeaderClassic config={config} isPreview={isPreview} />;
  }

  if (isCenteredConfig(config)) {
    return <HeaderCentered config={config} isPreview={isPreview} />;
  }

  if (isHamburgerConfig(config)) {
    return <HeaderHamburger config={config} isPreview={isPreview} />;
  }

  // Fallback to classic
  return <HeaderClassic config={createDefaultHeaderClassicConfig()} isPreview={isPreview} />;
};

// =====================================================
// EXPORTS
// =====================================================

export default HeaderBlock;

// Re-export individual variants for direct use
export { HeaderClassic } from './HeaderClassic';
export { HeaderCentered } from './HeaderCentered';
export { HeaderHamburger } from './HeaderHamburger';
export { MobileMenu } from './MobileMenu';
export { SocialIconsHeader } from './SocialIconsHeader';
