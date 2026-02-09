// =====================================================
// FOOTER FOUR-COLUMN COMPONENT
// Full-featured footer with configurable column layout
// =====================================================

import React from 'react';
import {
  FooterFourColumnConfig,
  FooterColumn,
  FooterLinksColumn,
  FooterTextColumn,
  FooterContactColumn,
  FOOTER_PADDING_VALUES,
  isLinksColumn,
  isTextColumn,
  isContactColumn,
  isHoursColumn,
} from '../../types/Footer';
import { SocialIconsFooter } from './SocialIconsFooter';
import { useWebsite } from '../../contexts/WebsiteContext';
import { useColorResolver } from '../../hooks/useColorResolver';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

// =====================================================
// PROPS
// =====================================================

interface FooterFourColumnProps {
  config: FooterFourColumnConfig;
  isPreview?: boolean;
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

/** Renders a text/about column (optionally with logo and social icons) */
const TextColumnContent: React.FC<{
  column: FooterTextColumn;
  config: FooterFourColumnConfig;
  headingColor: string;
  linkColor: string;
}> = ({ column, config, headingColor, linkColor }) => (
  <div>
    {/* Logo */}
    {column.showLogo && config.logo.enabled && (
      <div className="mb-4">
        {config.logo.type === 'image' && config.logo.imageUrl ? (
          <img
            src={config.logo.imageUrl}
            alt="Logo"
            style={{ maxHeight: `${config.logo.maxHeight || 40}px` }}
            className="h-auto"
          />
        ) : (
          <span className="text-xl font-bold" style={{ color: headingColor }}>
            {config.logo.text || 'Salon'}
          </span>
        )}
      </div>
    )}

    {/* Title */}
    {column.title && (
      <h3 className="font-semibold text-base mb-3" style={{ color: headingColor }}>
        {column.title}
      </h3>
    )}

    {/* Content (HTML) */}
    <div
      className="text-sm leading-relaxed opacity-80"
      dangerouslySetInnerHTML={{ __html: column.content }}
    />

    {/* Social Icons */}
    {column.showSocialMedia && config.socialMedia.enabled && (
      <div className="mt-4">
        <SocialIconsFooter
          size={config.socialMedia.size}
          variant={config.socialMedia.variant}
          color={linkColor}
        />
      </div>
    )}
  </div>
);

/** Renders a links column */
const LinksColumnContent: React.FC<{
  column: FooterLinksColumn;
  headingColor: string;
  linkColor: string;
}> = ({ column, headingColor, linkColor }) => (
  <div>
    <h3 className="font-semibold text-base mb-3" style={{ color: headingColor }}>
      {column.title}
    </h3>
    <ul className="space-y-2">
      {column.links.map((link) => (
        <li key={link.id}>
          <a
            href={link.url}
            className="text-sm hover:underline transition-colors opacity-80 hover:opacity-100"
            style={{ color: linkColor }}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

/** Renders a contact column */
const ContactColumnContent: React.FC<{
  column: FooterContactColumn;
  headingColor: string;
  linkColor: string;
}> = ({ column, headingColor, linkColor }) => {
  const { website } = useWebsite();
  const contact = website?.contact;

  if (!contact) return null;

  return (
    <div>
      <h3 className="font-semibold text-base mb-3" style={{ color: headingColor }}>
        {column.title}
      </h3>
      <div className="space-y-2 text-sm opacity-80">
        {column.showAddress && (contact.street || contact.city) && (
          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 flex-shrink-0 opacity-60" />
            <address className="not-italic">
              {contact.street && <span>{contact.street}<br /></span>}
              {(contact.postal_code || contact.city) && (
                <span>{contact.postal_code} {contact.city}</span>
              )}
            </address>
          </div>
        )}
        {column.showPhone && contact.phone && (
          <div className="flex items-center gap-2">
            <Phone size={16} className="flex-shrink-0 opacity-60" />
            <a
              href={`tel:${contact.phone}`}
              className="hover:underline"
              style={{ color: linkColor }}
            >
              {contact.phone}
            </a>
          </div>
        )}
        {column.showEmail && contact.email && (
          <div className="flex items-center gap-2">
            <Mail size={16} className="flex-shrink-0 opacity-60" />
            <a
              href={`mailto:${contact.email}`}
              className="hover:underline"
              style={{ color: linkColor }}
            >
              {contact.email}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

/** Renders an opening hours column */
const HoursColumnContent: React.FC<{
  headingColor: string;
  title: string;
}> = ({ headingColor, title }) => {
  const { website } = useWebsite();
  const businessHours = website?.business_hours;

  return (
    <div>
      <h3 className="font-semibold text-base mb-3" style={{ color: headingColor }}>
        {title}
      </h3>
      {businessHours && businessHours.length > 0 ? (
        <ul className="space-y-1 text-sm opacity-80">
          {businessHours.map((bh) => (
            <li key={bh.id} className="flex items-start gap-2">
              <Clock size={14} className="mt-0.5 flex-shrink-0 opacity-60" />
              <span>
                <span className="font-medium">{bh.day_name}:</span>{' '}
                {bh.is_open
                  ? `${bh.open_time}–${bh.close_time}${
                      bh.break_start && bh.break_end
                        ? ` (Pause: ${bh.break_start}–${bh.break_end})`
                        : ''
                    }`
                  : 'geschlossen'}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm opacity-60">Keine Öffnungszeiten hinterlegt.</p>
      )}
    </div>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export const FooterFourColumn: React.FC<FooterFourColumnProps> = ({ config, isPreview = false }) => {
  const { resolveColorValue } = useColorResolver();
  const currentYear = new Date().getFullYear();

  const bgColor = resolveColorValue(config.style.backgroundColor);
  const textColor = resolveColorValue(config.style.textColor);
  const linkColor = resolveColorValue(config.style.linkColor);
  const headingColor = resolveColorValue(config.style.headingColor);
  const dividerColor = resolveColorValue(config.style.dividerColor);

  // Copyright text with year replacement
  const copyrightText = config.copyright.showYear
    ? config.copyright.text.replace('{year}', currentYear.toString())
    : config.copyright.text;

  // Grid classes based on column layout
  const gridColsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const desktopCols = config.columnLayout.desktop as 1 | 2 | 3 | 4;
  const gridClass = gridColsClasses[desktopCols] || gridColsClasses[4];

  // Render a single column based on its type
  const renderColumn = (column: FooterColumn) => {
    if (isTextColumn(column)) {
      return (
        <TextColumnContent
          column={column}
          config={config}
          headingColor={headingColor}
          linkColor={linkColor}
        />
      );
    }

    if (isLinksColumn(column)) {
      return (
        <LinksColumnContent
          column={column}
          headingColor={headingColor}
          linkColor={linkColor}
        />
      );
    }

    if (isContactColumn(column)) {
      return (
        <ContactColumnContent
          column={column}
          headingColor={headingColor}
          linkColor={linkColor}
        />
      );
    }

    if (isHoursColumn(column)) {
      return (
        <HoursColumnContent
          headingColor={headingColor}
          title={column.title}
        />
      );
    }

    // Custom column: render raw HTML
    return (
      <div>
        {column.title && (
          <h3 className="font-semibold text-base mb-3" style={{ color: headingColor }}>
            {column.title}
          </h3>
        )}
        <div
          className="text-sm opacity-80"
          dangerouslySetInnerHTML={{ __html: (column as any).html || '' }}
        />
      </div>
    );
  };

  return (
    <footer
      style={{ backgroundColor: bgColor, color: textColor }}
      role="contentinfo"
    >
      {/* Main Footer Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${FOOTER_PADDING_VALUES[config.style.padding]} ${isPreview ? 'px-4' : ''}`}>
        <div className={`grid ${gridClass} gap-8`}>
          {config.columns.map((column) => (
            <div key={column.id}>{renderColumn(column)}</div>
          ))}
        </div>
      </div>

      {/* Bottom Bar (Copyright + Legal) */}
      <div
        className="border-t"
        style={{ borderColor: dividerColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-60">{copyrightText}</p>
          {config.legal.links.length > 0 && (
            <nav aria-label="Rechtliche Links">
              <ul className="flex items-center gap-4 text-sm">
                {config.legal.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      className="hover:underline opacity-60 hover:opacity-100 transition-opacity"
                      style={{ color: linkColor }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
};

export default FooterFourColumn;
