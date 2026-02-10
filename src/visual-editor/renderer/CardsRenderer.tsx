// =====================================================
// VISUAL EDITOR – CARDS RENDERER
// Rendert ein VECards-Element als responsive Karten-Grid
// =====================================================

import React from 'react';
import type { VECards, VECard, CardElement, TextStylePreset } from '../types/elements';
import type { VEViewport } from '../types/styles';
import { resolveStyles } from '../utils/styleResolver';
import { sizeValueToCSS } from '../utils/sizeValue';
import { BUILT_IN_CARD_TEMPLATES } from '../types/cards';
import { Star } from 'lucide-react';

interface CardsRendererProps {
  element: VECards;
  viewport: VEViewport;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

// ===== TEXT PRESET DEFAULTS =====

const textPresetStyles: Record<TextStylePreset, React.CSSProperties> = {
  h1: { fontSize: '48px', fontWeight: 700, lineHeight: 1.2, margin: 0 },
  h2: { fontSize: '36px', fontWeight: 700, lineHeight: 1.3, margin: 0 },
  h3: { fontSize: '22px', fontWeight: 600, lineHeight: 1.3, margin: 0 },
  h4: { fontSize: '20px', fontWeight: 600, lineHeight: 1.4, margin: 0 },
  h5: { fontSize: '18px', fontWeight: 600, lineHeight: 1.4, margin: 0 },
  h6: { fontSize: '16px', fontWeight: 600, lineHeight: 1.4, margin: 0 },
  body: { fontSize: '14px', fontWeight: 400, lineHeight: 1.6, margin: 0 },
  'body-sm': { fontSize: '13px', fontWeight: 400, lineHeight: 1.5, margin: 0 },
  caption: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4, margin: 0 },
  price: { fontSize: '20px', fontWeight: 700, lineHeight: 1.2, margin: 0, color: '#3b82f6' },
  label: { fontSize: '12px', fontWeight: 600, lineHeight: 1.4, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, color: '#6b7280' },
};

// ===== CARD ELEMENT RENDERERS =====

const CardImageElement: React.FC<{ el: CardElement }> = ({ el }) => {
  const src = el.content?.src || el.content;
  return (
    <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', borderRadius: '4px 4px 0 0' }}>
      {src ? (
        <img
          src={typeof src === 'string' ? src : ''}
          alt={el.label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          draggable={false}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '13px',
        }}>
          📷 {el.label}
        </div>
      )}
    </div>
  );
};

const CardTextElement: React.FC<{ el: CardElement }> = ({ el }) => {
  const preset = (el.textStyle ?? 'body') as TextStylePreset;
  const baseStyle = textPresetStyles[preset] || textPresetStyles.body;
  const resolved = el.styles ? resolveStyles(el.styles, 'desktop') : {};

  return (
    <div style={{ ...baseStyle, ...resolved }}>
      {typeof el.content === 'string' ? el.content : JSON.stringify(el.content)}
    </div>
  );
};

const CardBadgeElement: React.FC<{ el: CardElement }> = ({ el }) => {
  const text = el.content?.text || el.content || 'Badge';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    }}>
      {typeof text === 'string' ? text : String(text)}
    </span>
  );
};

const CardRatingElement: React.FC<{ el: CardElement }> = ({ el }) => {
  const value = el.content?.value ?? 5;
  const maxStars = el.content?.maxStars ?? 5;
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: maxStars }, (_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < value ? '#f59e0b' : 'none'}
          stroke={i < value ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </div>
  );
};

const CardButtonElement: React.FC<{ el: CardElement }> = ({ el }) => {
  const text = el.content?.text || 'Button';
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 20px',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'default',
        marginTop: '4px',
      }}
      type="button"
      onClick={(e) => e.stopPropagation()}
    >
      {text}
    </button>
  );
};

const CardIconElement: React.FC<{ el: CardElement }> = ({ el }) => {
  const icon = el.content?.icon || '⭐';
  return (
    <div style={{ fontSize: '24px', lineHeight: 1 }}>
      {icon}
    </div>
  );
};

