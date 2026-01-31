// =====================================================
// CARD TEAM COMPONENT
// Team-Mitglieder Karten mit voller Konfigurierbarkeit
// =====================================================

import React, { useMemo } from 'react';
import { 
  Instagram, Facebook, Linkedin, Twitter, Mail, Phone,
  type LucideIcon
} from 'lucide-react';
import {
  CardTeamConfig,
  TeamMember,
  BORDER_RADIUS_VALUES,
  SHADOW_VALUES,
  SPACING_VALUES,
  FONT_SIZE_VALUES,
  getResponsiveValue
} from '../../types/Cards';
import { ColorValue } from '../../types/theme';
import { Viewport } from '../../types/HeroV2';

// ===== HELPER: Color Value zu CSS =====

const useColorValue = (color: ColorValue): string => {
  // In einer echten Implementierung würde hier das Theme-System genutzt
  // Für jetzt: direkter HEX oder Fallback
  if (color.kind === 'custom') {
    return color.hex;
  }
  // Token-Referenz: vereinfachte Implementierung
  // TODO: Mit echtem Theme-System verbinden
  const tokenDefaults: Record<string, string> = {
    'semantic.cardBg': '#FFFFFF',
    'semantic.pageBg': '#F9FAFB',
    'semantic.headingText': '#111827',
    'semantic.bodyText': '#374151',
    'semantic.mutedText': '#6B7280',
    'semantic.border': '#E5E7EB',
    'semantic.buttonPrimaryBg': '#F43F5E',
    'semantic.buttonPrimaryText': '#FFFFFF'
  };
  return tokenDefaults[color.ref] || '#000000';
};

// ===== HELPER: Aspect Ratio CSS =====

const getAspectRatioStyle = (ratio: string): React.CSSProperties => {
  const ratios: Record<string, string> = {
    '1:1': '100%',
    '4:3': '75%',
    '3:2': '66.67%',
    '16:9': '56.25%',
    '2:1': '50%',
    'auto': 'auto'
  };
  
  if (ratio === 'auto') {
    return {};
  }
  
  return {
    paddingBottom: ratios[ratio] || '75%',
    height: 0,
    position: 'relative' as const
  };
};

// ===== HELPER: Hover Effect CSS =====

const getHoverEffectClass = (effect: string): string => {
  const effects: Record<string, string> = {
    none: '',
    lift: 'hover:-translate-y-1',
    glow: 'hover:ring-4 hover:ring-rose-100',
    scale: 'hover:scale-[1.02]',
    border: 'hover:border-rose-500'
  };
  return effects[effect] || '';
};

// ===== SOCIAL ICON MAPPING =====

const socialIcons: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
  phone: Phone
};

// ===== TEAM MEMBER CARD =====

