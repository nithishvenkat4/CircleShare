import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoadingSpinner from './components/LoadingSpinner';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import MyBookings from './pages/MyBookings';
import Notifications from './pages/Notifications';
import AdminAnalytics from './pages/AdminAnalytics';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function AppLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={() => setMenuOpen((o) => !o)} />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner page />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/browse" element={
        <ProtectedRoute><AppLayout><Browse /></AppLayout></ProtectedRoute>
      } />
      <Route path="/listings/new" element={
        <ProtectedRoute><AppLayout><CreateListing /></AppLayout></ProtectedRoute>
      } />
      <Route path="/listings/:id" element={
        <ProtectedRoute><AppLayout><ListingDetail /></AppLayout></ProtectedRoute>
      } />
      <Route path="/bookings" element={
        <ProtectedRoute><AppLayout><MyBookings /></AppLayout></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><AppLayout><AdminAnalytics /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
