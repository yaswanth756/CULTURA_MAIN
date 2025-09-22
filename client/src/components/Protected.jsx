import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust path

const ProtectedRoute = () => {
  const { user } = useAuth(); // assuming you store user in AuthContext

  // if no user -> redirect to main
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
