import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AdminTheme = 'dark' | 'light' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'nord' | 'cherry' | 'mocha' | 'slate' | 'aurora' | 'sand';

/** Theme metadata for the picker UI */
export interface ThemeInfo {
  id: AdminTheme;
  label: string;
  /** 3 preview colors: [bg, accent, text] */
  swatches: [string, string, string];
}

export const ADMIN_THEMES: ThemeInfo[] = [
  { id: 'dark',     label: 'Midnight',    swatches: ['#13131b', '#3b82f6', '#d1d5db'] },
  { id: 'light',    label: 'Rosé',        swatches: ['#f9fafb', '#e11d48', '#374151'] },
  { id: 'ocean',    label: 'Ocean',       swatches: ['#0f1729', '#06b6d4', '#cbd5e1'] },
  { id: 'forest',   label: 'Forest',      swatches: ['#0f1a14', '#10b981', '#c6d4cc'] },
  { id: 'sunset',   label: 'Sunset',      swatches: ['#1a1412', '#f59e0b', '#d4c5b0'] },
  { id: 'lavender', label: 'Lavender',    swatches: ['#faf8ff', '#7c3aed', '#4b4560'] },
  { id: 'nord',     label: 'Nord',        swatches: ['#2e3440', '#88c0d0', '#d8dee9'] },
  { id: 'cherry',   label: 'Cherry',      swatches: ['#1a0f14', '#e11d48', '#dcc5c5'] },
  { id: 'mocha',    label: 'Mocha',       swatches: ['#1c1614', '#d4a574', '#d4c8be'] },
  { id: 'slate',    label: 'Slate',       swatches: ['#f1f5f9', '#475569', '#1e293b'] },
  { id: 'aurora',   label: 'Aurora',      swatches: ['#0a0f1a', '#a855f7', '#d1cde8'] },
  { id: 'sand',     label: 'Sand',        swatches: ['#fdfaf5', '#b45309', '#44403c'] },
];

interface AdminThemeContextValue {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
  /** CSS variable value getter — shortcut for inline styles */
  v: (varName: string) => string;
}

const VALID_THEMES: AdminTheme[] = ADMIN_THEMES.map(t => t.id);

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
      const saved = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
      if (saved && VALID_THEMES.includes(saved)) return saved;
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const setTheme = useCallback((t: AdminTheme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState(t => {
    const idx = VALID_THEMES.indexOf(t);
    return VALID_THEMES[(idx + 1) % VALID_THEMES.length];
  }), []);
  const v = useCallback((name: string) => `var(--admin-${name})`, []);

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme, v }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => useContext(AdminThemeContext);
