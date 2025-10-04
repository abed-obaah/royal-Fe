// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user } = useSelector((state) => state.user);
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If this route is admin-only but user is not admin, redirect to regular dashboard
  if (adminOnly && user && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}