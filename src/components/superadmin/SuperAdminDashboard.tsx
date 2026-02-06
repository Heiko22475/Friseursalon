import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Palette, Database } from 'lucide-react';
import { LayoutGrid } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  BeautifulCMS SuperAdmin
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => navigate('/superadmin/users')}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100 text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-violet-100 text-violet-600 rounded-lg group-hover:bg-violet-600 group-hover:text-white transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            </div>
            <p className="text-gray-500">
              Manage customers, websites, export backups, and restore sites.
            </p>
          </button>

          <button
            onClick={() => navigate('/superadmin/stockphotos')}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100 text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-pink-100 text-pink-600 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Stockphotos</h3>
            </div>
            <p className="text-gray-500">
              Manage shared stock photos available to all customers.
            </p>
          </button>

          <button
            onClick={() => navigate('/superadmin/card-templates')}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100 text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Karten-Vorlagen</h3>
            </div>
            <p className="text-gray-500">
              Vordefinierte Karten-Entwürfe für alle Benutzer verwalten.
            </p>
          </button>

          <button
            onClick={() => navigate('/superadmin/data-export')}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100 text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Daten Export/Import</h3>
            </div>
            <p className="text-gray-500">
              Export und Import von Vorlagen, Stockphotos und System-Daten.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
