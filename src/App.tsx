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
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Reviews from './components/Reviews';
import Gallery from './components/Gallery';
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Main Website Component
const MainWebsite = () => (
  <div className="min-h-screen">
    <Header />
    <Hero />
    <Services />
    <About />
    <Reviews />
    <Gallery />
    <Pricing />
    <Contact />
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainWebsite />} />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
