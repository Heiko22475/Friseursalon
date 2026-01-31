// =====================================================
// CARD SERVICE COMPONENT
// Service/Dienstleistungs-Karten mit voller Konfigurierbarkeit
// =====================================================

import React, { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';

import {
  CardServiceConfig,
  ServiceItem,
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
  if (color.kind === 'custom') {
    return color.hex;
  }
  const tokenDefaults: Record<string, string> = {
    'semantic.cardBg': '#FFFFFF',
    'semantic.pageBg': '#F9FAFB',
    'semantic.headingText': '#111827',
    'semantic.bodyText': '#374151',
    'semantic.mutedText': '#6B7280',
    'semantic.border': '#E5E7EB',
    'semantic.buttonPrimaryBg': '#F43F5E',
    'semantic.buttonPrimaryText': '#FFFFFF',
    'semantic.success': '#10B981'
  };
  return tokenDefaults[color.ref] || '#000000';
};

// ===== HELPER: Aspect Ratio =====

const getAspectRatioStyle = (ratio: string): React.CSSProperties => {
  const ratios: Record<string, string> = {
    '1:1': '100%',
    '4:3': '75%',
    '3:2': '66.67%',
    '16:9': '56.25%',
    '2:1': '50%',
    'auto': 'auto'
  };
  
  if (ratio === 'auto') return {};
  
  return {
    paddingBottom: ratios[ratio] || '75%',
    height: 0,
    position: 'relative' as const
  };
};

// ===== HELPER: Hover Effect =====

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

// ===== DYNAMIC ICON =====

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 24, color, className }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <Icon size={size} color={color} className={className} />;
};

// ===== SERVICE CARD =====

