// src/components/GuestRoute.js
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function GuestRoute({ children }) {
  const { token } = useSelector((state) => state.user);
  
  // If user is already authenticated, redirect to appropriate dashboard
  if (token) {
    const { user } = useSelector((state) => state.user);
    return <Navigate to={user?.is_admin ? "/admin" : "/dashboard"} replace />;
  }
  
  return children;
}