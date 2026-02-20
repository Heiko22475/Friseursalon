// =====================================================
// VISUAL EDITOR – MEDIA DIALOG CONTEXT
// Zentraler State für den Mediathek-Dialog.
// openMediaDialog(callback) → Dialog öffnet sich,
// Bildauswahl ruft callback(url) auf.
// =====================================================

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// ===== TYPES =====

interface VEMediaDialogContextValue {
  /** Ist der Dialog offen? */
  isOpen: boolean;
  /** Öffnet den Dialog. callback wird mit der gewählten URL aufgerufen. */
  openMediaDialog: (onSelect: (url: string) => void) => void;
  /** Schließt den Dialog ohne Auswahl. */
  closeMediaDialog: () => void;
  /** Wird intern vom Dialog aufgerufen wenn ein Bild gewählt wurde. */
  handleSelect: (url: string) => void;
}

// ===== CONTEXT =====

const VEMediaDialogContext = createContext<VEMediaDialogContextValue>({
  isOpen: false,
  openMediaDialog: () => {},
  closeMediaDialog: () => {},
  handleSelect: () => {},
});

export const useMediaDialog = () => useContext(VEMediaDialogContext);

// ===== PROVIDER =====

export const VEMediaDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const callbackRef = useRef<((url: string) => void) | null>(null);

  const openMediaDialog = useCallback((callback: (url: string) => void) => {
    callbackRef.current = callback;
    setIsOpen(true);
  }, []);

  const closeMediaDialog = useCallback(() => {
    setIsOpen(false);
    callbackRef.current = null;
  }, []);

  const handleSelect = useCallback((url: string) => {
    callbackRef.current?.(url);
    setIsOpen(false);
    callbackRef.current = null;
  }, []);

  return (
    <VEMediaDialogContext.Provider value={{ isOpen, openMediaDialog, closeMediaDialog, handleSelect }}>
      {children}
    </VEMediaDialogContext.Provider>
  );
};
