// =====================================================
// GENERIC CARD COMPONENT
// Flexible Karten-Komponente für alle Anwendungsfälle
// =====================================================

import React, { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Star, Heart } from 'lucide-react';

import {
  GenericCardConfig,
  GenericCardItem,
  createDefaultGenericCardConfig,
} from '../../types/GenericCard';
import {
  BORDER_RADIUS_VALUES,
  SHADOW_VALUES,
  SPACING_VALUES,
  FONT_SIZE_VALUES,
  FONT_WEIGHT_VALUES,
  getResponsiveValue,
} from '../../types/Cards';
import { ColorValue } from '../../types/theme';
import { Viewport } from '../../types/Hero';
import { useViewport, getResponsiveFontSize } from '../../hooks/useViewport';

// ===== HELPER: Color Value zu CSS =====

const useColorValue = (color: ColorValue | undefined, defaultColor: string = 'transparent'): string => {
  if (!color) return defaultColor;
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
    'semantic.success': '#10B981',
  };
  return tokenDefaults[color.ref] || defaultColor;
};

// ===== HELPER: Aspect Ratio =====

const getAspectRatioStyle = (ratio: string): React.CSSProperties => {
  const ratios: Record<string, string> = {
    '1:1': '100%',
    '4:3': '75%',
    '3:2': '66.67%',
    '16:9': '56.25%',
    '2:1': '50%',
    'auto': 'auto',
  };

  if (ratio === 'auto') return {};

  return {
    paddingBottom: ratios[ratio] || '75%',
    height: 0,
    position: 'relative' as const,
  };
};

// ===== HELPER: Hover Effect =====

const getHoverEffectClass = (effect: string): string => {
  const effects: Record<string, string> = {
    none: '',
    lift: 'hover:-translate-y-1',
    glow: 'hover:ring-4 hover:ring-rose-100',
    scale: 'hover:scale-[1.02]',
    border: 'hover:border-rose-500',
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

// ===== RATING COMPONENT =====

interface RatingDisplayProps {
  rating: number;
  config: GenericCardConfig;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ rating, config }) => {
  const { ratingStyle } = config;
  if (!ratingStyle.enabled) return null;

  const filledColor = useColorValue(ratingStyle.filledColor);
  const emptyColor = useColorValue(ratingStyle.emptyColor);

  const sizes = { sm: 14, md: 18, lg: 22 };
  const size = sizes[ratingStyle.size];

  const renderIcon = (filled: boolean, index: number) => {
    const color = filled ? filledColor : emptyColor;
    if (ratingStyle.style === 'hearts') {
      return <Heart key={index} size={size} fill={filled ? color : 'none'} color={color} />;
    }
    return <Star key={index} size={size} fill={filled ? color : 'none'} color={color} />;
  };

  if (ratingStyle.style === 'numbers') {
    return (
      <span
        className="font-bold"
        style={{ color: filledColor, fontSize: FONT_SIZE_VALUES[ratingStyle.size === 'sm' ? 'sm' : ratingStyle.size === 'md' ? 'base' : 'lg'] }}
      >
        {rating.toFixed(1)}/5
      </span>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => renderIcon(i <= Math.round(rating), i))}
    </div>
  );
};

// ===== FEATURES COMPONENT =====

interface FeaturesDisplayProps {
  features: string[];
  config: GenericCardConfig;
}

const FeaturesDisplay: React.FC<FeaturesDisplayProps> = ({ features, config }) => {
  const { featuresStyle } = config;
  if (!featuresStyle.enabled || !features.length) return null;

  const iconColor = useColorValue(featuresStyle.iconColor);
  const textColor = useColorValue(featuresStyle.textColor);
  const displayFeatures = featuresStyle.maxItems ? features.slice(0, featuresStyle.maxItems) : features;

  const layoutClass = {
    list: 'flex flex-col gap-1',
    inline: 'flex flex-wrap gap-2',
    grid: 'grid grid-cols-2 gap-1',
  }[featuresStyle.layout];

  return (
    <ul className={layoutClass}>
      {displayFeatures.map((feature, i) => (
        <li key={i} className="flex items-center gap-2">
          <DynamicIcon name={featuresStyle.icon} size={14} color={iconColor} />
          <span style={{ color: textColor, fontSize: FONT_SIZE_VALUES[featuresStyle.textSize] }}>
            {feature}
          </span>
        </li>
      ))}
    </ul>
  );
};

