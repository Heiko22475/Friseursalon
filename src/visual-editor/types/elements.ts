// =====================================================
// VISUAL EDITOR – ELEMENT TYPES
// Alle Block-/Element-Typen für den Visual Editor
// =====================================================

import type { ElementStyles } from './styles';
import type { ColorValue } from '../../types/theme';

// ===== ELEMENT TYPES =====

export type VEElementType =
  | 'Body'
  | 'Section'
  | 'Container'
  | 'Text'
  | 'Image'
  | 'Button'
  | 'Cards'
  | 'Navbar'
  | 'Header'   // @deprecated – use Navbar instead
  | 'Footer'
  | 'ComponentInstance'
  | 'WebsiteBlock'
  | 'Divider'
  | 'Spacer'
  | 'Icon'
  | 'List'
  | 'ListItem';

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

export interface VECardsLayout {
  desktop: { columns: number; gap?: import('./styles').SizeValue };
  tablet?: { columns?: number; gap?: import('./styles').SizeValue };
  mobile?: { columns?: number; gap?: import('./styles').SizeValue };
}

/**
 * VECards: A grid container whose children are standard VEContainers.
 * Each child container represents one card with real VEText/VEImage/VEButton children.
 * This enables inline editing, tree navigation, and individual property editing for card content.
 */
export interface VECards extends VEBaseElement {
  type: 'Cards';
  templateId: string;
  layout: VECardsLayout;
  children: VEElement[];
}

// ===== COMPONENT INSTANCE =====

export interface VEComponentInstance extends VEBaseElement {
  type: 'ComponentInstance';
  componentId: string;
}

// ===== HEADER =====

/** @deprecated Use VENavbar instead – this is the legacy opaque header */
export interface VEHeader extends VEBaseElement {
  type: 'Header';
  config: import('../../types/Header').HeaderConfig;
}

// ===== NAVBAR (new compositional header) =====

export type NavbarStickyMode = 'none' | 'sticky' | 'fixed';

/**
 * VENavbar: A compositional header/navigation element.
 * Its children are freely editable VE elements (logo images, nav links, buttons, etc.).
 * Uses viewport-specific visibility on children for desktop ↔ mobile switching.
 * Rendered as a <nav> with flex layout.
 */
export interface VENavbar extends VEBaseElement {
  type: 'Navbar';
  /** Breakpoint in px at which the mobile menu is used instead of desktop nav */
  mobileBreakpoint: number;
  /** Sticky behaviour */
  stickyMode: NavbarStickyMode;
  /** Children: freely composable VE elements (containers, text, images, buttons) */
  children: VEElement[];
}

// ===== FOOTER =====

export interface VEFooter extends VEBaseElement {
  type: 'Footer';
  config: import('../../types/Footer').FooterConfig;
}

// ===== WEBSITE BLOCK (renders original block components in VE) =====

export interface VEWebsiteBlock extends VEBaseElement {
  type: 'WebsiteBlock';
  /** The original block type from website JSON (hero, generic-card, etc.) */
  blockType: string;
  /** The original block config – passed directly to the block component */
  blockConfig: any;
  /** The original block content */
  blockContent?: any;
  /** Block position/instanceId */
  blockPosition?: number;
  /** Original block ID for save merge */
  originalBlockId: string;
}

// ===== DIVIDER =====

export interface VEDivider extends VEBaseElement {
  type: 'Divider';
  content: {
    /** Line style: solid, dashed, dotted, double */
    lineStyle: 'solid' | 'dashed' | 'dotted' | 'double';
    /** Line thickness in px */
    thickness: number;
    /** Line color – uses ColorValue for theme integration */
    color: ColorValue;
    /** Width as CSS value (e.g. '100%', '80%', '200px') */
    width: string;
  };
}

// ===== SPACER =====

export interface VESpacer extends VEBaseElement {
  type: 'Spacer';
  content: {
    /** Height in px */
    height: number;
  };
}

// ===== ICON =====

export interface VEIcon extends VEBaseElement {
  type: 'Icon';
  content: {
    /** Lucide icon name (e.g. 'Heart', 'Star', 'Phone') */
    iconName: string;
    /** Icon size numeric value */
    size: number;
    /** Size unit – px (default), %, or em */
    sizeUnit: 'px' | '%' | 'em';
    /** Icon color – uses ColorValue for theme integration */
    color: ColorValue;
    /** Stroke width */
    strokeWidth: number;
    /** Optional container background color */
    containerBg: ColorValue | null;
    /** Container border-radius in px (0 = square, half of size+padding = circle) */
    containerBorderRadius: number;
  };
}

// ===== LIST =====

export type VEListType = 'unordered' | 'ordered';

export interface VEList extends VEBaseElement {
  type: 'List';
  content: {
    /** List type */
    listType: VEListType;
  };
  /** Each child is a VEListItem */
  children: VEElement[];
}

// ===== LIST ITEM =====

export interface VEListItem extends VEBaseElement {
  type: 'ListItem';
  content: {
    /** Text content (HTML string) */
    text: string;
  };
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
  | VENavbar
  | VEHeader
  | VEFooter
  | VEComponentInstance
  | VEWebsiteBlock
  | VEDivider
  | VESpacer
  | VEIcon
  | VEList
  | VEListItem;

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
