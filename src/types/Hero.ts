// =====================================================
// HERO TYPES
// =====================================================

// Viewport types
export type Viewport = 'desktop' | 'tablet' | 'mobile';

// Position options
export type HorizontalPosition = 'left' | 'left-center' | 'center' | 'right-center' | 'right';
export type VerticalPosition = 'top' | 'top-center' | 'middle' | 'bottom-center' | 'bottom';

export interface Position {
  horizontal: HorizontalPosition;
  vertical: VerticalPosition;
  offsetX: number; // -20 to +20 %
  offsetY: number; // -20 to +20 %
}

// Responsive wrappers - undefined means inherit from desktop
export interface ResponsivePosition {
  desktop: Position;
  tablet?: Position;
  mobile?: Position;
}

export interface ResponsiveNumber {
  desktop: number;
  tablet?: number;
  mobile?: number;
}

export interface ResponsiveBoolean {
  desktop: boolean;
  tablet?: boolean;
  mobile?: boolean;
}

export interface ResponsiveString {
  desktop: string;
  tablet?: string;
  mobile?: string;
}

// Button types
export type ButtonActionType = 'link' | 'scroll' | 'phone' | 'email';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'custom';
export type ButtonBorderRadius = 'none' | 'small' | 'medium' | 'large' | 'pill';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonAction {
  type: ButtonActionType;
  value: string; // URL, section-id, phone number, or email
}

export interface ButtonStyle {
  variant: ButtonVariant;
  backgroundColor?: string; // Theme color key or HEX
  textColor?: string;
  borderColor?: string;
  borderRadius: ButtonBorderRadius;
  size: ButtonSize;
}

export interface HeroButton {
  id: string;
  text: string;
  action: ButtonAction;
  style: ButtonStyle;
  position: ResponsivePosition;
  visible: ResponsiveBoolean;
  belowImage: ResponsiveBoolean;
  order: ResponsiveNumber; // Order when multiple elements at same position
}

// Logo reference (from Logo Designer)
export interface HeroLogo {
  id: string;
  logoId: string; // Reference to logo from Logo Designer
  position: ResponsivePosition;
  scale: ResponsiveNumber; // Percentage 10-200
  visible: ResponsiveBoolean;
  belowImage: ResponsiveBoolean;
  order: ResponsiveNumber;
}

// Text element
export interface HeroText {
  id: string;
  content: string; // Supports \n for line breaks
  fontFamily: string;
  fontSize: ResponsiveNumber;
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800';
  color: string; // Theme color key or HEX
  position: ResponsivePosition;
  visible: ResponsiveBoolean;
  belowImage: ResponsiveBoolean;
  order: ResponsiveNumber;
}

// Overlay configuration
export interface HeroOverlay {
  enabled: boolean;
  color: string; // Theme color key or HEX
  opacity: number; // 0-100
}

// Main Hero configuration
export interface HeroConfig {
  // Background image
  backgroundImage: string; // URL from media library
  backgroundPosition: {
    x: number; // 0-100 %
    y: number; // 0-100 %
  };
  
  // Overlay
  overlay: HeroOverlay;
  
  // Height per viewport
  height: ResponsiveString; // e.g. "600px", "80vh", "100vh"
  
  // Elements
  logos: HeroLogo[];
  texts: HeroText[];
  buttons: HeroButton[];
}

// Helper functions
export const getResponsiveValue = <T>(
  responsive: { desktop: T; tablet?: T; mobile?: T },
  viewport: Viewport
): T => {
  if (viewport === 'mobile') {
    return responsive.mobile ?? responsive.tablet ?? responsive.desktop;
  }
  if (viewport === 'tablet') {
    return responsive.tablet ?? responsive.desktop;
  }
  return responsive.desktop;
};

export const createDefaultPosition = (): Position => ({
  horizontal: 'center',
  vertical: 'middle',
  offsetX: 0,
  offsetY: 0
});

export const createDefaultResponsivePosition = (): ResponsivePosition => ({
  desktop: createDefaultPosition()
});

export const createDefaultHeroConfig = (): HeroConfig => ({
  backgroundImage: '',
  backgroundPosition: { x: 50, y: 50 },
  overlay: {
    enabled: false,
    color: '#000000',
    opacity: 50
  },
  height: {
    desktop: '600px',
    tablet: '500px',
    mobile: '400px'
  },
  logos: [],
  texts: [],
  buttons: []
});

// Position percentages mapping
export const horizontalPositionPercent: Record<HorizontalPosition, number> = {
  'left': 10,
  'left-center': 25,
  'center': 50,
  'right-center': 75,
  'right': 90
};

export const verticalPositionPercent: Record<VerticalPosition, number> = {
  'top': 10,
  'top-center': 30,
  'middle': 50,
  'bottom-center': 70,
  'bottom': 90
};

export const getPositionStyle = (position: Position): React.CSSProperties => {
  const baseX = horizontalPositionPercent[position.horizontal];
  const baseY = verticalPositionPercent[position.vertical];
  
  return {
    position: 'absolute',
    left: `${baseX + position.offsetX}%`,
    top: `${baseY + position.offsetY}%`,
    transform: 'translate(-50%, -50%)'
  };
};
