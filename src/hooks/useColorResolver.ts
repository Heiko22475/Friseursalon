// =====================================================
// COLOR RESOLVER HOOK
// Hook für die Auflösung von ColorValue zu Hex-Strings
// =====================================================

import { useCallback } from 'react';
import { useActiveTheme } from './useActiveTheme';
import { resolveColor } from '../utils/token-resolver';
import { ColorValue, ThemeTokens } from '../types/theme';

/**
 * Hook that returns a function to resolve ColorValue to hex strings
 * Uses the active theme context
 */
export function useColorResolver() {
  const { theme } = useActiveTheme();
  
  const resolveColorValue = useCallback((color: ColorValue | undefined): string => {
    if (!color) return 'transparent';
    if (color.kind === 'custom' && color.hex) return color.hex;
    if (color.kind === 'tokenRef' && theme) {
      return resolveColor(color, theme) || '#000000';
    }
    return '#000000';
  }, [theme]);
  
  return { resolveColorValue, theme };
}

/**
 * Standalone function to resolve ColorValue with provided theme
 * Use this when you don't want to use the hook
 */
export function resolveColorValue(
  color: ColorValue | undefined, 
  theme: ThemeTokens | null
): string {
  if (!color) return 'transparent';
  if (color.kind === 'custom' && color.hex) return color.hex;
  if (color.kind === 'tokenRef' && theme) {
    return resolveColor(color, theme) || '#000000';
  }
  return '#000000';
}
