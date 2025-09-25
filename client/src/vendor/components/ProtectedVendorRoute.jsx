// src/vendor/components/ProtectedVendorRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedVendorRoute = ({ children }) => {
  const token = localStorage.getItem('vendorToken');

  if (!token) {
    // Not logged in, redirect to vendor login
    return <Navigate to="/vendor/login" replace />;
  }

  // Logged in, allow access
  return children;
};

export default ProtectedVendorRoute;
