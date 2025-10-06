// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Remove AuthProvider import
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

import Login from "./pages/auth/login";
import Recover from "./pages/auth/recover";
import Register from "./pages/auth/register";
import Dashboard from "./pages/dashboard";
import Admin from "./pages/admin";
import ProfilePage from "./pages/dashboard/ProfilePage";
import MusicPage from "./pages/dashboard/MusicInvestmentCard";
import VerifyEmail from "./pages/auth/VerifyEmail";
// import React = require("react");
// import React = require("react");

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Guest-only routes */}
        <Route path="/" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/recover" element={<GuestRoute><Recover /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/verify-email" element={<GuestRoute><VerifyEmail /></GuestRoute>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><MusicPage /></ProtectedRoute>} />
        
        {/* Admin-only route */}
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}