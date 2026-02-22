import React from 'react';
import { Settings } from 'lucide-react';
import { useWebsite } from '../../contexts/WebsiteContext';
import { AdminHeader } from './AdminHeader';

export const SettingsEditorNew: React.FC = () => {
  const { loading, websiteRecord } = useWebsite();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--admin-accent)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Website-Einstellungen" icon={Settings} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl p-8" style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}>

          <div className="space-y-6">
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--admin-accent-bg)', border: '1px solid var(--admin-accent-bg)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--admin-accent-text)' }}>Website-Informationen</h3>
              <div className="space-y-1 text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                <p><strong>Kunden-ID:</strong> {websiteRecord?.customer_id || 'Nicht gesetzt'}</p>
                <p><strong>Website-Name:</strong> {websiteRecord?.site_name || 'Nicht gesetzt'}</p>
                <p><strong>Status:</strong> {websiteRecord?.is_published ? '✅ Veröffentlicht' : '⚠️ Nicht veröffentlicht'}</p>
              </div>
            </div>

            <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              Farben, Schriften und Designoptionen werden im <strong>Theme Editor</strong> und in der <strong>Typographie</strong>-Seite verwaltet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
