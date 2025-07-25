import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Services from './pages/Services';
import Contact from './pages/Contact';
import About from './pages/About';
import Profile from './pages/Profile';
import ProviderDashboard from './pages/ProviderDashboard';
import Bookings from './pages/Bookings';
import BecomeProvider from './pages/BecomeProvider';
import ProviderRegistration from './pages/ProviderRegistration';
import ProviderLogin from './pages/ProviderLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminSetup from './pages/AdminSetup';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/provider-dashboard" element={<ProviderDashboard />} />
            <Route path="/dashboard" element={<ProviderDashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/become-provider" element={<BecomeProvider />} />
            <Route path="/provider-registration" element={<ProviderRegistration />} />
            <Route path="/provider-login" element={<ProviderLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;