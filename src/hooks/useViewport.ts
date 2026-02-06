// =====================================================
// USE VIEWPORT HOOK
// Detects current viewport (desktop, tablet, mobile)
// =====================================================

import { useState, useEffect, createContext, useContext } from 'react';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

// Context to override viewport (for preview mode)
const ViewportContext = createContext<Viewport | null>(null);

export const ViewportProvider = ViewportContext.Provider;

export const useViewport = (): Viewport => {
  // Check if viewport is overridden by context (e.g., in preview)
  const contextViewport = useContext(ViewportContext);
  const [viewport, setViewport] = useState<Viewport>('desktop');

  useEffect(() => {
    // If viewport is overridden, don't listen to window resize
    if (contextViewport) return;

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
  }, [contextViewport]);

  // Return context viewport if available, otherwise detected viewport
  return contextViewport || viewport;
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
