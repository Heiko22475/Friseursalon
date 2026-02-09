// =====================================================
// VISUAL EDITOR – ELEMENT TYPES
// Alle Block-/Element-Typen für den Visual Editor
// =====================================================

import type { ElementStyles } from './styles';

// ===== ELEMENT TYPES =====

export type VEElementType =
  | 'Body'
  | 'Section'
  | 'Container'
  | 'Text'
  | 'Image'
  | 'Button'
  | 'Cards'
  | 'ComponentInstance';

// ===== TEXT STYLE PRESETS =====

export type TextStylePreset = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'caption' | 'price' | 'label';

// ===== BASE ELEMENT =====

export interface VEBaseElement {
  id: string;
  type: VEElementType;
  label?: string;
  styles?: ElementStyles;
  children?: VEElement[];
}

// ===== BODY =====

export interface VEBody extends VEBaseElement {
  type: 'Body';
  children: VEElement[];
}

// ===== SECTION =====

export interface VESection extends VEBaseElement {
  type: 'Section';
  children: VEElement[];
}

// ===== CONTAINER =====

export interface VEContainer extends VEBaseElement {
  type: 'Container';
  children: VEElement[];
}

// ===== TEXT =====

export interface VEText extends VEBaseElement {
  type: 'Text';
  content: string; // HTML string (TipTap)
  textStyle?: TextStylePreset;
}

// ===== IMAGE =====

export interface VEImage extends VEBaseElement {
  type: 'Image';
  content: {
    src: string;
    alt: string;
  };
}

// ===== BUTTON =====

export interface VEButton extends VEBaseElement {
  type: 'Button';
  content: {
    text: string;
    link: string;
    openInNewTab?: boolean;
  };
}

// ===== CARDS =====

export type CardImageLayout = 'top-full' | 'top-padded' | 'background';

export type CardElementType = 'CardImage' | 'CardText' | 'CardBadge' | 'CardRating' | 'CardButton' | 'CardIcon';

export interface CardElement {
  id: string;
  type: CardElementType;
  label: string;
  content: any;
  textStyle?: TextStylePreset;
  imageLayout?: CardImageLayout;
  styles?: ElementStyles;
}

export interface VECard {
  id: string;
  elements: CardElement[];
}

export interface VECardsLayout {
  desktop: { columns: number; gap?: import('./styles').SizeValue };
  tablet?: { columns?: number; gap?: import('./styles').SizeValue };
  mobile?: { columns?: number; gap?: import('./styles').SizeValue };
}

export interface VECards extends VEBaseElement {
  type: 'Cards';
  templateId: string;
  layout: VECardsLayout;
  cards: VECard[];
}

// ===== COMPONENT INSTANCE =====

export interface VEComponentInstance extends VEBaseElement {
  type: 'ComponentInstance';
  componentId: string;
}

// ===== UNION TYPE =====

export type VEElement =
  | VEBody
  | VESection
  | VEContainer
  | VEText
  | VEImage
  | VEButton
  | VECards
  | VEComponentInstance;

// ===== PAGE =====

export interface VEPage {
  id: string;
  name: string;
  route: string;
  body: VEBody;
  /** true = neues VE-Format, false/undefined = Legacy */
  isVisualEditor?: boolean;
  /** Veröffentlicht? Default: true */
  isPublished?: boolean;
}

// ===== COMPONENT DEFINITION =====

export interface VEComponent {
  id: string;
  name: string;
  children: VEElement[];
  styles?: ElementStyles;
}
