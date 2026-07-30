import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

// Public pages
import Home from '../pages/Home/Home';
import About from '../pages/About/About';
import Services from '../pages/Services/Services';
import Contact from '../pages/Contact/Contact';
import Nearby from '../pages/Nearby/Nearby';
import WorkerDetails from '../pages/WorkerDetails/WorkerDetails';
import Offers from '../pages/Offers/Offers';
import CreateProviderProfile from '../pages/CreateProviderProfile/CreateProviderProfile';
import NotFound from '../pages/NotFound/NotFound';

// Auth pages
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';

// Protected pages
import Chat from '../pages/Chat/Chat';
import Community from '../pages/Community/Community';
import Favorites from '../pages/Favorites/Favorites';
import Profile from '../pages/Profile/Profile';
import ProviderDashboard from '../pages/ProviderDashboard/ProviderDashboard';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/nearby" element={<Nearby />} />
      <Route path="/worker/:id" element={<WorkerDetails />} />
      <Route path="/offers" element={<Offers />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes – Require Login */}
      <Route path="/chat" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/chat/:id" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/community" element={
        <ProtectedRoute>
          <Community />
        </ProtectedRoute>
      } />
      <Route path="/favorites" element={
        <ProtectedRoute>
          <Favorites />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      {/* Provider Routes – Require Provider or Admin Role ONLY */}
      <Route path="/become-provider" element={
        <ProtectedRoute roles={['provider', 'admin']}>
          <CreateProviderProfile />
        </ProtectedRoute>
      } />
      <Route path="/provider-dashboard" element={
        <ProtectedRoute roles={['provider', 'admin']}>
          <ProviderDashboard />
        </ProtectedRoute>
      } />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
