// =====================================================
// EDIT MODE CONTEXT
// Globaler State für Inline-Editing auf der Live-Webseite
// =====================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface EditModeContextValue {
  // State
  isEditMode: boolean;
  isAdmin: boolean;
  activeEditingId: string | null;
  
  // Methods
  toggleEditMode: () => void;
  startEditing: (id: string) => void;
  stopEditing: () => void;
  isEditing: (id: string) => boolean;
}

const EditModeContext = createContext<EditModeContextValue | undefined>(undefined);

interface EditModeProviderProps {
  children: ReactNode;
}

export const EditModeProvider: React.FC<EditModeProviderProps> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // TODO: Implement proper role-based access control
        // For now, any authenticated user can edit
        setIsAdmin(true);
        console.log('✅ Edit mode available - User authenticated:', session.user.email);
      } else {
        setIsAdmin(false);
        setIsEditMode(false);
        console.log('❌ Edit mode unavailable - No user session');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load edit mode preference from localStorage
  useEffect(() => {
    if (isAdmin) {
      const saved = localStorage.getItem('editMode');
      if (saved === 'true') {
        setIsEditMode(true);
      }
    }
  }, [isAdmin]);

  const toggleEditMode = () => {
    const newValue = !isEditMode;
    setIsEditMode(newValue);
    setActiveEditingId(null); // Close any open editor
    
    // Save preference
    localStorage.setItem('editMode', newValue.toString());
  };

  const startEditing = (id: string) => {
    setActiveEditingId(id);
  };

  const stopEditing = () => {
    setActiveEditingId(null);
  };

  const isEditing = (id: string) => {
    return activeEditingId === id;
  };

  const value: EditModeContextValue = {
    isEditMode,
    isAdmin,
    activeEditingId,
    toggleEditMode,
    startEditing,
    stopEditing,
    isEditing,
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
};

// Hook to use edit mode context
export const useEditMode = (): EditModeContextValue => {
  const context = useContext(EditModeContext);
  
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  
  return context;
};
