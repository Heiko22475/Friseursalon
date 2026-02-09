import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AdminTheme = 'dark' | 'light';

interface AdminThemeContextValue {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
  /** CSS variable value getter — shortcut for inline styles */
  v: (varName: string) => string;
}

const AdminThemeContext = createContext<AdminThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
  v: (name) => `var(--admin-${name})`,
});

const STORAGE_KEY = 'beautiful-cms-admin-theme';

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AdminTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const setTheme = useCallback((t: AdminTheme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState(t => t === 'dark' ? 'light' : 'dark'), []);
  const v = useCallback((name: string) => `var(--admin-${name})`, []);

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme, v }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => useContext(AdminThemeContext);
