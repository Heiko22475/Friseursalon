// =====================================================
// CARD TESTIMONIAL COMPONENT
// Kundenbewertungs-Karten mit voller Konfigurierbarkeit
// =====================================================

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CardTestimonialConfig,
  TestimonialItem,
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
    'semantic.buttonPrimaryText': '#FFFFFF'
  };
  return tokenDefaults[color.ref] || '#000000';
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

// ===== SOURCE BADGES =====

interface SourceBadgeProps {
  source: TestimonialItem['source'];
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  if (!source || source === 'custom') return null;

  const badges: Record<string, { bg: string; text: string; label: string }> = {
    google: { bg: '#4285F4', text: '#FFFFFF', label: 'Google' },
    facebook: { bg: '#1877F2', text: '#FFFFFF', label: 'Facebook' },
    yelp: { bg: '#D32323', text: '#FFFFFF', label: 'Yelp' }
  };

  const badge = badges[source];
  if (!badge) return null;

  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: badge.bg, color: badge.text }}
    >
      {badge.label}
    </span>
  );
};

// ===== STAR RATING =====

interface StarRatingProps {
  rating: number;
  style: 'stars' | 'numbers' | 'both';
  starColor: string;
  emptyColor: string;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, style, starColor, emptyColor, size = 16 
}) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  if (style === 'numbers') {
    return (
      <span className="font-bold" style={{ color: starColor }}>
        {rating.toFixed(1)} / 5
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} size={size} fill={starColor} color={starColor} />
      ))}
      
      {/* Half star */}
      {hasHalf && (
        <div className="relative">
          <Star size={size} fill={emptyColor} color={emptyColor} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star size={size} fill={starColor} color={starColor} />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} size={size} fill={emptyColor} color={emptyColor} />
      ))}

      {style === 'both' && (
        <span className="ml-2 text-sm font-medium" style={{ color: starColor }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// ===== TESTIMONIAL CARD =====

interface TestimonialCardProps {
  testimonial: TestimonialItem;
  config: CardTestimonialConfig;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, config }) => {
  const { cardStyle } = config;

  // Colors
  const bgColor = useColorValue(cardStyle.backgroundColor);
  const borderColor = useColorValue(cardStyle.borderColor);
  const quoteColor = useColorValue(config.quoteColor);
  const quoteIconColor = useColorValue(config.quoteIconColor);
  const authorNameColor = useColorValue(config.authorNameColor);
  const authorRoleColor = useColorValue(config.authorRoleColor);
  const ratingColor = useColorValue(config.ratingColor);
  const ratingEmptyColor = useColorValue(config.ratingEmptyColor);

  // Card styles
  const cardClasses = useMemo(() => {
    const hoverEffect = getHoverEffectClass(cardStyle.hoverEffect);
    return `transition-all h-full flex flex-col ${hoverEffect}`.trim();
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

  // Quote icon
  const renderQuoteIcon = () => {
    if (config.quoteStyle === 'simple') return null;
    
    return (
      <Quote 
        size={config.quoteStyle === 'highlighted' ? 48 : 32}
        className={config.quoteStyle === 'highlighted' ? 'opacity-20' : 'mb-4'}
        color={quoteIconColor}
        style={config.quoteStyle === 'highlighted' ? {
          position: 'absolute',
          top: SPACING_VALUES[cardStyle.padding],
          left: SPACING_VALUES[cardStyle.padding]
        } : undefined}
      />
    );
  };

  // Author image
  const imageSizes = { sm: 40, md: 56, lg: 72 };
  const imageSize = imageSizes[config.authorImageSize];

  // Author layout
  const renderAuthor = () => {
    const authorImage = config.showAuthorImage && testimonial.image && (
      <img
        src={testimonial.image}
        alt={testimonial.author}
        className="flex-shrink-0 object-cover"
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: BORDER_RADIUS_VALUES[config.authorImageBorderRadius]
        }}
      />
    );

    const authorInfo = (
      <div className={config.authorLayout === 'stacked' ? 'text-center' : ''}>
        <p 
          className="font-semibold"
          style={{
            fontSize: FONT_SIZE_VALUES[config.authorNameSize],
            color: authorNameColor
          }}
        >
          {testimonial.author}
        </p>
        {(testimonial.role || testimonial.company) && (
          <p 
            style={{
              fontSize: FONT_SIZE_VALUES[config.authorRoleSize],
              color: authorRoleColor
            }}
          >
            {[testimonial.role, testimonial.company].filter(Boolean).join(' • ')}
          </p>
        )}
      </div>
    );

    if (config.authorLayout === 'stacked') {
      return (
        <div className="flex flex-col items-center gap-3 mt-auto pt-4">
          {authorImage}
          {authorInfo}
          {config.showSource && testimonial.source && (
            <SourceBadge source={testimonial.source} />
          )}
        </div>
      );
    }

    if (config.authorLayout === 'left-aligned') {
      return (
        <div className="flex items-start gap-3 mt-auto pt-4">
          {authorImage}
          <div>
            {authorInfo}
            {config.showSource && testimonial.source && (
              <div className="mt-1">
                <SourceBadge source={testimonial.source} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // Inline (default)
    return (
      <div className="flex items-center gap-3 mt-auto pt-4">
        {authorImage}
        <div className="flex-1">
          {authorInfo}
        </div>
        {config.showSource && testimonial.source && (
          <SourceBadge source={testimonial.source} />
        )}
      </div>
    );
  };

  return (
    <article 
      className={cardClasses} 
      style={{
        ...cardInlineStyle,
        position: config.quoteStyle === 'highlighted' ? 'relative' : undefined
      }}
    >
      {/* Quote Icon */}
      {renderQuoteIcon()}

      {/* Rating */}
      {config.showRating && testimonial.rating && (
        <div className={`mb-3 ${config.quoteStyle === 'highlighted' ? 'ml-12' : ''}`}>
          <StarRating
            rating={testimonial.rating}
            style={config.ratingStyle}
            starColor={ratingColor}
            emptyColor={ratingEmptyColor}
          />
        </div>
      )}

      {/* Quote */}
      <blockquote 
        className={`flex-1 ${config.quoteStyle === 'highlighted' ? 'ml-12' : ''}`}
        style={{
          fontSize: FONT_SIZE_VALUES[config.quoteSize],
          color: quoteColor,
          fontStyle: config.quoteItalic ? 'italic' : 'normal',
          lineHeight: 1.6
        }}
      >
        "{testimonial.quote}"
      </blockquote>

      {/* Date */}
      {testimonial.date && (
        <p 
          className="text-sm mt-2 opacity-60"
          style={{ color: authorRoleColor }}
        >
          {new Date(testimonial.date).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long'
          })}
        </p>
      )}

      {/* Author */}
      {renderAuthor()}
    </article>
  );
};

// ===== CAROUSEL COMPONENT =====

interface CarouselProps {
  testimonials: TestimonialItem[];
  config: CardTestimonialConfig;
}

const Carousel: React.FC<CarouselProps> = ({ testimonials, config }) => {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(config.autoplay || false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = testimonials.length;

  // Auto play
  useEffect(() => {
    if (isAutoPlaying && total > 1) {
      intervalRef.current = setInterval(() => {
        setCurrent(prev => (prev + 1) % total);
      }, config.autoplayInterval || 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, total, config.autoplayInterval]);

  const goTo = (index: number) => {
    setCurrent(index);
    setIsAutoPlaying(false);
  };

  const prev = () => goTo((current - 1 + total) % total);
  const next = () => goTo((current + 1) % total);

  return (
    <div className="relative">
      {/* Main Card */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {testimonials.map((t) => (
            <div key={t.id} className="w-full flex-shrink-0 px-4">
              <div className="max-w-2xl mx-auto">
                <TestimonialCard
                  testimonial={t}
                  config={config}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition"
            aria-label="Vorherige"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition"
            aria-label="Nächste"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-2 h-2 rounded-full transition ${
                idx === current ? 'bg-rose-500 w-6' : 'bg-gray-300'
              }`}
              aria-label={`Zu Bewertung ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ===== MAIN COMPONENT =====

interface CardTestimonialProps {
  config?: CardTestimonialConfig;
  instanceId?: number;
}

export const CardTestimonial: React.FC<CardTestimonialProps> = ({ config: propConfig, instanceId }) => {
  const [currentViewport, setCurrentViewport] = React.useState<Viewport>('desktop');

  // Default config
  const config = propConfig || {
    testimonials: [
      {
        id: '1',
        quote: 'Absolut begeistert! Der beste Haarschnitt, den ich je hatte. Maria hat genau verstanden, was ich wollte und das Ergebnis übertrifft alle Erwartungen.',
        author: 'Sarah M.',
        role: 'Stammkundin',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        source: 'google' as const,
        date: '2024-01-15',
        order: 1
      },
      {
        id: '2',
        quote: 'Sehr professioneller Service und freundliches Team. Die Beratung war ausführlich und das Ergebnis hat mich sehr glücklich gemacht.',
        author: 'Michael K.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        source: 'facebook' as const,
        date: '2024-02-20',
        order: 2
      },
      {
        id: '3',
        quote: 'Endlich ein Salon, der wirklich zuhört! Meine Haare waren noch nie so gesund und glänzend. Komme definitiv wieder.',
        author: 'Lisa T.',
        role: 'Neukundin',
        company: 'Hannover',
        rating: 4.5,
        source: 'yelp' as const,
        order: 3
      }
    ],
    layout: 'grid' as const,
    grid: {
      columns: { desktop: 3, tablet: 2, mobile: 1 },
      gap: 'lg' as const,
      alignItems: 'stretch' as const
    },
    autoplay: false,
    autoplayInterval: 5000,
    cardStyle: {
      backgroundColor: { kind: 'custom' as const, hex: '#FFFFFF' },
      borderRadius: 'xl' as const,
      borderWidth: 0 as const,
      borderColor: { kind: 'custom' as const, hex: '#E5E7EB' },
      shadow: 'md' as const,
      shadowHover: 'lg' as const,
      padding: 'lg' as const,
      transitionDuration: 200 as const,
      hoverEffect: 'lift' as const
    },
    quoteStyle: 'with-icon' as const,
    quoteIconColor: { kind: 'custom' as const, hex: '#F43F5E' },
    quoteSize: 'base' as const,
    quoteColor: { kind: 'custom' as const, hex: '#374151' },
    quoteItalic: true,
    showAuthorImage: true,
    authorImageSize: 'md' as const,
    authorImageBorderRadius: 'full' as const,
    authorNameSize: 'base' as const,
    authorNameColor: { kind: 'custom' as const, hex: '#111827' },
    authorRoleSize: 'sm' as const,
    authorRoleColor: { kind: 'custom' as const, hex: '#6B7280' },
    authorLayout: 'inline' as const,
    showRating: true,
    ratingStyle: 'stars' as const,
    ratingColor: { kind: 'custom' as const, hex: '#FBBF24' },
    ratingEmptyColor: { kind: 'custom' as const, hex: '#E5E7EB' },
    showSource: true,
    sectionStyle: {
      backgroundColor: { kind: 'custom' as const, hex: '#F9FAFB' },
      paddingY: 'xl' as const,
      paddingX: 'lg' as const,
      maxWidth: 'xl' as const,
      showHeader: true,
      headerAlign: 'center' as const,
      title: 'Das sagen unsere Kunden',
      titleColor: { kind: 'custom' as const, hex: '#111827' },
      subtitle: 'Echte Bewertungen von zufriedenen Kunden',
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

  // Sorted testimonials
  const sortedTestimonials = [...config.testimonials].sort((a, b) => a.order - b.order);

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
      id={`card-testimonial-${instanceId || 'default'}`}
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
            {sortedTestimonials.map(testimonial => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                config={config}
              />
            ))}
          </div>
        )}

        {/* Carousel Layout */}
        {config.layout === 'carousel' && (
          <Carousel
            testimonials={sortedTestimonials}
            config={config}
          />
        )}

        {/* Single (featured) */}
        {config.layout === 'single' && sortedTestimonials.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <TestimonialCard
              testimonial={sortedTestimonials[0]}
              config={{
                ...config,
                cardStyle: { ...config.cardStyle, padding: 'xl' },
                quoteSize: '2xl'
              }}
            />
          </div>
        )}

        {/* Masonry */}
        {config.layout === 'masonry' && (
          <div 
            className="columns-1 md:columns-2 lg:columns-3"
            style={{ gap: SPACING_VALUES[config.grid.gap] }}
          >
            {sortedTestimonials.map(testimonial => (
              <div key={testimonial.id} className="break-inside-avoid mb-4">
                <TestimonialCard
                  testimonial={testimonial}
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

export default CardTestimonial;