// ===== RENDER CARD ELEMENT =====

const renderCardElement = (el: CardElement): React.ReactNode => {
  switch (el.type) {
    case 'CardImage':
      return <CardImageElement el={el} />;
    case 'CardText':
      return <CardTextElement el={el} />;
    case 'CardBadge':
      return <CardBadgeElement el={el} />;
    case 'CardRating':
      return <CardRatingElement el={el} />;
    case 'CardButton':
      return <CardButtonElement el={el} />;
    case 'CardIcon':
      return <CardIconElement el={el} />;
    default:
      return <div style={{ color: '#ef4444', fontSize: '12px' }}>Unknown: {(el as any).type}</div>;
  }
};

// ===== SINGLE CARD =====

const SingleCard: React.FC<{ card: VECard; cardStyles?: React.CSSProperties }> = ({ card, cardStyles }) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        ...cardStyles,
      }}
    >
      {card.elements.map((el, idx) => {
        const isImage = el.type === 'CardImage';
        const needsPadding = !isImage;
        // First image is full-bleed, others get padding
        const isFirstImage = isImage && idx === 0;

        return (
          <div
            key={el.id}
            style={{
              padding: needsPadding || !isFirstImage ? (isImage ? '12px' : '0 16px') : undefined,
              ...(idx === 0 && !isImage ? { paddingTop: '16px' } : {}),
              ...(idx === card.elements.length - 1 ? { paddingBottom: '16px' } : {}),
              ...(el.type === 'CardText' || el.type === 'CardBadge' ? { marginTop: idx > 0 ? '4px' : undefined } : {}),
            }}
          >
            {renderCardElement(el)}
          </div>
        );
      })}
      {card.elements.length === 0 && (
        <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
          Leere Karte
        </div>
      )}
    </div>
  );
};

// ===== CARDS RENDERER (MAIN) =====

export const CardsRenderer: React.FC<CardsRendererProps> = ({
  element,
  viewport,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  const resolvedStyles = resolveStyles(element.styles, viewport);

  // Resolve responsive layout
  const layoutDesktop = element.layout.desktop;
  const layoutTablet = element.layout.tablet;
  const layoutMobile = element.layout.mobile;

  let columns: number;
  let gap: string;

  switch (viewport) {
    case 'mobile':
      columns = layoutMobile?.columns ?? layoutTablet?.columns ?? 1;
      gap = sizeValueToCSS(layoutMobile?.gap ?? layoutTablet?.gap ?? layoutDesktop.gap) ?? '16px';
      break;
    case 'tablet':
      columns = layoutTablet?.columns ?? Math.min(layoutDesktop.columns, 2);
      gap = sizeValueToCSS(layoutTablet?.gap ?? layoutDesktop.gap) ?? '16px';
      break;
    default:
      columns = layoutDesktop.columns;
      gap = sizeValueToCSS(layoutDesktop.gap) ?? '24px';
  }

  // Find template for card-level default styles
  const template = BUILT_IN_CARD_TEMPLATES.find(t => t.id === element.templateId);

  return (
    <div
      data-ve-id={element.id}
      data-ve-type="Cards"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      onMouseEnter={(e) => { e.stopPropagation(); onHover?.(element.id); }}
      className={`${isSelected ? 've-selected' : ''} ${isHovered ? 've-hovered' : ''}`}
      style={{
        position: 'relative',
        ...resolvedStyles,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
          width: '100%',
        }}
      >
        {element.cards.map(card => (
          <SingleCard
            key={card.id}
            card={card}
            cardStyles={template?.cardStyles ? resolveStyles(template.cardStyles, viewport) : undefined}
          />
        ))}
      </div>
      {element.cards.length === 0 && (
        <div
          style={{
            padding: '40px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            color: '#9ca3af',
            textAlign: 'center',
            fontSize: '14px',
            width: '100%',
          }}
        >
          Keine Karten – klicke um Karten hinzuzufügen
        </div>
      )}
    </div>
  );
};
