import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebsite } from '../contexts/WebsiteContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Layout, Palette, Settings, FolderOpen, Sparkles, Type, HardDrive, PenTool, ExternalLink } from 'lucide-react';
import { useConfirmDialog } from './admin/ConfirmDialog';
import { AdminHeader } from './admin/AdminHeader';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { websiteRecord } = useWebsite();
  const navigate = useNavigate();
  const { Dialog, confirm } = useConfirmDialog();
  const [showBackupReminder, setShowBackupReminder] = useState(false);

  // Check if backup reminder should be shown
  useEffect(() => {
    const shouldShow = localStorage.getItem('showBackupReminder');
    if (shouldShow === 'true') {
      localStorage.removeItem('showBackupReminder');
      const lastBackup = localStorage.getItem('lastBackupDate');
      const daysSinceBackup = lastBackup 
        ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      if (!lastBackup || daysSinceBackup === null || daysSinceBackup > 7) {
        setShowBackupReminder(true);
      }
    }
  }, []);

  // Show backup reminder dialog
  useEffect(() => {
    if (showBackupReminder) {
      const lastBackup = localStorage.getItem('lastBackupDate');
      const message = lastBackup
        ? `Ihr letztes Backup ist ${Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24))} Tage alt. Erstellen Sie regelmäßig Backups, um Ihre Daten zu schützen.`
        : 'Erstellen Sie jetzt ein Backup Ihrer Website, um Ihre Daten zu schützen.';

      confirm(
        '💾 Backup empfohlen',
        <div>
          <p className="mb-3">{message}</p>
          <p className="text-sm text-gray-400">
            Ein Backup enthält alle Ihre Seiten, Inhalte, Designs und Medien-Dateien.
          </p>
        </div>,
        () => {
          navigate('/admin/backup');
        },
        {
          confirmText: 'Jetzt Backup erstellen',
          cancelText: 'Später erinnern',
        }
      );

      setShowBackupReminder(false);
    }
  }, [showBackupReminder, confirm, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const sections = [
    { id: 'visual-editor', name: 'Visual Editor', desc: 'Visuell gestalten', icon: PenTool, path: '/admin/visual-editor', enabled: true, featured: true },
    { id: 'media', name: 'Mediathek', desc: 'Bilder & Dateien', icon: FolderOpen, path: '/admin/media', enabled: true, featured: false },
    { id: 'backup', name: 'Backup & Restore', desc: 'Sicherung & Wiederherstellung', icon: HardDrive, path: '/admin/backup', enabled: true, featured: false },
    { id: 'logos', name: 'Logo-Designer', desc: 'Logo erstellen & anpassen', icon: Sparkles, path: '/admin/logos', enabled: true, featured: false },
    { id: 'settings', name: 'Einstellungen', desc: 'Website-Einstellungen', icon: Settings, path: '/admin/settings', enabled: true, featured: false },
    { id: 'theme', name: 'Theme Editor', desc: 'Farben & Design', icon: Palette, path: '/admin/theme', enabled: true, featured: false },
    { id: 'typography', name: 'Typographie', desc: 'Schriften & Größen', icon: Type, path: '/admin/typography', enabled: true, featured: false },
    { id: 'pages', name: 'Seiten-Verwaltung (Legacy)', desc: 'Veraltet – bitte Visual Editor nutzen', icon: Layout, path: '/admin/pages', enabled: true, featured: false, deprecated: true },
  ];

  return (
    <div className="admin-dashboard" style={{ minHeight: '100vh' }}>
      <Dialog />

      {/* Header */}
      <AdminHeader
        title="BeautifulCMS"
        subtitle={websiteRecord ? websiteRecord.site_name : user?.email}
        backTo={false}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid var(--admin-border-strong)',
                backgroundColor: 'var(--admin-bg-input)',
                color: 'var(--admin-text-secondary)',
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <ExternalLink size={14} />
              Website ansehen
            </a>
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid var(--admin-border-strong)',
                backgroundColor: 'var(--admin-bg-input)',
                color: 'var(--admin-text-secondary)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <LogOut size={14} />
              Abmelden
            </button>
          </div>
        }
      />

      {/* Content */}
      <main className="admin-dashboard-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--admin-text-heading)', marginBottom: '6px' }}>
            Dashboard
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--admin-text-muted)' }}>
            Wählen Sie einen Bereich aus, um Inhalte zu bearbeiten.
          </p>
        </div>

        <div
          className="admin-dashboard-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {sections.map((section) => {
            const Icon = section.icon;
            const isFeatured = section.featured;
            const isDeprecated = (section as any).deprecated;
            return (
              <button
                key={section.id}
                onClick={() => section.enabled && navigate(section.path)}
                disabled={!section.enabled}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '20px',
                  backgroundColor: 'var(--admin-bg-card)',
                  border: `1px solid ${isFeatured ? 'var(--admin-accent-bg)' : isDeprecated ? 'var(--admin-border)' : 'var(--admin-border)'}`,
                  borderRadius: '10px',
                  cursor: section.enabled ? 'pointer' : 'not-allowed',
                  opacity: isDeprecated ? 0.55 : section.enabled ? 1 : 0.5,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  color: 'var(--admin-text)',
                  ...(isFeatured ? { boxShadow: `0 0 0 1px var(--admin-accent-bg)` } : {}),
                }}
                onMouseEnter={(e) => {
                  if (section.enabled) {
                    e.currentTarget.style.borderColor = isFeatured ? 'var(--admin-accent)' : 'var(--admin-border-strong)';
                    e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--admin-shadow-lg)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isFeatured ? 'var(--admin-accent-bg)' : 'var(--admin-border)';
                  e.currentTarget.style.backgroundColor = 'var(--admin-bg-card)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = isFeatured ? `0 0 0 1px var(--admin-accent-bg)` : 'none';
                  e.currentTarget.style.opacity = isDeprecated ? '0.55' : '1';
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDeprecated ? 'var(--admin-bg-input)' : 'var(--admin-accent)',
                    marginBottom: '14px',
                  }}
                >
                  <Icon size={20} style={{ color: isDeprecated ? 'var(--admin-text-secondary)' : '#fff' }} />
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text-heading)', margin: '0 0 4px 0' }}>
                  {section.name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', margin: 0 }}>
                  {section.desc}
                </p>
                {isDeprecated && (
                  <span
                    style={{
                      marginTop: '10px',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#f59e0b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ⚠ Deprecated
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
