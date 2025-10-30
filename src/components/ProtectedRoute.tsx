import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { state } = useApp();

  // Wait until auth state is hydrated to avoid redirect flash on refresh
  if (!state.authInitialized) {
    return null; // or a spinner component if available
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && state.user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
