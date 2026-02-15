import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Palette, Database, LayoutGrid, PenTool } from 'lucide-react';
import { AdminHeader } from '../admin/AdminHeader';

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="superadmin-dashboard min-h-screen">
      <AdminHeader title="Dashboard" backTo={false} />

      <div className="superadmin-dashboard-content max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="superadmin-dashboard-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* Visual Editor — Featured */}
          <button
            onClick={() => navigate('/admin/visual-editor')}
            className="block p-6 rounded-lg transition text-left group"
            style={{
              backgroundColor: 'var(--admin-bg-card)',
              border: '2px solid var(--admin-accent)',
              boxShadow: '0 0 0 1px var(--admin-accent-bg)',
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg transition" style={{ backgroundColor: 'var(--admin-accent)', color: '#fff' }}>
                <PenTool className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--admin-text-heading)' }}>Visual Editor</h3>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--admin-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ★ Empfohlen
                </span>
              </div>
            </div>
            <p style={{ color: 'var(--admin-text-muted)' }}>
              Website visuell bearbeiten. Wähle zwischen Demo-Testseite und Live-Kundendaten (Supabase).
            </p>
          </button>

          <button
            onClick={() => navigate('/superadmin/users')}
            className="block p-6 rounded-lg transition text-left group"
            style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg transition" style={{ backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent)' }}>
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--admin-text-heading)' }}>User Management</h3>
            </div>
            <p style={{ color: 'var(--admin-text-muted)' }}>
              Manage customers, websites, export backups, and restore sites.
            </p>
          </button>

          <button
            onClick={() => navigate('/superadmin/stockphotos')}
            className="block p-6 rounded-lg transition text-left group"
            style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg transition" style={{ backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent)' }}>
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--admin-text-heading)' }}>Stockphotos</h3>
            </div>
            <p style={{ color: 'var(--admin-text-muted)' }}>
              Manage shared stock photos available to all customers.
            </p>
          </button>

          <button
            onClick={() => navigate('/superadmin/card-templates')}
            className="block p-6 rounded-lg transition text-left group"
            style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg transition" style={{ backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent)' }}>
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--admin-text-heading)' }}>Karten-Vorlagen</h3>
            </div>
            <p style={{ color: 'var(--admin-text-muted)' }}>
              Vordefinierte Karten-Entwürfe für alle Benutzer verwalten.
            </p>
          </button>

          <button
            onClick={() => navigate('/superadmin/data-export')}
            className="block p-6 rounded-lg transition text-left group"
            style={{ backgroundColor: 'var(--admin-bg-card)', border: '1px solid var(--admin-border)' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg transition" style={{ backgroundColor: 'var(--admin-accent-bg)', color: 'var(--admin-accent)' }}>
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--admin-text-heading)' }}>Daten Export/Import</h3>
            </div>
            <p style={{ color: 'var(--admin-text-muted)' }}>
              Export und Import von Vorlagen, Stockphotos und System-Daten.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
