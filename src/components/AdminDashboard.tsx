import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebsite } from '../contexts/WebsiteContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Layout, Palette, Settings, FolderOpen, Sparkles, Type, HardDrive } from 'lucide-react';
import { useConfirmDialog } from './admin/ConfirmDialog';

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
      // Clear the flag
      localStorage.removeItem('showBackupReminder');
      
      // Check when last backup was made
      const lastBackup = localStorage.getItem('lastBackupDate');
      const daysSinceBackup = lastBackup 
        ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Show reminder if no backup or older than 7 days
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
          <p className="text-sm text-gray-600">
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
    { id: 'pages', name: 'Seiten-Verwaltung', icon: Layout, path: '/admin/pages', enabled: true, featured: true },
    { id: 'media', name: 'Mediathek', icon: FolderOpen, path: '/admin/media', enabled: true, featured: false },
    { id: 'backup', name: 'Backup & Wiederherstellung', icon: HardDrive, path: '/admin/backup', enabled: true, featured: false },
    { id: 'logos', name: 'Logo-Designer', icon: Sparkles, path: '/admin/logos', enabled: true, featured: false },
    { id: 'settings', name: 'Website-Einstellungen', icon: Settings, path: '/admin/settings', enabled: true, featured: false },
    { id: 'theme', name: 'Theme Editor', icon: Palette, path: '/admin/theme', enabled: true, featured: false },
    { id: 'typography', name: 'Typographie', icon: Type, path: '/admin/typography', enabled: true, featured: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Dialog />
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                BeautifulCMS
              </h1>
              {websiteRecord && (
                <span className="text-gray-400 text-lg">
                  — {websiteRecord.site_name}
                  {(websiteRecord as any).domain_name && (
                    <span className="text-gray-300 ml-2">({(websiteRecord as any).domain_name})</span>
                  )}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Angemeldet als: {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-rose-500 transition"
            >
              Website ansehen
            </a>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Willkommen im Content Management System
          </h2>
          <p className="text-gray-600">
            Wählen Sie einen Bereich aus, um Inhalte zu bearbeiten.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            const isEnabled = section.enabled;
            const isFeatured = section.featured;
            return (
              <button
                key={section.id}
                onClick={() => isEnabled && navigate(section.path)}
                disabled={!isEnabled}
                className={`bg-white p-6 rounded-xl shadow-sm transition group ${
                  isEnabled
                    ? 'hover:shadow-md cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                } ${isFeatured ? 'ring-2 ring-rose-500' : ''}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-full transition mb-4 ${
                    isEnabled
                      ? isFeatured ? 'bg-rose-500 group-hover:bg-rose-600' : 'bg-rose-50 group-hover:bg-rose-100'
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      isEnabled ? (isFeatured ? 'text-white' : 'text-rose-500') : 'text-gray-400'
                    }`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {section.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isEnabled ? 'Bearbeiten' : 'Bald verfügbar'}
                  </p>
                  {isFeatured && (
                    <span className="mt-2 text-xs font-semibold text-rose-500">
                      Multi-Page CMS
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
