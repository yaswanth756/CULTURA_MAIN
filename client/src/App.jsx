import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// USER IMPORTS
import Home from './pages/Home';
import Test from './pages/Test';
import Listings from './pages/Listings';
import ListingDetails from './pages/ListingDetails';
import SecurePayment from './pages/SecurePayment';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/Protected';

import ProfilePage from "./pages/ProfilePage";
import AboutMePanel from "./components/profile/AboutMePanel";
import BookingsPanel from "./components/profile/BookingsPanel";
import FavoritesPanel from "./components/profile/FavoritesPanel";
import ReviewsPanel from "./components/profile/ReviewsPanel";
import SettingsPanel from "./components/profile/SettingsPanel";

// VENDOR IMPORTS
import VendorLayout from './vendor/components/VendorLayout';
import VendorProfilePage from './vendor/pages/ProfilePage';
import VendorListingsPage from './vendor/pages/ListingsPage';
import VendorBookingsPage from './vendor/pages/BookingsPage';
import VendorEarningsPage from './vendor/pages/EarningsPage';
import VendorAnalyticsPage from './vendor/pages/AnalyticsPage';
import ProtectedVendorRoute from './vendor/components/ProtectedVendorRoute';
import Login from './vendor/pages/Login';

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
          <Route path="/browse" element={<Listings />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/securepayment/:id" element={<SecurePayment />} />

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
      </Routes>

  );
}

export default App;
