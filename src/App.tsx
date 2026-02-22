import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WebsiteProvider } from './contexts/WebsiteContext';
import { EditModeProvider } from './contexts/EditModeContext';
import { useCustomerId } from './hooks/useCustomerId';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { GeneralEditorNew as GeneralEditor } from './components/admin/GeneralEditorNew';
import { SettingsEditorNew as SettingsEditor } from './components/admin/SettingsEditorNew';
import { DataExport } from './components/admin/DataExport';
import { BackupAndRestore } from './components/admin/BackupAndRestore';
import { PageManagerNew as PageManager } from './components/admin/PageManagerNew';
import { BlockManagerNew as BlockManager } from './components/admin/BlockManagerNew';
import { MediaLibrary } from './components/admin/MediaLibrary';
import { LogoList, LogoEditor } from './components/admin/LogoDesigner';
import { HeroEditor } from './components/admin/HeroEditor';
import { GenericCardEditorPage } from './components/admin/GenericCardEditorPage';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { UserManagement } from './components/superadmin/UserManagement';
import { SuperAdminDataExport } from './components/superadmin/SuperAdminDataExport';
import { SuperAdminSettings } from './components/superadmin/SuperAdminSettings';
import { CardTemplatesPage } from './pages/superadmin/CardTemplatesPage';
import { CardTemplateEditorPage } from './pages/superadmin/CardTemplateEditorPage';
import { DynamicPage } from './components/DynamicPage';
import ThemeManager from './components/ThemeManager';
import { TypographyEditor } from './components/admin/TypographyEditor';
import { AdminLayout } from './components/admin/AdminLayout';

// Visual Editor (Phase 1)
const VisualEditorPage = React.lazy(() => import('./visual-editor/VisualEditorPage'));

function AppContent() {
  const { customerId, loading } = useCustomerId();

  if (loading) {
    return (
      <div className="app-loading min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // Handle Special Routes that don't need a customer context (e.g. SuperAdmin)
  // Or if no customer is found (404 / Landing Page)
  if (!customerId) {
      // Check if trying to access Super Admin
      if (window.location.pathname.startsWith('/superadmin') || window.location.pathname.startsWith('/login')) {
         return (
             <Router>
                 <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/superadmin"
                        element={
                        <ProtectedRoute>
                            <AdminLayout><SuperAdminDashboard /></AdminLayout>
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/superadmin/users"
                        element={
                        <ProtectedRoute>
                            <AdminLayout><UserManagement /></AdminLayout>
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/superadmin/settings"
                        element={
                        <ProtectedRoute>
                            <AdminLayout><SuperAdminSettings /></AdminLayout>
                        </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Login />} />
                 </Routes>
             </Router>
         )
      }

      return (
          <div className="app-no-customer min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">Webseite nicht gefunden</h1>
                  <p className="text-gray-600 mt-2">Die Domain {window.location.hostname} ist noch nicht konfiguriert.</p>
              </div>
          </div>
      )
  }

  return (
    <WebsiteProvider customerId={customerId}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<DynamicPage />} />
          <Route path="/:slug" element={<DynamicPage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout><AdminDashboard /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/general"
            element={
              <ProtectedRoute>
                <AdminLayout><GeneralEditor /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminLayout><SettingsEditor /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/export"
            element={
              <ProtectedRoute>
                <AdminLayout><DataExport /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/backup"
            element={
              <ProtectedRoute>
                <AdminLayout><BackupAndRestore /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pages"
            element={
              <ProtectedRoute>
                <AdminLayout><PageManager /></AdminLayout>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/admin/pages-old"
            element={
              <ProtectedRoute>
                <PageManagerOld />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/admin/page-builder/:pageId"
            element={
              <ProtectedRoute>
                <AdminLayout><BlockManager /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blocks/:pageId"
            element={
              <ProtectedRoute>
                <AdminLayout><BlockManager /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/theme"
            element={
              <ProtectedRoute>
                <AdminLayout><ThemeManager /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/typography"
            element={
              <ProtectedRoute>
                <AdminLayout><TypographyEditor /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/visual-editor"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" /></div>}>
                    <VisualEditorPage />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/media"
            element={
              <ProtectedRoute>
                <AdminLayout><MediaLibrary /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logos"
            element={
              <ProtectedRoute>
                <AdminLayout><LogoList /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logos/:id"
            element={
              <ProtectedRoute>
                <AdminLayout><LogoEditor /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hero/:pageId/:blockId"
            element={
              <ProtectedRoute>
                <AdminLayout><HeroEditor /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/generic-card/:pageId/:blockId"
            element={
              <ProtectedRoute>
                <AdminLayout><GenericCardEditorPage /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute>
                <AdminLayout><SuperAdminDashboard /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/users"
            element={
              <ProtectedRoute>
                <AdminLayout><UserManagement /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/stockphotos"
            element={
              <ProtectedRoute>
                <AdminLayout><MediaLibrary stockOnly={true} isSuperAdmin={true} /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/card-templates"
            element={
              <ProtectedRoute>
                <AdminLayout><CardTemplatesPage /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/card-templates/:templateId"
            element={
              <ProtectedRoute>
                <AdminLayout><CardTemplateEditorPage /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/settings"
            element={
              <ProtectedRoute>
                <AdminLayout><SuperAdminSettings /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/data-export"
            element={
              <ProtectedRoute>
                <AdminLayout><SuperAdminDataExport /></AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </WebsiteProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <EditModeProvider>
        <AppContent />
      </EditModeProvider>
    </AuthProvider>
  );
}

export default App;
