
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { SecurityProvider } from '@/components/security/SecurityProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import UserProfile from '@/pages/UserProfile';
import Compatibility from '@/pages/Compatibility';
import NearbyMatches from '@/pages/NearbyMatches';
import Messages from '@/pages/Messages';
import Resources from '@/pages/Resources';
import Demo from '@/pages/Demo';
import WaliDashboard from '@/pages/WaliDashboard';
import WaliSetup from '@/pages/WaliSetup';
import AdminModeration from '@/pages/AdminModeration';
import Subscription from '@/pages/Subscription';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SecurityProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/resources" element={<Resources />} />
                  
                  {/* Protected Routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile/:userId" element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/compatibility" element={
                    <ProtectedRoute>
                      <Compatibility />
                    </ProtectedRoute>
                  } />
                  <Route path="/nearby" element={
                    <ProtectedRoute>
                      <NearbyMatches />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages/:conversationId" element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription" element={
                    <ProtectedRoute>
                      <Subscription />
                    </ProtectedRoute>
                  } />
                  
                  {/* Wali Routes */}
                  <Route path="/wali/setup" element={
                    <ProtectedRoute>
                      <WaliSetup />
                    </ProtectedRoute>
                  } />
                  <Route path="/wali/dashboard" element={
                    <ProtectedRoute>
                      <WaliDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/moderation" element={
                    <AdminRoute>
                      <AdminModeration />
                    </AdminRoute>
                  } />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </SecurityProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
