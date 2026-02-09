// =====================================================
// FOOTER MINIMAL COMPONENT
// Kompakter Footer mit Copyright, Legal Links, Social
// =====================================================

import React from 'react';
import { FooterMinimalConfig, FOOTER_PADDING_VALUES } from '../../types/Footer';
import { SocialIconsFooter } from './SocialIconsFooter';
import { useColorResolver } from '../../hooks/useColorResolver';

// =====================================================
// PROPS
// =====================================================

interface FooterMinimalProps {
  config: FooterMinimalConfig;
  isPreview?: boolean;
}

// =====================================================
// COMPONENT
// =====================================================

export const FooterMinimal: React.FC<FooterMinimalProps> = ({ config, isPreview = false }) => {
  const { resolveColorValue } = useColorResolver();
  const currentYear = new Date().getFullYear();

  const bgColor = resolveColorValue(config.style.backgroundColor);
  const textColor = resolveColorValue(config.style.textColor);
  const linkColor = resolveColorValue(config.style.linkColor);
  const dividerColor = resolveColorValue(config.style.dividerColor);

  // Build copyright text with year replacement
  const copyrightText = config.copyright.showYear
    ? config.copyright.text.replace('{year}', currentYear.toString())
    : config.copyright.text;

  // Alignment classes
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    'space-between': 'justify-between',
  };

  const isStacked = config.layout === 'stacked';

  return (
    <footer
      className={`w-full ${FOOTER_PADDING_VALUES[config.style.padding]}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      role="contentinfo"
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isPreview ? 'px-4' : ''}`}>
        {/* Main content */}
        <div
          className={`
            flex items-center gap-4
            ${isStacked
              ? 'flex-col text-center'
              : `flex-col md:flex-row ${alignmentClasses[config.alignment]}`
            }
          `}
        >
          {/* Logo (if enabled) */}
          {config.logo.enabled && (
            <div className="flex-shrink-0">
              {config.logo.type === 'image' && config.logo.imageUrl ? (
                <img
                  src={config.logo.imageUrl}
                  alt="Logo"
                  style={{ maxHeight: `${config.logo.maxHeight || 40}px` }}
                  className="h-auto"
                />
              ) : (
                <span
                  className="text-lg font-bold"
                  style={{ color: resolveColorValue(config.style.headingColor) as string }}
                >
                  {config.logo.text || 'Salon'}
                </span>
              )}
            </div>
          )}

          {/* Copyright */}
          <p className="text-sm opacity-80">{copyrightText}</p>

          {/* Legal Links */}
          {config.legal.links.length > 0 && (
            <nav aria-label="Rechtliche Links">
              <ul className="flex items-center gap-4 text-sm">
                {config.legal.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      className="hover:underline transition-colors"
                      style={{ color: linkColor }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Social Media */}
          {config.socialMedia.enabled && (
            <SocialIconsFooter
              size={config.socialMedia.size}
              variant={config.socialMedia.variant}
              color={linkColor}
            />
          )}
        </div>

        {/* Divider above (optional, for stacked with social) */}
        {isStacked && config.socialMedia.enabled && (
          <div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: dividerColor }}
          />
        )}
      </div>
    </footer>
  );
};

export default FooterMinimal;
