import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Check } from 'lucide-react';
import { useAdminTheme, ADMIN_THEMES } from '../../contexts/AdminThemeContext';
import type { AdminTheme } from '../../contexts/AdminThemeContext';

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
  const { theme, setTheme } = useAdminTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!themeOpen) return;
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [themeOpen]);

  const currentThemeInfo = ADMIN_THEMES.find(t => t.id === theme) || ADMIN_THEMES[0];

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
            <div ref={themeRef} style={{ position: 'relative' }}>
              {/* Trigger Button — shows current theme swatches */}
              <button
                onClick={() => setThemeOpen(o => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '32px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--admin-border)',
                  backgroundColor: themeOpen ? 'var(--admin-bg-input)' : 'transparent',
                  color: 'var(--admin-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--admin-bg-input)';
                  e.currentTarget.style.color = 'var(--admin-text)';
                }}
                onMouseLeave={(e) => {
                  if (!themeOpen) e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--admin-text-muted)';
                }}
                title="Design-Thema wählen"
              >
                <Palette size={14} />
                {/* Mini swatches of current theme */}
                <span style={{ display: 'flex', gap: '2px' }}>
                  {currentThemeInfo.swatches.map((c, i) => (
                    <span key={i} style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: '1px solid var(--admin-border-strong)',
                    }} />
                  ))}
                </span>
              </button>

              {/* Dropdown */}
              {themeOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: 'var(--admin-bg-surface)',
                    border: '1px solid var(--admin-border-strong)',
                    borderRadius: '10px',
                    padding: '6px',
                    boxShadow: 'var(--admin-shadow-lg)',
                    zIndex: 100,
                  }}
                >
                  <div style={{
                    padding: '4px 10px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--admin-text-muted)',
                  }}>
                    Design-Thema
                  </div>
                  {ADMIN_THEMES.map(t => {
                    const isActive = t.id === theme;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id as AdminTheme); setThemeOpen(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: isActive ? 'var(--admin-accent-bg)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.12s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {/* Swatch trio */}
                        <span style={{
                          display: 'flex',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: `1.5px solid ${isActive ? 'var(--admin-accent)' : 'var(--admin-border-strong)'}`,
                          flexShrink: 0,
                        }}>
                          {t.swatches.map((c, i) => (
                            <span key={i} style={{
                              display: 'block',
                              width: '16px',
                              height: '20px',
                              backgroundColor: c,
                            }} />
                          ))}
                        </span>
                        {/* Label */}
                        <span style={{
                          fontSize: '12px',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? 'var(--admin-accent-text)' : 'var(--admin-text)',
                          flex: 1,
                          textAlign: 'left',
                        }}>
                          {t.label}
                        </span>
                        {/* Check mark */}
                        {isActive && <Check size={14} style={{ color: 'var(--admin-accent)', flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