interface ServiceCardProps {
  service: ServiceItem;
  config: CardServiceConfig;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, config }) => {
  const { cardStyle, imageStyle, textStyle, imagePosition } = config;

  // Colors
  const bgColor = useColorValue(cardStyle.backgroundColor);
  const borderColor = useColorValue(cardStyle.borderColor);
  const titleColor = useColorValue(textStyle.titleColor);
  const subtitleColor = useColorValue(textStyle.subtitleColor);
  const descriptionColor = useColorValue(textStyle.descriptionColor);
  const priceColor = useColorValue(config.priceStyle.color);
  const iconColor = useColorValue(config.iconColor);
  const featureIconColor = useColorValue(config.featureIconColor);
  const buttonBgColor = useColorValue(config.buttonStyle.backgroundColor);
  const buttonTextColor = useColorValue(config.buttonStyle.textColor);

  // Card styles
  const cardClasses = useMemo(() => {
    const hoverEffect = getHoverEffectClass(cardStyle.hoverEffect);
    return `transition-all overflow-hidden ${hoverEffect}`.trim();
  }, [cardStyle.hoverEffect]);

  const cardInlineStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    borderRadius: BORDER_RADIUS_VALUES[cardStyle.borderRadius],
    borderWidth: cardStyle.borderWidth,
    borderColor: borderColor,
    borderStyle: cardStyle.borderWidth > 0 ? 'solid' : 'none',
    boxShadow: SHADOW_VALUES[cardStyle.shadow],
    transitionDuration: `${cardStyle.transitionDuration}ms`
  };

  // Icon sizes
  const iconSizes = { sm: 24, md: 32, lg: 48, xl: 64 };

  // Price formatting
  const formatPrice = (price: number | undefined, priceUnit?: string) => {
    if (price === undefined) return null;
    const formatted = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
    
    return priceUnit ? `${priceUnit} ${formatted}` : formatted;
  };

  // Render image or icon
  const renderVisual = () => {
    if (imagePosition === 'none') return null;

    // Image
    if (service.image) {
      return (
        <div 
          className="relative overflow-hidden"
          style={{
            borderRadius: imagePosition === 'top' 
              ? `${BORDER_RADIUS_VALUES[cardStyle.borderRadius]} ${BORDER_RADIUS_VALUES[cardStyle.borderRadius]} 0 0`
              : BORDER_RADIUS_VALUES[imageStyle.borderRadius],
            ...getAspectRatioStyle(imageStyle.aspectRatio)
          }}
        >
          <img
            src={service.image}
            alt={service.title}
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: imageStyle.fit }}
          />
          {imageStyle.overlay?.enabled && (
            <div 
              className="absolute inset-0"
              style={{
                backgroundColor: useColorValue(imageStyle.overlay.color),
                opacity: imageStyle.overlay.opacity / 100
              }}
            />
          )}
          {/* Price Badge on Image */}
          {config.showPrice && config.priceStyle.position === 'top' && service.price && (
            <div 
              className="absolute top-3 right-3 px-3 py-1 rounded-full font-bold"
              style={{ 
                backgroundColor: bgColor,
                color: priceColor,
                fontSize: FONT_SIZE_VALUES[config.priceStyle.size]
              }}
            >
              {formatPrice(service.price)}
            </div>
          )}
        </div>
      );
    }

    // Icon fallback
    if (config.showIcon && service.icon) {
      const iconBgColor = config.iconBackgroundColor 
        ? useColorValue(config.iconBackgroundColor) 
        : 'transparent';

      return (
        <div 
          className="flex items-center justify-center mb-4"
          style={{ padding: SPACING_VALUES[cardStyle.padding] }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: iconSizes[config.iconSize] * 1.5,
              height: iconSizes[config.iconSize] * 1.5,
              backgroundColor: iconBgColor,
              borderRadius: BORDER_RADIUS_VALUES[config.iconBorderRadius]
            }}
          >
            <DynamicIcon 
              name={service.icon} 
              size={iconSizes[config.iconSize]} 
              color={iconColor}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  // Render button
  const renderButton = () => {
    if (!config.showCTA || !service.ctaText) return null;

    const buttonStyles: React.CSSProperties = {
      backgroundColor: config.buttonStyle.variant === 'filled' ? buttonBgColor : 'transparent',
      color: config.buttonStyle.variant === 'filled' ? buttonTextColor : buttonBgColor,
      borderRadius: BORDER_RADIUS_VALUES[config.buttonStyle.borderRadius],
      border: config.buttonStyle.variant === 'outline' ? `2px solid ${buttonBgColor}` : 'none',
      padding: config.buttonStyle.size === 'sm' ? '0.5rem 1rem' : 
               config.buttonStyle.size === 'lg' ? '0.875rem 1.75rem' : '0.625rem 1.25rem',
      fontSize: config.buttonStyle.size === 'sm' ? '0.875rem' : '1rem',
      width: config.buttonStyle.fullWidth ? '100%' : 'auto'
    };

    return (
      <button
        className="font-medium transition hover:opacity-80"
        style={buttonStyles}
        onClick={() => service.ctaUrl && window.open(service.ctaUrl, '_blank')}
      >
        {service.ctaText}
      </button>
    );
  };

  // Layout: Top Image
  if (imagePosition === 'top' || imagePosition === 'none') {
    return (
      <article className={cardClasses} style={cardInlineStyle}>
        {renderVisual()}
        
        <div style={{ padding: SPACING_VALUES[cardStyle.padding] }}>
          {/* Title & Price inline */}
          <div className="flex items-start justify-between gap-2">
            <h3 
              className="font-semibold"
              style={{
                fontSize: FONT_SIZE_VALUES[textStyle.titleSize],
                fontWeight: textStyle.titleWeight,
                color: titleColor
              }}
            >
              {service.title}
            </h3>
            
            {config.showPrice && config.priceStyle.position === 'title' && service.price && (
              <span 
                className="font-bold flex-shrink-0"
                style={{ 
                  color: priceColor,
                  fontSize: FONT_SIZE_VALUES[config.priceStyle.size]
                }}
              >
                {formatPrice(service.price)}
              </span>
            )}
          </div>

          {/* Duration */}
          {service.duration && (
            <p 
              className="mt-1"
              style={{
                fontSize: FONT_SIZE_VALUES[textStyle.subtitleSize],
                color: subtitleColor
              }}
            >
              {service.duration}
            </p>
          )}

          {/* Description */}
          {service.description && (
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
              {service.description}
            </p>
          )}

          {/* Features */}
          {config.showFeatures && service.features && service.features.length > 0 && (
            <ul className="mt-4 space-y-2">
              {service.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <DynamicIcon 
                    name={config.featureIcon} 
                    size={16} 
                    color={featureIconColor}
                  />
                  <span style={{ 
                    fontSize: FONT_SIZE_VALUES['sm'],
                    color: descriptionColor 
                  }}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Price bottom */}
          {config.showPrice && config.priceStyle.position === 'bottom' && service.price && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor }}>
              <span 
                className="font-bold"
                style={{ 
                  color: priceColor,
                  fontSize: FONT_SIZE_VALUES[config.priceStyle.size]
                }}
              >
                {formatPrice(service.price, service.priceUnit)}
              </span>
            </div>
          )}

          {/* Button */}
          {config.showCTA && service.ctaText && (
            <div className="mt-4">
              {renderButton()}
            </div>
          )}
        </div>
      </article>
    );
  }

  // Layout: Left Image
  if (imagePosition === 'left') {
    return (
      <article className={`${cardClasses} flex`} style={cardInlineStyle}>
        {service.image && (
          <div 
            className="w-1/3 flex-shrink-0 overflow-hidden"
            style={{
              borderRadius: `${BORDER_RADIUS_VALUES[cardStyle.borderRadius]} 0 0 ${BORDER_RADIUS_VALUES[cardStyle.borderRadius]}`
            }}
          >
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full"
              style={{ objectFit: imageStyle.fit }}
            />
          </div>
        )}
        
        <div 
          className="flex-1 flex flex-col"
          style={{ padding: SPACING_VALUES[cardStyle.padding] }}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 
              className="font-semibold"
              style={{
                fontSize: FONT_SIZE_VALUES[textStyle.titleSize],
                fontWeight: textStyle.titleWeight,
                color: titleColor
              }}
            >
              {service.title}
            </h3>
            
            {config.showPrice && service.price && (
              <span 
                className="font-bold"
                style={{ color: priceColor }}
              >
                {formatPrice(service.price)}
              </span>
            )}
          </div>

          {service.description && (
            <p 
              className="mt-2 flex-1"
              style={{
                fontSize: FONT_SIZE_VALUES[textStyle.descriptionSize],
                color: descriptionColor
              }}
            >
              {service.description}
            </p>
          )}

          {renderButton()}
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
        minHeight: '280px',
        backgroundImage: service.image ? `url(${service.image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%)'
        }}
      />

      <div 
        className="absolute bottom-0 left-0 right-0 text-white"
        style={{ padding: SPACING_VALUES[cardStyle.padding] }}
      >
        {config.showPrice && service.price && (
          <span className="text-lg font-bold mb-2 block" style={{ color: priceColor }}>
            {formatPrice(service.price, service.priceUnit)}
          </span>
        )}
        
        <h3 className="text-xl font-bold">{service.title}</h3>
        
        {service.description && (
          <p className="mt-2 text-white/80 text-sm">{service.description}</p>
        )}

        {renderButton()}
      </div>
    </article>
  );
};

// ===== MAIN COMPONENT =====

interface CardServiceProps {
  config?: CardServiceConfig;
  instanceId?: number;
}

export const CardService: React.FC<CardServiceProps> = ({ config: propConfig, instanceId }) => {
  const [currentViewport, setCurrentViewport] = React.useState<Viewport>('desktop');

  // Default config
  const config = propConfig || {
    services: [
      {
        id: '1',
        title: 'Haarschnitt Damen',
        description: 'Waschen, Schneiden, Föhnen - Ihr perfekter Look für jeden Anlass.',
        price: 45,
        duration: 'ca. 60 Min',
        icon: 'Scissors',
        features: ['Beratung inklusive', 'Premium-Produkte', 'Styling-Tipps'],
        ctaText: 'Termin buchen',
        ctaUrl: '/kontakt',
        order: 1
      },
      {
        id: '2',
        title: 'Haarschnitt Herren',
        description: 'Klassisch oder modern - wir finden den richtigen Schnitt für Sie.',
        price: 28,
        duration: 'ca. 30 Min',
        icon: 'User',
        features: ['Waschen inklusive', 'Augenbrauen auf Wunsch'],
        ctaText: 'Termin buchen',
        order: 2
      },
      {
        id: '3',
        title: 'Färben / Strähnen',
        description: 'Von natürlich bis gewagt - Farbe, die zu Ihnen passt.',
        price: 65,
        priceUnit: 'ab',
        duration: '1-3 Std',
        icon: 'Palette',
        features: ['Farbberatung', 'Pflege inklusive', 'Nachfärben günstiger'],
        ctaText: 'Mehr erfahren',
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
      aspectRatio: '16:9' as const,
      fit: 'cover' as const,
      borderRadius: 'lg' as const
    },
    imagePosition: 'none' as const,
    showIcon: true,
    iconSize: 'lg' as const,
    iconColor: { kind: 'custom' as const, hex: '#F43F5E' },
    iconBackgroundColor: { kind: 'custom' as const, hex: '#FEE2E2' },
    iconBorderRadius: 'xl' as const,
    textStyle: {
      titleSize: 'xl' as const,
      titleWeight: 'semibold' as const,
      titleColor: { kind: 'custom' as const, hex: '#111827' },
      titleAlign: 'left' as const,
      subtitleSize: 'sm' as const,
      subtitleWeight: 'medium' as const,
      subtitleColor: { kind: 'custom' as const, hex: '#6B7280' },
      descriptionSize: 'sm' as const,
      descriptionColor: { kind: 'custom' as const, hex: '#6B7280' },
      descriptionLineClamp: 3
    },
    showPrice: true,
    showDuration: true,
    priceStyle: {
      position: 'bottom' as const,
      size: '2xl' as const,
      weight: 'bold' as const,
      color: { kind: 'custom' as const, hex: '#F43F5E' },
      showBadge: false,
      badgeBackground: { kind: 'custom' as const, hex: '#FEE2E2' }
    },
    showFeatures: true,
    featureIcon: 'Check',
    featureIconColor: { kind: 'custom' as const, hex: '#10B981' },
    showCTA: true,
    buttonStyle: {
      variant: 'filled' as const,
      size: 'md' as const,
      borderRadius: 'lg' as const,
      backgroundColor: { kind: 'custom' as const, hex: '#F43F5E' },
      textColor: { kind: 'custom' as const, hex: '#FFFFFF' },
      borderColor: { kind: 'custom' as const, hex: '#F43F5E' },
      fullWidth: true
    },
    sectionStyle: {
      backgroundColor: { kind: 'custom' as const, hex: '#FFFFFF' },
      paddingY: 'xl' as const,
      paddingX: 'lg' as const,
      maxWidth: 'xl' as const,
      showHeader: true,
      headerAlign: 'center' as const,
      title: 'Unsere Leistungen',
      titleColor: { kind: 'custom' as const, hex: '#111827' },
      subtitle: 'Professionelle Haarpflege für jeden Anspruch',
      subtitleColor: { kind: 'custom' as const, hex: '#6B7280' }
    }
  };

  // Detect viewport
  React.useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      if (width < 768) setCurrentViewport('mobile');
      else if (width < 1024) setCurrentViewport('tablet');
      else setCurrentViewport('desktop');
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Colors
  const sectionBgColor = useColorValue(config.sectionStyle.backgroundColor);
  const titleColor = useColorValue(config.sectionStyle.titleColor);
  const subtitleColor = useColorValue(config.sectionStyle.subtitleColor);

  // Grid
  const columns = getResponsiveValue(config.grid.columns, currentViewport);

  // Sorted services
  const sortedServices = [...config.services].sort((a, b) => a.order - b.order);

  // Max width
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
      id={`card-service-${instanceId || 'default'}`}
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

        {/* Grid */}
        {config.layout === 'grid' && (
          <div 
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: SPACING_VALUES[config.grid.gap],
              alignItems: config.grid.alignItems
            }}
          >
            {sortedServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                config={config}
              />
            ))}
          </div>
        )}

        {/* List */}
        {config.layout === 'list' && (
          <div className="space-y-4">
            {sortedServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                config={{ ...config, imagePosition: 'left' }}
              />
            ))}
          </div>
        )}

        {/* Masonry - Simplified */}
        {config.layout === 'masonry' && (
          <div 
            className="columns-1 md:columns-2 lg:columns-3"
            style={{ gap: SPACING_VALUES[config.grid.gap] }}
          >
            {sortedServices.map(service => (
              <div key={service.id} className="break-inside-avoid mb-4">
                <ServiceCard
                  service={service}
                  config={config}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CardService;