// ===== SOCIAL LINKS COMPONENT =====

interface SocialLinksDisplayProps {
  links: GenericCardItem['socialLinks'];
  config: GenericCardConfig;
}

const SocialLinksDisplay: React.FC<SocialLinksDisplayProps> = ({ links, config }) => {
  const { socialStyle } = config;
  if (!socialStyle.enabled || !links?.length) return null;

  const iconColor = useColorValue(socialStyle.iconColor);
  const sizes = { sm: 16, md: 20, lg: 24 };
  const size = sizes[socialStyle.iconSize];

  const iconMap: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    linkedin: 'Linkedin',
    twitter: 'Twitter',
    email: 'Mail',
    phone: 'Phone',
    website: 'Globe',
  };

  return (
    <div
      className={`flex ${socialStyle.layout === 'column' ? 'flex-col' : 'flex-row'} items-center`}
      style={{ gap: SPACING_VALUES[socialStyle.gap] }}
    >
      {links.map((link, i) => (
        <a
          key={i}
          href={link.type === 'email' ? `mailto:${link.url}` : link.type === 'phone' ? `tel:${link.url}` : link.url}
          target={['email', 'phone'].includes(link.type) ? undefined : '_blank'}
          rel="noopener noreferrer"
          className="p-2 rounded-full transition hover:opacity-80"
          style={{
            backgroundColor: socialStyle.iconStyle === 'filled' ? iconColor : 'transparent',
            border: socialStyle.iconStyle === 'outline' ? `1px solid ${iconColor}` : 'none',
          }}
        >
          <DynamicIcon
            name={iconMap[link.type] || 'Link'}
            size={size}
            color={socialStyle.iconStyle === 'filled' ? '#FFFFFF' : iconColor}
          />
        </a>
      ))}
    </div>
  );
};

// ===== SINGLE CARD =====

interface SingleCardProps {
  item: GenericCardItem;
  config: GenericCardConfig;
}

