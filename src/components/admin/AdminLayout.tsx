import React from 'react';
import { AdminThemeProvider, useAdminTheme } from '../../contexts/AdminThemeContext';
import '../../styles/admin-theme.css';

/**
 * AdminLayout wraps all admin pages and applies the theme class.
 * Place this around admin routes in App.tsx.
 */
const AdminLayoutInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useAdminTheme();

  return (
    <div className={`admin-theme-${theme}`}>
      {children}
    </div>
  );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner>
        {children}
      </AdminLayoutInner>
    </AdminThemeProvider>
  );
};
