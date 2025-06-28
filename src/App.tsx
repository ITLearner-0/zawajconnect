
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/providers';
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
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Suspense } from 'react';
import './App.css';

function App() {
  console.log("App component rendering");
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Suspense fallback={<LoadingSpinner size="lg" text="Chargement de l'application..." centered />}>
          <AppProvider>
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
          </AppProvider>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