const SingleCard: React.FC<SingleCardProps> = ({ item, config }) => {
  const { cardStyle, imageStyle, textStyle, iconStyle, priceStyle, cardLayoutVariant, showImage, showSubtitle, showDescription, showButton, buttonStyle } = config;

  // Get current viewport
  const viewport = useViewport();

  // Colors
  const bgColor = useColorValue(cardStyle.backgroundColor);
  const borderColor = useColorValue(cardStyle.borderColor);
  const titleColor = useColorValue(textStyle.titleColor);
  const subtitleColor = useColorValue(textStyle.subtitleColor);
  const descriptionColor = useColorValue(textStyle.descriptionColor);
  const buttonBgColor = useColorValue(buttonStyle.backgroundColor);
  const buttonTextColor = useColorValue(buttonStyle.textColor);
  const buttonBorderColor = useColorValue(buttonStyle.borderColor);
  const iconColor = useColorValue(iconStyle.color);
  const priceColor = useColorValue(priceStyle.color);

  // Responsive font sizes
  const overlineFontSize = getResponsiveFontSize(config.overlineStyle?.fontSize, viewport, 12);
  const titleFontSize = getResponsiveFontSize(config.titleStyle?.fontSize, viewport, 24);
  const subtitleFontSize = getResponsiveFontSize(config.subtitleStyle?.fontSize, viewport, 16);
  const descriptionFontSize = getResponsiveFontSize(config.descriptionStyle?.fontSize, viewport, 14);

  // Icon Background
  const iconBgColor = iconStyle.backgroundEnabled && iconStyle.backgroundColor
    ? useColorValue(iconStyle.backgroundColor)
    : 'transparent';

  // Card styles
  const cardStyles: React.CSSProperties = {
    backgroundColor: bgColor,
    borderRadius: BORDER_RADIUS_VALUES[cardStyle.borderRadius],
    borderWidth: cardStyle.borderWidth,
    borderColor: borderColor,
    borderStyle: cardStyle.borderWidth > 0 ? 'solid' : 'none',
    boxShadow: SHADOW_VALUES[cardStyle.shadow],
    padding: SPACING_VALUES[cardStyle.padding],
    transition: `all ${cardStyle.transitionDuration}ms ease`,
  };

  // Icon size mapping
  const iconSizes = { sm: 20, md: 28, lg: 36, xl: 48, '2xl': 64 };

  // Render Media (Image or Icon)
  const renderMedia = () => {
    if (item.image && showImage) {
      const imagePadding = config.imageElementStyle?.padding ?? 0;
      const hasNoPadding = imagePadding === 0;
      
      // When padding is 0, use card's border-radius for top corners
      // When padding > 0, use image's own border-radius
      const borderRadiusValue = hasNoPadding 
        ? BORDER_RADIUS_VALUES[cardStyle.borderRadius]
        : BORDER_RADIUS_VALUES[imageStyle.borderRadius];
      
      return (
        <div
          style={{
            padding: `${imagePadding}px`,
            marginBottom: imagePadding === 0 
              ? undefined 
              : `${config.imageElementStyle?.marginBottom ?? 16}px`,
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              ...getAspectRatioStyle(imageStyle.aspectRatio),
              borderRadius: hasNoPadding 
                ? `${borderRadiusValue} ${borderRadiusValue} 0 0`
                : borderRadiusValue,
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: imageStyle.fit }}
            />
          </div>
        </div>
      );
    }

    if (item.icon && iconStyle.enabled) {
      const bgShapeClass = {
        circle: 'rounded-full',
        square: 'rounded-none',
        rounded: 'rounded-lg',
      }[iconStyle.backgroundShape];

      return (
        <div
          className={`inline-flex items-center justify-center ${iconStyle.backgroundEnabled ? bgShapeClass : ''}`}
          style={{
            backgroundColor: iconBgColor,
            padding: iconStyle.backgroundEnabled ? SPACING_VALUES[iconStyle.backgroundPadding] : 0,
          }}
        >
          <DynamicIcon name={item.icon} size={iconSizes[iconStyle.size]} color={iconColor} />
        </div>
      );
    }

    return null;
  };

  // Render Price
  const renderPrice = () => {
    if (!priceStyle.enabled || item.price === undefined) return null;

    const priceContent = (
      <div className="flex items-baseline gap-2">
        {item.originalPrice && priceStyle.showOriginalPrice && (
          <span
            className="line-through"
            style={{
              color: useColorValue(priceStyle.originalPriceColor),
              fontSize: FONT_SIZE_VALUES[priceStyle.size],
            }}
          >
            {item.originalPrice}€
          </span>
        )}
        <span
          style={{
            color: priceColor,
            fontSize: FONT_SIZE_VALUES[priceStyle.size],
            fontWeight: FONT_WEIGHT_VALUES[priceStyle.weight],
          }}
        >
          {priceStyle.showBadge && priceStyle.badgeText ? priceStyle.badgeText + ' ' : ''}
          {item.priceUnit || ''}{item.price}€
        </span>
      </div>
    );

    if (priceStyle.position === 'top-right') {
      return (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow">
          {priceContent}
        </div>
      );
    }

    return priceContent;
  };

  // Layout variants
  const isHorizontal = cardLayoutVariant === 'horizontal';
  const isOverlay = cardLayoutVariant === 'overlay';

  if (isOverlay && item.image) {
    return (
      <div
        className={`relative overflow-hidden group ${getHoverEffectClass(cardStyle.hoverEffect)}`}
        style={cardStyles}
      >
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-64 object-cover"
          style={{ borderRadius: BORDER_RADIUS_VALUES[cardStyle.borderRadius] }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4"
          style={{ borderRadius: BORDER_RADIUS_VALUES[cardStyle.borderRadius] }}
        >
          <h3 style={{ color: '#FFFFFF', fontSize: FONT_SIZE_VALUES[textStyle.titleSize], fontWeight: FONT_WEIGHT_VALUES[textStyle.titleWeight] }}>
            {item.title}
          </h3>
          {item.subtitle && showSubtitle && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE_VALUES[textStyle.subtitleSize] }}>
              {item.subtitle}
            </p>
          )}
          {priceStyle.enabled && item.price !== undefined && renderPrice()}
        </div>
      </div>
    );
  }

  // Calculate card padding for negative margin
  const cardPaddingValue = SPACING_VALUES[cardStyle.padding];
  const imagePadding = config.imageElementStyle?.padding ?? 0;

  return (
    <div
      className={`relative ${getHoverEffectClass(cardStyle.hoverEffect)} ${isHorizontal ? 'flex gap-4' : ''}`}
      style={cardStyles}
    >
      {/* Price Badge (top-right) */}
      {priceStyle.position === 'top-right' && renderPrice()}

      {/* Media */}
      {cardLayoutVariant !== 'minimal' && (
        <div 
          className={isHorizontal ? 'w-1/3 flex-shrink-0' : ''}
          style={{
            // When imagePadding is 0: full negative margin to edges
            // When imagePadding > 0: calculate margin to achieve exact pixel distance
            margin: imagePadding === 0 
              ? `-${cardPaddingValue} -${cardPaddingValue} ${config.imageElementStyle?.marginBottom ?? 16}px -${cardPaddingValue}`
              : `calc(-${cardPaddingValue} + ${imagePadding}px) calc(-${cardPaddingValue} + ${imagePadding}px) ${config.imageElementStyle?.marginBottom ?? 16}px calc(-${cardPaddingValue} + ${imagePadding}px)`,
          }}
        >
          {renderMedia()}
        </div>
      )}

      {/* Content */}
      <div className={`flex flex-col gap-2 ${isHorizontal ? 'flex-1' : ''}`} style={{ textAlign: textStyle.titleAlign }}>
        {/* Overline */}
        {item.overline && config.overlineStyle?.enabled && (
          <p
            style={{
              color: useColorValue(config.overlineStyle?.color),
              fontSize: `${overlineFontSize}px`,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: `${config.overlineStyle?.marginBottom ?? 8}px`,
              fontFamily: config.overlineStyle?.font || config.typography?.bodyFont || 'inherit',
            }}
          >
            {item.overline}
          </p>
        )}

        {/* Title */}
        <h3
          style={{
            color: titleColor,
            fontSize: `${titleFontSize}px`,
            fontWeight: FONT_WEIGHT_VALUES[textStyle.titleWeight],
            marginBottom: `${config.titleStyle?.marginBottom ?? 8}px`,
            fontFamily: config.titleStyle?.font || config.typography?.titleFont || 'inherit',
          }}
        >
          {item.title}
        </h3>

        {/* Subtitle */}
        {item.subtitle && showSubtitle && (
          <p
            style={{
              color: subtitleColor,
              fontSize: `${subtitleFontSize}px`,
              fontWeight: FONT_WEIGHT_VALUES[textStyle.subtitleWeight],
              marginBottom: `${config.subtitleStyle?.marginBottom ?? 12}px`,
            }}
          >
            {item.subtitle}
          </p>
        )}

        {/* Price (below title) */}
        {priceStyle.position === 'below-title' && renderPrice()}

        {/* Rating */}
        {item.rating && <RatingDisplay rating={item.rating} config={config} />}

        {/* Description */}
        {item.description && showDescription && (
          <div
            className={config.descriptionLineClamp ? `line-clamp-${config.descriptionLineClamp}` : ''}
            style={{
              color: descriptionColor,
              fontSize: `${descriptionFontSize}px`,
              marginBottom: `${config.descriptionStyle?.marginBottom ?? 16}px`,
              fontFamily: config.descriptionStyle?.font || config.typography?.bodyFont || 'inherit',
            }}
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        )}

        {/* Features */}
        {item.features && <FeaturesDisplay features={item.features} config={config} />}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs rounded-full"
                style={{
                  backgroundColor: `${buttonBgColor}20`,
                  color: buttonBgColor,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price (bottom) */}
        {priceStyle.position === 'bottom' && priceStyle.enabled && item.price !== undefined && (
          <div className="mt-auto pt-2">{renderPrice()}</div>
        )}

        {/* Social Links */}
        {item.socialLinks && <SocialLinksDisplay links={item.socialLinks} config={config} />}

        {/* CTA Button */}
        {showButton && item.ctaText && item.ctaUrl && (
          <a
            href={item.ctaUrl}
            className={`inline-flex items-center justify-center transition mt-2 ${buttonStyle.fullWidth ? 'w-full' : ''}`}
            style={{
              backgroundColor: buttonStyle.variant === 'filled' ? buttonBgColor : 'transparent',
              color: buttonStyle.variant === 'filled' ? buttonTextColor : buttonBgColor,
              borderRadius: BORDER_RADIUS_VALUES[buttonStyle.borderRadius],
              border: buttonStyle.variant === 'outline' ? `2px solid ${buttonBorderColor}` : 'none',
              padding: `${SPACING_VALUES[buttonStyle.size === 'sm' ? 'xs' : buttonStyle.size === 'md' ? 'sm' : 'md']} ${SPACING_VALUES[buttonStyle.size === 'sm' ? 'sm' : buttonStyle.size === 'md' ? 'md' : 'lg']}`,
              fontSize: FONT_SIZE_VALUES[buttonStyle.size === 'sm' ? 'sm' : buttonStyle.size === 'md' ? 'base' : 'lg'],
            }}
          >
            {item.ctaText}
          </a>
        )}
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====

interface GenericCardProps {
  config?: GenericCardConfig;
  instanceId?: number;
}

export const GenericCard: React.FC<GenericCardProps> = ({ config: propConfig, instanceId }) => {
  const config = propConfig || createDefaultGenericCardConfig();

  const { items, sectionStyle, grid, layout } = config;

  // Section colors
  const sectionBgColor = useColorValue(sectionStyle.backgroundColor);
  const titleColor = useColorValue(sectionStyle.titleColor);
  const subtitleColor = useColorValue(sectionStyle.subtitleColor);

  // Sort items by order
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.order - b.order);
  }, [items]);

  // Grid columns
  const getGridColumns = (): string => {
    const viewport: Viewport = 'desktop';
    const cols = getResponsiveValue(grid.columns, viewport);
    return `repeat(${cols}, minmax(0, 1fr))`;
  };

  // Max width mapping
  const maxWidths: Record<string, string> = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  };

  if (sortedItems.length === 0) {
    return (
      <section
        id={`generic-card-${instanceId || 'default'}`}
        className="py-16"
        style={{ backgroundColor: sectionBgColor }}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500">Keine Karten vorhanden. Fügen Sie Karten im Editor hinzu.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id={`generic-card-${instanceId || 'default'}`}
      style={{
        backgroundColor: sectionBgColor,
        paddingTop: SPACING_VALUES[sectionStyle.paddingY],
        paddingBottom: SPACING_VALUES[sectionStyle.paddingY],
        paddingLeft: SPACING_VALUES[sectionStyle.paddingX],
        paddingRight: SPACING_VALUES[sectionStyle.paddingX],
      }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: maxWidths[sectionStyle.maxWidth] }}
      >
        {/* Section Header */}
        {sectionStyle.showHeader && (
          <div className={`mb-12 text-${sectionStyle.headerAlign}`}>
            {sectionStyle.title && (
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: titleColor }}
              >
                {sectionStyle.title}
              </h2>
            )}
            {sectionStyle.subtitle && (
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: subtitleColor }}
              >
                {sectionStyle.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Cards Grid/List */}
        <div
          className="mx-auto"
          style={{ maxWidth: grid.maxWidth || '1200px' }}
        >
          <div
            className={layout === 'list' ? 'flex flex-col' : 'grid'}
            style={{
              gridTemplateColumns: layout !== 'list' ? getGridColumns() : undefined,
              gap: SPACING_VALUES[grid.gap],
              alignItems: grid.alignItems,
            }}
          >
            {sortedItems.map((item) => (
              <SingleCard key={item.id} item={item} config={config} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenericCard;
