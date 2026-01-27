import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { GeneralEditor } from './components/admin/GeneralEditor';
import { ServicesEditor } from './components/admin/ServicesEditor';
import { ContactEditor } from './components/admin/ContactEditor';
import { HoursEditor } from './components/admin/HoursEditor';
import { ReviewsEditor } from './components/admin/ReviewsEditor';
import { AboutEditor } from './components/admin/AboutEditor';
import { PricingEditor } from './components/admin/PricingEditor';
import { DataExport } from './components/admin/DataExport';
import { PageManager } from './components/admin/PageManager';
import { BlockManager } from './components/admin/BlockManager';
import { StaticContentEditor } from './components/admin/StaticContentEditor';
import { default as GalleryEditor } from './components/admin/GalleryEditor';
import { DynamicPage } from './components/DynamicPage';

function App() {
  return (
    <AuthProvider>
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
            path="/admin/services"
            element={
              <ProtectedRoute>
                <ServicesEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contact"
            element={
              <ProtectedRoute>
                <ContactEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hours"
            element={
              <ProtectedRoute>
                <HoursEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute>
                <ReviewsEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/about"
            element={
              <ProtectedRoute>
                <AboutEditor />
              </ProtectedRoute>
            }
          />
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
          <Route
            path="/admin/pages"
            element={
              <ProtectedRoute>
                <PageManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/page-builder/:pageId"
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
