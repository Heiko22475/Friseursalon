// =====================================================
// VISUAL EDITOR – WEBSITE CONTEXT BRIDGE
// Provides a lightweight WebsiteContext for block components
// rendered inside the VE canvas. Only provides read access –
// all mutations go through the VE editor state instead.
// =====================================================

import React from 'react';
import { WebsiteProvider } from '../../contexts/WebsiteContext';

interface VEWebsiteContextBridgeProps {
  /** The customer_id to load website data from Supabase */
  customerId: string;
  children: React.ReactNode;
}

/**
 * Wraps children in a WebsiteProvider so that block components
 * like Hero (which calls useWebsite() for logos) work correctly
 * inside the Visual Editor canvas.
 *
 * This reuses the real WebsiteProvider which loads from Supabase.
 * The VE doesn't need to mock data – it just needs the context
 * to be available so block components don't crash.
 */
export const VEWebsiteContextBridge: React.FC<VEWebsiteContextBridgeProps> = ({
  customerId,
  children,
}) => {
  if (!customerId) {
    // No customer selected – render children without provider
    // Block components will need to handle missing context gracefully
    return <>{children}</>;
  }

  return (
    <WebsiteProvider customerId={customerId}>
      {children}
    </WebsiteProvider>
  );
};
