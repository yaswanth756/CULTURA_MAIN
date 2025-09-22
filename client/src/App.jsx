import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Home from './pages/Home';
import MainLayout from './components/MainLayout';
import Test from './pages/Test';
import Listings from './pages/Listings';
import ListingDetails from './pages/ListingDetails';
import SecurePayment from './pages/SecurePayment';
import ProtectedRoute from './components/Protected';

//////


import ProfilePage from "./pages/ProfilePage";
import AboutMePanel from "./components/profile/AboutMePanel";
import BookingsPanel from "./components/profile/BookingsPanel";
import FavoritesPanel from "./components/profile/FavoritesPanel";
import ReviewsPanel from "./components/profile/ReviewsPanel";
import SettingsPanel from "./components/profile/SettingsPanel";
function App() {

  return (
    
    <MainLayout>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/test" element={<Test/>} />
          <Route path="/browse" element={<Listings/>} />
          <Route path="/listing/:id" element={<ListingDetails/>} />
          <Route path="/securepayment/:id" element={<SecurePayment />} />
       

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
        </Routes>
    </MainLayout>

  
  );
}

export default App