interface TeamMemberCardProps {
  member: TeamMember;
  config: CardTeamConfig;
  viewport: Viewport;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, config }) => {
  const { cardStyle, imageStyle, textStyle, imagePosition } = config;
  
  // Colors
  const bgColor = useColorValue(cardStyle.backgroundColor);
  const borderColor = useColorValue(cardStyle.borderColor);
  const titleColor = useColorValue(textStyle.titleColor);
  const subtitleColor = useColorValue(textStyle.subtitleColor);
  const descriptionColor = useColorValue(textStyle.descriptionColor);
  const socialColor = useColorValue(config.socialIconColor);

  // Card styles
  const cardClasses = useMemo(() => {
    const hoverEffect = getHoverEffectClass(cardStyle.hoverEffect);
    return `
      transition-all overflow-hidden
      ${hoverEffect}
    `.trim();
  }, [cardStyle.hoverEffect]);

  const cardInlineStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    borderRadius: BORDER_RADIUS_VALUES[cardStyle.borderRadius],
    borderWidth: cardStyle.borderWidth,
    borderColor: borderColor,
    borderStyle: cardStyle.borderWidth > 0 ? 'solid' : 'none',
    boxShadow: SHADOW_VALUES[cardStyle.shadow],
    padding: SPACING_VALUES[cardStyle.padding],
    transitionDuration: `${cardStyle.transitionDuration}ms`
  };

  // Image component
  const renderImage = () => {
    if (!member.image) {
      // Placeholder
      return (
        <div 
          className="bg-gray-200 flex items-center justify-center text-gray-400"
          style={{
            borderRadius: BORDER_RADIUS_VALUES[imageStyle.borderRadius],
            ...getAspectRatioStyle(imageStyle.aspectRatio)
          }}
        >
          <span className="text-4xl font-bold absolute inset-0 flex items-center justify-center">
            {member.name.charAt(0)}
          </span>
        </div>
      );
    }

    return (
      <div 
        className="relative overflow-hidden"
        style={{
          borderRadius: BORDER_RADIUS_VALUES[imageStyle.borderRadius],
          ...getAspectRatioStyle(imageStyle.aspectRatio)
        }}
      >
        <img
          src={member.image}
          alt={member.name}
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: imageStyle.fit,
            borderRadius: BORDER_RADIUS_VALUES[imageStyle.borderRadius]
          }}
        />
        {imageStyle.overlay?.enabled && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: useColorValue(imageStyle.overlay.color),
              opacity: imageStyle.overlay.opacity / 100,
              borderRadius: BORDER_RADIUS_VALUES[imageStyle.borderRadius]
            }}
          />
        )}
      </div>
    );
  };

  // Social icons
  const renderSocialIcons = () => {
    if (!config.showSocialIcons || !member.socialLinks?.length) return null;

    const iconSizes = { sm: 16, md: 20, lg: 24 };
    const iconSize = iconSizes[config.socialIconSize];

    return (
      <div className="flex items-center justify-center gap-2 mt-3">
        {member.socialLinks.map((link, idx) => {
          const Icon = socialIcons[link.type];
          if (!Icon) return null;

          const getIconStyle = () => {
            switch (config.socialIconStyle) {
              case 'filled':
                return {
                  backgroundColor: socialColor,
                  color: '#FFFFFF',
                  padding: '8px',
                  borderRadius: '9999px'
                };
              case 'outline':
                return {
                  border: `2px solid ${socialColor}`,
                  color: socialColor,
                  padding: '6px',
                  borderRadius: '9999px'
                };
              default: // ghost
                return {
                  color: socialColor
                };
            }
          };

          return (
            <a
              key={idx}
              href={link.type === 'email' ? `mailto:${link.url}` : 
                    link.type === 'phone' ? `tel:${link.url}` : link.url}
              target={link.type !== 'email' && link.type !== 'phone' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center transition hover:opacity-70"
              style={getIconStyle()}
              aria-label={`${member.name} auf ${link.type}`}
            >
              <Icon size={iconSize} />
            </a>
          );
        })}
      </div>
    );
  };

  // Layout: Top Image
  if (imagePosition === 'top') {
    return (
      <article className={cardClasses} style={cardInlineStyle}>
        {/* Image */}
        <div className="mb-4">
          {renderImage()}
        </div>

        {/* Content */}
        <div style={{ textAlign: textStyle.titleAlign }}>
          <h3 
            className="font-semibold"
            style={{
              fontSize: FONT_SIZE_VALUES[textStyle.titleSize],
              fontWeight: textStyle.titleWeight,
              color: titleColor
            }}
          >
            {member.name}
          </h3>
          
          <p 
            className="mt-1"
            style={{
              fontSize: FONT_SIZE_VALUES[textStyle.subtitleSize],
              fontWeight: textStyle.subtitleWeight,
              color: subtitleColor
            }}
          >
            {member.role}
          </p>

          {member.description && (
            <p 
              className="mt-2"
              style={{
                fontSize: FONT_SIZE_VALUES[textStyle.descriptionSize],
                color: descriptionColor,
                ...(textStyle.descriptionLineClamp ? {
                  display: '-webkit-box',
                  WebkitLineClamp: textStyle.descriptionLineClamp,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden'
                } : {})
              }}
            >
              {member.description}
            </p>
          )}

          {renderSocialIcons()}
        </div>
      </article>
    );
  }

  // Layout: Left Image
  if (imagePosition === 'left') {
    return (
      <article className={`${cardClasses} flex gap-4`} style={cardInlineStyle}>
        {/* Image */}
        <div className="w-1/3 flex-shrink-0">
          {renderImage()}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 
            className="font-semibold"
            style={{
              fontSize: FONT_SIZE_VALUES[textStyle.titleSize],
              fontWeight: textStyle.titleWeight,
              color: titleColor
            }}
          >
            {member.name}
          </h3>
          
          <p 
            className="mt-1"
            style={{
              fontSize: FONT_SIZE_VALUES[textStyle.subtitleSize],
              fontWeight: textStyle.subtitleWeight,
              color: subtitleColor
            }}
          >
            {member.role}
          </p>

          {member.description && (
            <p 
              className="mt-2"
              style={{
                fontSize: FONT_SIZE_VALUES[textStyle.descriptionSize],
                color: descriptionColor
              }}
            >
              {member.description}
            </p>
          )}

          {renderSocialIcons()}
        </div>
      </article>
    );
  }

  // Layout: Background Image
  return (
    <article 
      className={`${cardClasses} relative overflow-hidden`} 
      style={{
        ...cardInlineStyle,
        minHeight: '300px',
        backgroundImage: member.image ? `url(${member.image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)'
        }}
      />

      {/* Content */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-4 text-white"
        style={{ textAlign: textStyle.titleAlign }}
      >
        <h3 
          className="font-semibold"
          style={{
            fontSize: FONT_SIZE_VALUES[textStyle.titleSize],
            fontWeight: textStyle.titleWeight
          }}
        >
          {member.name}
        </h3>
        
        <p 
          className="mt-1 opacity-80"
          style={{
            fontSize: FONT_SIZE_VALUES[textStyle.subtitleSize],
            fontWeight: textStyle.subtitleWeight
          }}
        >
          {member.role}
        </p>

        {config.showSocialIcons && member.socialLinks?.length && (
          <div className="flex items-center justify-center gap-2 mt-3">
            {member.socialLinks.map((link, idx) => {
              const Icon = socialIcons[link.type];
              if (!Icon) return null;
              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-70 transition"
                  aria-label={`${member.name} auf ${link.type}`}
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
};

// ===== MAIN COMPONENT =====

interface CardTeamProps {
  config?: CardTeamConfig;
  instanceId?: number;
}

export const CardTeam: React.FC<CardTeamProps> = ({ config: propConfig, instanceId }) => {
  const [currentViewport, setCurrentViewport] = React.useState<Viewport>('desktop');

  // Default config if none provided
  const config = propConfig || {
    members: [
      {
        id: '1',
        name: 'Maria Schmidt',
        role: 'Inhaberin & Stylistin',
        description: 'Mit über 15 Jahren Erfahrung sorgt Maria für perfekte Schnitte und Farben.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        socialLinks: [
          { type: 'instagram' as const, url: 'https://instagram.com' },
          { type: 'email' as const, url: 'maria@salon.de' }
        ],
        order: 1
      },
      {
        id: '2',
        name: 'Thomas Weber',
        role: 'Senior Stylist',
        description: 'Spezialist für moderne Herrenschnitte und Bartstyling.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        socialLinks: [
          { type: 'instagram' as const, url: 'https://instagram.com' }
        ],
        order: 2
      },
      {
        id: '3',
        name: 'Lisa Meyer',
        role: 'Coloristin',
        description: 'Expertin für Balayage, Highlights und kreative Farbkonzepte.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        socialLinks: [
          { type: 'facebook' as const, url: 'https://facebook.com' }
        ],
        order: 3
      }
    ],
    layout: 'grid' as const,
    grid: {
      columns: { desktop: 3, tablet: 2, mobile: 1 },
      gap: 'lg' as const,
      alignItems: 'stretch' as const
    },
    cardStyle: {
      backgroundColor: { kind: 'custom' as const, hex: '#FFFFFF' },
      borderRadius: 'xl' as const,
      borderWidth: 0 as const,
      borderColor: { kind: 'custom' as const, hex: '#E5E7EB' },
      shadow: 'md' as const,
      shadowHover: 'xl' as const,
      padding: 'lg' as const,
      transitionDuration: 200 as const,
      hoverEffect: 'lift' as const
    },
    imageStyle: {
      aspectRatio: '1:1' as const,
      fit: 'cover' as const,
      borderRadius: 'full' as const
    },
    imagePosition: 'top' as const,
    textStyle: {
      titleSize: 'xl' as const,
      titleWeight: 'semibold' as const,
      titleColor: { kind: 'custom' as const, hex: '#111827' },
      titleAlign: 'center' as const,
      subtitleSize: 'sm' as const,
      subtitleWeight: 'medium' as const,
      subtitleColor: { kind: 'custom' as const, hex: '#F43F5E' },
      descriptionSize: 'sm' as const,
      descriptionColor: { kind: 'custom' as const, hex: '#6B7280' },
      descriptionLineClamp: 3
    },
    showSocialIcons: true,
    socialIconStyle: 'ghost' as const,
    socialIconSize: 'md' as const,
    socialIconColor: { kind: 'custom' as const, hex: '#6B7280' },
    sectionStyle: {
      backgroundColor: { kind: 'custom' as const, hex: '#F9FAFB' },
      paddingY: 'xl' as const,
      paddingX: 'lg' as const,
      maxWidth: 'xl' as const,
      showHeader: true,
      headerAlign: 'center' as const,
      title: 'Unser Team',
      titleColor: { kind: 'custom' as const, hex: '#111827' },
      subtitle: 'Lernen Sie die Menschen kennen, die für Sie da sind',
      subtitleColor: { kind: 'custom' as const, hex: '#6B7280' }
    }
  };

  // Detect viewport
  React.useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentViewport('mobile');
      } else if (width < 1024) {
        setCurrentViewport('tablet');
      } else {
        setCurrentViewport('desktop');
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Colors
  const sectionBgColor = useColorValue(config.sectionStyle.backgroundColor);
  const titleColor = useColorValue(config.sectionStyle.titleColor);
  const subtitleColor = useColorValue(config.sectionStyle.subtitleColor);

  // Grid columns
  const columns = getResponsiveValue(config.grid.columns, currentViewport);

  // Sort members by order
  const sortedMembers = [...config.members].sort((a, b) => a.order - b.order);

  // Max width mapping
  const maxWidthClasses: Record<string, string> = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <section
      id={`card-team-${instanceId || 'default'}`}
      style={{
        backgroundColor: sectionBgColor,
        paddingTop: SPACING_VALUES[config.sectionStyle.paddingY],
        paddingBottom: SPACING_VALUES[config.sectionStyle.paddingY]
      }}
    >
      <div 
        className={`mx-auto px-4 ${maxWidthClasses[config.sectionStyle.maxWidth]}`}
        style={{
          paddingLeft: SPACING_VALUES[config.sectionStyle.paddingX],
          paddingRight: SPACING_VALUES[config.sectionStyle.paddingX]
        }}
      >
        {/* Section Header */}
        {config.sectionStyle.showHeader && (
          <div 
            className="mb-12"
            style={{ textAlign: config.sectionStyle.headerAlign }}
          >
            {config.sectionStyle.title && (
              <h2 
                className="text-3xl md:text-4xl font-bold"
                style={{ color: titleColor }}
              >
                {config.sectionStyle.title}
              </h2>
            )}
            {config.sectionStyle.subtitle && (
              <p 
                className="mt-3 text-lg"
                style={{ color: subtitleColor }}
              >
                {config.sectionStyle.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Grid Layout */}
        {config.layout === 'grid' && (
          <div 
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: SPACING_VALUES[config.grid.gap],
              alignItems: config.grid.alignItems
            }}
          >
            {sortedMembers.map(member => (
              <TeamMemberCard
                key={member.id}
                member={member}
                config={config}
                viewport={currentViewport}
              />
            ))}
          </div>
        )}

        {/* List Layout */}
        {config.layout === 'list' && (
          <div 
            className="space-y-4"
            style={{ gap: SPACING_VALUES[config.grid.gap] }}
          >
            {sortedMembers.map(member => (
              <TeamMemberCard
                key={member.id}
                member={member}
                config={{
                  ...config,
                  imagePosition: 'left' // List always uses left layout
                }}
                viewport={currentViewport}
              />
            ))}
          </div>
        )}

        {/* Carousel Layout - Placeholder */}
        {config.layout === 'carousel' && (
          <div className="relative">
            <div 
              className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ gap: SPACING_VALUES[config.grid.gap] }}
            >
              {sortedMembers.map(member => (
                <div 
                  key={member.id} 
                  className="flex-shrink-0 snap-center"
                  style={{ 
                    width: currentViewport === 'mobile' ? '85%' : 
                           currentViewport === 'tablet' ? '45%' : '30%' 
                  }}
                >
                  <TeamMemberCard
                    member={member}
                    config={config}
                    viewport={currentViewport}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CardTeam;
