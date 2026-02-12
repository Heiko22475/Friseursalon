// =====================================================
// VISUAL EDITOR – CARD TEMPLATE TYPES
// Templates für das Karten-System
// =====================================================

import type { ElementStyles } from './styles';

// ===== CARD TEMPLATE ELEMENT TYPES =====

/**
 * Source element types used in templates.
 * These define what kind of VEElement will be created from the template.
 * CardImage → VEImage, CardText → VEText, CardButton → VEButton,
 * CardBadge → VEText (label style), CardRating → VEText (stars), CardIcon → VEText (emoji)
 */
export type CardTemplateElementType = 'CardImage' | 'CardText' | 'CardBadge' | 'CardRating' | 'CardButton' | 'CardIcon';

// ===== CARD TEMPLATE =====

export interface CardTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'service' | 'team' | 'product' | 'testimonial' | 'general';
  /** Default card container styles */
  cardStyles?: ElementStyles;
  /** Template elements (defines composition) */
  elements: CardTemplateElement[];
  /** Image layout for the template (informational only) */
  imageLayout: string;
  /** Preview thumbnail (optional) */
  previewImage?: string;
  isBuiltIn: boolean;
  createdAt?: string;
}

// ===== CARD TEMPLATE ELEMENT =====

export interface CardTemplateElement {
  type: CardTemplateElementType;
  label: string;
  defaultContent?: any;
  textStyle?: string;
  styles?: ElementStyles;
  required?: boolean;
}

// ===== BUILT-IN TEMPLATES =====

export const BUILT_IN_CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'service-card-v1',
    name: 'Service-Karte',
    description: 'Karte mit Bild, Titel, Beschreibung und Preis',
    category: 'service',
    imageLayout: 'top-full',
    isBuiltIn: true,
    elements: [
      { type: 'CardImage', label: 'Bild', required: true },
      { type: 'CardText', label: 'Titel', textStyle: 'h3', defaultContent: 'Service-Titel' },
      { type: 'CardText', label: 'Beschreibung', textStyle: 'body', defaultContent: 'Beschreibung des Services' },
      { type: 'CardText', label: 'Preis', textStyle: 'price', defaultContent: 'ab 29 €' },
    ],
  },
  {
    id: 'team-card-v1',
    name: 'Team-Karte',
    description: 'Karte mit Foto, Name, Position und Beschreibung',
    category: 'team',
    imageLayout: 'top-full',
    isBuiltIn: true,
    elements: [
      { type: 'CardImage', label: 'Foto', required: true },
      { type: 'CardText', label: 'Name', textStyle: 'h3', defaultContent: 'Max Mustermann' },
      { type: 'CardText', label: 'Position', textStyle: 'label', defaultContent: 'Friseurmeister' },
      { type: 'CardText', label: 'Über mich', textStyle: 'body', defaultContent: 'Kurze Biografie...' },
    ],
  },
  {
    id: 'testimonial-card-v1',
    name: 'Bewertungs-Karte',
    description: 'Karte mit Bewertung, Text und Name',
    category: 'testimonial',
    imageLayout: 'top-padded',
    isBuiltIn: true,
    elements: [
      { type: 'CardRating', label: 'Bewertung', defaultContent: { value: 5, maxStars: 5 } },
      { type: 'CardText', label: 'Bewertungstext', textStyle: 'body', defaultContent: 'Sehr zufrieden!' },
      { type: 'CardText', label: 'Name', textStyle: 'label', defaultContent: '– Maria M.' },
    ],
  },
  {
    id: 'product-card-v1',
    name: 'Produkt-Karte',
    description: 'Karte mit Bild, Badge, Titel und Preis',
    category: 'product',
    imageLayout: 'top-full',
    isBuiltIn: true,
    elements: [
      { type: 'CardImage', label: 'Produktbild', required: true },
      { type: 'CardBadge', label: 'Badge', defaultContent: { text: 'Neu' } },
      { type: 'CardText', label: 'Produktname', textStyle: 'h3', defaultContent: 'Produktname' },
      { type: 'CardText', label: 'Preis', textStyle: 'price', defaultContent: '19,90 €' },
      { type: 'CardButton', label: 'Button', defaultContent: { text: 'Details', link: '#' } },
    ],
  },
];
