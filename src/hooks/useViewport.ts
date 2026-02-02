// =====================================================
// USE VIEWPORT HOOK
// Detects current viewport (desktop, tablet, mobile)
// =====================================================

import { useState, useEffect } from 'react';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

export const useViewport = (): Viewport => {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewport('mobile');
      } else if (width < 1024) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    };

    // Initial check
    updateViewport();

    // Listen for resize
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
};

// Helper function to get responsive font size
export const getResponsiveFontSize = (
  sizeConfig?: { desktop?: number; tablet?: number; mobile?: number },
  viewport?: Viewport,
  defaultSize: number = 16
): number => {
  if (!sizeConfig || !viewport) return defaultSize;
  
  // Try to get viewport-specific size
  const viewportSize = sizeConfig[viewport];
  if (viewportSize) return viewportSize;
  
  // Fall back to smaller viewport if not defined
  if (viewport === 'mobile' && sizeConfig.tablet) return sizeConfig.tablet;
  if ((viewport === 'mobile' || viewport === 'tablet') && sizeConfig.desktop) {
    return sizeConfig.desktop;
  }
  
  return defaultSize;
};
