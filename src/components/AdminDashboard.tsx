import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, FileText, Users, Clock, DollarSign, Star, Info, Image, Database, Layout, Layers } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const sections = [
    { id: 'pages', name: 'Seiten-Verwaltung', icon: Layout, path: '/admin/pages', enabled: true, featured: true },
    { id: 'general', name: 'Allgemeine Informationen', icon: FileText, path: '/admin/general', enabled: true },
    { id: 'contact', name: 'Kontaktdaten', icon: Users, path: '/admin/contact', enabled: true },
    { id: 'hours', name: 'Öffnungszeiten', icon: Clock, path: '/admin/hours', enabled: true },
    { id: 'services', name: 'Dienstleistungen', icon: Layers, path: '/admin/services', enabled: true },
    { id: 'reviews', name: 'Bewertungen', icon: Star, path: '/admin/reviews', enabled: true },
    { id: 'about', name: 'Über uns', icon: Info, path: '/admin/about', enabled: true },
    { id: 'pricing', name: 'Preise', icon: DollarSign, path: '/admin/pricing', enabled: true },
    { id: 'gallery', name: 'Galerie', icon: Image, path: '/admin/gallery', enabled: true },
    { id: 'export', name: 'Daten Export/Import', icon: Database, path: '/admin/export', enabled: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CMS Dashboard</h1>
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
