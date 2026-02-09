// =====================================================
// FOOTER BLOCK COMPONENT
// Universal footer wrapper that renders the correct variant
// Mirrors the HeaderBlock pattern
// =====================================================

import React from 'react';
import {
  FooterConfig,
  isMinimalFooter,
  isFourColumnFooter,
  createDefaultFooterFourColumnConfig,
} from '../../types/Footer';
import { FooterMinimal } from './FooterMinimal';
import { FooterFourColumn } from './FooterFourColumn';

// =====================================================
// PROPS
// =====================================================

interface FooterBlockProps {
  config?: FooterConfig;
  isPreview?: boolean;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export const FooterBlock: React.FC<FooterBlockProps> = ({
  config: propConfig,
  isPreview = false,
}) => {
  // Use provided config or fall back to default four-column
  const config = propConfig || createDefaultFooterFourColumnConfig();

  if (isMinimalFooter(config)) {
    return <FooterMinimal config={config} isPreview={isPreview} />;
  }

  if (isFourColumnFooter(config)) {
    return <FooterFourColumn config={config} isPreview={isPreview} />;
  }

  // Fallback: four-column
  return (
    <FooterFourColumn
      config={createDefaultFooterFourColumnConfig()}
      isPreview={isPreview}
    />
  );
};

// =====================================================
// EXPORTS
// =====================================================

export default FooterBlock;

// Re-export individual variants for direct use
export { FooterMinimal } from './FooterMinimal';
export { FooterFourColumn } from './FooterFourColumn';
export { SocialIconsFooter } from './SocialIconsFooter';
