import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

interface AdminHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional icon component (Lucide icon) */
  icon?: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }>;
  /** Back navigation target. Set to false to hide back button. Default: '/admin' */
  backTo?: string | false;
  /** Back button label. Default: 'Zurück' */
  backLabel?: string;
  /** Right-side actions slot */
  actions?: React.ReactNode;
  /** Whether header should be sticky. Default: false */
  sticky?: boolean;
  /** Whether to show the theme toggle. Default: true */
  showThemeToggle?: boolean;
  /** Extra CSS class for the header container */
  className?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  backTo = '/admin',
  backLabel = 'Zurück',
  actions,
  sticky = false,
  showThemeToggle = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <header
      className={`admin-header border-b ${sticky ? 'sticky top-0 z-30' : ''} ${className}`}
      style={{
        backgroundColor: 'var(--admin-bg-surface)',
        borderColor: 'var(--admin-border)',
      }}
    >
      <div
        className="admin-header-inner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          minHeight: '56px',
          gap: '16px',
        }}
      >
        {/* Left side: back + title */}
        <div className="admin-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          {backTo !== false && (
            <button
              onClick={() => navigate(backTo)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
                backgroundColor: 'transparent',
                color: 'var(--admin-text-secondary)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--admin-bg-input)';
                e.currentTarget.style.color = 'var(--admin-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--admin-text-secondary)';
              }}
              title={backLabel}
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {Icon && (
              <Icon
                size={20}
                style={{ color: 'var(--admin-accent-text)', flexShrink: 0 }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--admin-text-heading)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: 'var(--admin-text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right side: actions + theme toggle */}
        <div className="admin-header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {actions}

          {showThemeToggle && (
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
                backgroundColor: 'transparent',
                color: 'var(--admin-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--admin-bg-input)';
                e.currentTarget.style.color = 'var(--admin-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--admin-text-muted)';
              }}
              title={theme === 'dark' ? 'Zum hellen Design wechseln' : 'Zum dunklen Design wechseln'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
