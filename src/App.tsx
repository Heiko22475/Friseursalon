import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WebsiteProvider } from './contexts/WebsiteContext';
import { useCustomerId } from './hooks/useCustomerId';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
// import { GeneralEditor } from './components/admin/GeneralEditor';
import { GeneralEditorNew as GeneralEditor } from './components/admin/GeneralEditorNew';
// import { SettingsEditor as SettingsEditorOld } from './components/admin/SettingsEditor';
import { SettingsEditorNew as SettingsEditor } from './components/admin/SettingsEditorNew';
// import { ServicesEditor as ServicesEditorOld } from './components/admin/ServicesEditor';
import { ServicesEditorNew as ServicesEditor } from './components/admin/ServicesEditorNew';
// import { ContactEditor as ContactEditorOld } from './components/admin/ContactEditor';
import { ContactEditorNew as ContactEditor } from './components/admin/ContactEditorNew';
// import { HoursEditor as HoursEditorOld } from './components/admin/HoursEditor';
// import { HoursEditorNew as HoursEditor } from './components/admin/HoursEditorNew'; // REMOVED
// import { ReviewsEditor as ReviewsEditorOld } from './components/admin/ReviewsEditor';
import { ReviewsEditorNew as ReviewsEditor } from './components/admin/ReviewsEditorNew';
// import { AboutEditor as AboutEditorOld } from './components/admin/AboutEditor';
// import { AboutEditorNew as AboutEditor } from './components/admin/AboutEditorNew'; // REMOVED
import { PricingEditor } from './components/admin/PricingEditor';
import { DataExport } from './components/admin/DataExport';
// import { PageManager as PageManagerOld } from './components/admin/PageManager';
import { PageManagerNew as PageManager } from './components/admin/PageManagerNew';
// import { BlockManager as BlockManagerOld } from './components/admin/BlockManager';
import { BlockManagerNew as BlockManager } from './components/admin/BlockManagerNew';
// import { StaticContentEditor as StaticContentEditorOld } from './components/admin/StaticContentEditor';
import { StaticContentEditorNew as StaticContentEditor } from './components/admin/StaticContentEditorNew';
import { GridEditor } from './components/admin/GridEditor';
// import { default as GalleryEditorOld } from './components/admin/GalleryEditor';
import { GalleryEditorNew as GalleryEditor } from './components/admin/GalleryEditorNew';
import { MediaLibrary } from './components/admin/MediaLibrary';
import { LogoList, LogoEditor } from './components/admin/LogoDesigner';
import { HeroEditor } from './components/admin/HeroEditor';
import { CardTeamEditorPage } from './components/admin/CardTeamEditorPage';
import { CardServiceEditorPage } from './components/admin/CardServiceEditorPage';
import { CardTestimonialEditorPage } from './components/admin/CardTestimonialEditorPage';
import { GenericCardEditorPage } from './components/admin/GenericCardEditorPage';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { UserManagement } from './components/superadmin/UserManagement';
import { CardTemplatesPage } from './pages/superadmin/CardTemplatesPage';
import { CardTemplateEditorPage } from './pages/superadmin/CardTemplateEditorPage';
import { DynamicPage } from './components/DynamicPage';
import ThemeManager from './components/ThemeManager';
import { TypographyEditor } from './components/admin/TypographyEditor';

function AppContent() {
  const { customerId, loading } = useCustomerId();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
                            <SuperAdminDashboard />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/superadmin/users"
                        element={
                        <ProtectedRoute>
                            <UserManagement />
                        </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Login />} />
                 </Routes>
             </Router>
         )
      }

      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/general"
            element={
              <ProtectedRoute>
                <GeneralEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <SettingsEditor />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/admin/settings-old"
            element={
              <ProtectedRoute>
                <SettingsEditorOld />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute>
                <ServicesEditor />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/admin/services-old"
            element={
              <ProtectedRoute>
                <ServicesEditorOld />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/admin/contact"
            element={
              <ProtectedRoute>
                <ContactEditor />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/admin/contact-old"
            element={
              <ProtectedRoute>
                <ContactEditorOld />
              </ProtectedRoute>
            }
          /> */}
          {/* Hours Editor - REMOVED */}
          {/* <Route
            path="/admin/hours"
            element={
              <ProtectedRoute>
                <HoursEditor />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/admin/hours-old"
            element={
              <ProtectedRoute>
                <HoursEditorOld />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute>
                <ReviewsEditor />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/admin/reviews-old"
            element={
              <ProtectedRoute>
                <ReviewsEditorOld />
              </ProtectedRoute>
            }
          /> */}
          {/* About Editor - REMOVED */}
          {/* <Route
            path="/admin/about"
            element={
              <ProtectedRoute>
                <AboutEditor />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/admin/about-old"
            element={
              <ProtectedRoute>
                <AboutEditorOld />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/admin/pricing"
            element={
              <ProtectedRoute>
                <PricingEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/export"
            element={
              <ProtectedRoute>
                <DataExport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              <ProtectedRoute>
                <GalleryEditor />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/admin/gallery-old"
            element={
              <ProtectedRoute>
                <GalleryEditorOld />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/admin/pages"
            element={
              <ProtectedRoute>
                <PageManager />
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
                <BlockManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blocks/:pageId"
            element={
              <ProtectedRoute>
                <BlockManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/static-content"
            element={
              <ProtectedRoute>
                <StaticContentEditor />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/admin/static-content-old"
            element={
              <ProtectedRoute>
                <StaticContentEditorOld />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/admin/grid"
            element={
              <ProtectedRoute>
                <GridEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/theme"
            element={
              <ProtectedRoute>
                <ThemeManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/typography"
            element={
              <ProtectedRoute>
                <TypographyEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/media"
            element={
              <ProtectedRoute>
                <MediaLibrary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logos"
            element={
              <ProtectedRoute>
                <LogoList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logos/:id"
            element={
              <ProtectedRoute>
                <LogoEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hero/:pageId/:blockId"
            element={
              <ProtectedRoute>
                <HeroEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/card-team/:pageId/:blockId"
            element={
              <ProtectedRoute>
                <CardTeamEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/card-service/:pageId/:blockId"
            element={
              <ProtectedRoute>
                <CardServiceEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/card-testimonial/:pageId/:blockId"
            element={
              <ProtectedRoute>
                <CardTestimonialEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/generic-card/:pageId/:blockId"
            element={
              <ProtectedRoute>
                <GenericCardEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/stockphotos"
            element={
              <ProtectedRoute>
                <MediaLibrary stockOnly={true} isSuperAdmin={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/card-templates"
            element={
              <ProtectedRoute>
                <CardTemplatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/card-templates/:templateId"
            element={
              <ProtectedRoute>
                <CardTemplateEditorPage />
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
      <AppContent />
    </AuthProvider>
  );
}

export default App;
