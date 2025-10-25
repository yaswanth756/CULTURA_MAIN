import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import LoadingDots from './components/LoadingDots';


// ✅ CRITICAL: Eager load only essential components
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/Protected';
import ProtectedVendorRoute from './vendor/components/ProtectedVendorRoute';


// ✅ OPTIMIZED: Lazy load all pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Test = lazy(() => import('./pages/Test'));
const Listings = lazy(() => import('./pages/Listings'));
const ListingDetails = lazy(() => import('./pages/ListingDetails'));
const SecurePayment = lazy(() => import('./pages/SecurePayment'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));


// Profile pages
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutMePanel = lazy(() => import('./components/profile/AboutMePanel'));
const BookingsPanel = lazy(() => import('./components/profile/BookingsPanel'));
const FavoritesPanel = lazy(() => import('./components/profile/FavoritesPanel'));
const ReviewsPanel = lazy(() => import('./components/profile/ReviewsPanel'));
const SettingsPanel = lazy(() => import('./components/profile/SettingsPanel'));


// Vendor pages
const VendorLayout = lazy(() => import('./vendor/components/VendorLayout'));
const VendorProfilePage = lazy(() => import('./vendor/pages/ProfilePage'));
const VendorListingsPage = lazy(() => import('./vendor/pages/ListingsPage'));
const VendorBookingsPage = lazy(() => import('./vendor/pages/BookingsPage'));
const VendorEarningsPage = lazy(() => import('./vendor/pages/EarningsPage'));
const VendorAnalyticsPage = lazy(() => import('./vendor/pages/AnalyticsPage'));
const Login = lazy(() => import('./vendor/pages/Login'));


// PROVIDERS
import { EventProvider } from './context/EventContext';
import { AuthProvider } from './context/AuthContext';
import { VendorProvider } from './vendor/context/VendorContext';


// Wraps vendor routes with provider and an Outlet so nested routes render correctly
const VendorProviderLayout = () => (
  <VendorProvider>
    <Outlet />
  </VendorProvider>
);


function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* ------------------ USER ROUTES ------------------ */}
        <Route element={
          <EventProvider>
            <AuthProvider>
              <MainLayout />
            </AuthProvider>
          </EventProvider>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/browse" element={<Suspense fallback={<LoadingDots />}><Listings /></Suspense>} />
          <Route path="/listing/:id" element={<Suspense fallback={<LoadingDots />}><ListingDetails /></Suspense>} />
          <Route path="/securepayment/:id" element={<SecurePayment />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />


          {/* Protected Profile Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />}>
              <Route index element={<Navigate to="about" replace />} />
              <Route path="about" element={<AboutMePanel />} />
              <Route path="bookings" element={<BookingsPanel />} />
              <Route path="favorites" element={<FavoritesPanel />} />
              <Route path="reviews" element={<ReviewsPanel />} />
              <Route path="settings" element={<SettingsPanel />} />
            </Route>
          </Route>
        </Route>


        {/* ------------------ VENDOR ROUTES ------------------ */}
        <Route element={<VendorProviderLayout />}>
          <Route path="/vendor/login" element={<Login />} />
          <Route path="/vendor/dashboard" element={
            <ProtectedVendorRoute>
              <VendorLayout />
            </ProtectedVendorRoute>
          }>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<VendorProfilePage />} />
            <Route path="listings" element={<VendorListingsPage />} />
            <Route path="bookings" element={<VendorBookingsPage />} />
            <Route path="earnings" element={<VendorEarningsPage />} />
            <Route path="analytics" element={<VendorAnalyticsPage />} />
          </Route>
        </Route>
        <Route path="/all-services" element={<Navigate to="/browse" replace />} />
      </Routes>
    </Suspense>
  );
}


export default App;
