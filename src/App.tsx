
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import NearbyMatches from './pages/NearbyMatches';
import Messages from './pages/Messages';
import AdminModeration from './pages/AdminModeration';
import WaliDashboard from './pages/WaliDashboard';
import Resources from './pages/Resources';
import Demo from './pages/Demo';
import UserProfile from './pages/UserProfile';
import Compatibility from './pages/Compatibility';
import Subscription from './pages/Subscription';
import Navigation from './components/layout/Navigation';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import AuthProvider from './contexts/AuthContext';
import { LazyLoadingProvider } from './hooks/useLazyLoading/context/LazyLoadingContext';
import GlobalErrorBoundary from './components/ui/GlobalErrorBoundary';
import RouteErrorBoundary from './components/ui/RouteErrorBoundary';

function App() {
  return (
    <GlobalErrorBoundary showHome={true}>
      <ThemeProvider>
        <AccessibilityProvider>
          <LazyLoadingProvider
            initialConfig={{
              enableAnalytics: true,
              enableDebug: process.env.NODE_ENV === 'development',
              batchSize: 8,
              preloadDistance: 300,
              networkOptimization: true,
              memoryOptimization: true,
            }}
          >
            <Router>
              <AuthProvider>
                <Navigation />
                <Routes>
                  <Route path="/" element={
                    <RouteErrorBoundary routeName="Home">
                      <Index />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/auth" element={
                    <RouteErrorBoundary routeName="Auth">
                      <Auth />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/profile" element={
                    <RouteErrorBoundary routeName="Profile">
                      <Profile />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/profile/:id" element={
                    <RouteErrorBoundary routeName="UserProfile">
                      <UserProfile />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/compatibility" element={
                    <RouteErrorBoundary routeName="Compatibility">
                      <Compatibility />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/nearby" element={
                    <RouteErrorBoundary routeName="NearbyMatches">
                      <NearbyMatches />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/messages" element={
                    <RouteErrorBoundary routeName="Messages">
                      <Messages />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/messages/:conversationId" element={
                    <RouteErrorBoundary routeName="Messages">
                      <Messages />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/admin/moderation" element={
                    <RouteErrorBoundary routeName="AdminModeration">
                      <AdminModeration />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/wali" element={
                    <RouteErrorBoundary routeName="WaliDashboard">
                      <WaliDashboard />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/resources" element={
                    <RouteErrorBoundary routeName="Resources">
                      <Resources />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/resources/:resourceId" element={
                    <RouteErrorBoundary routeName="Resources">
                      <Resources />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/demo" element={
                    <RouteErrorBoundary routeName="Demo">
                      <Demo />
                    </RouteErrorBoundary>
                  } />
                  <Route path="/subscription" element={
                    <RouteErrorBoundary routeName="Subscription">
                      <Subscription />
                    </RouteErrorBoundary>
                  } />
                  <Route path="*" element={
                    <RouteErrorBoundary routeName="NotFound">
                      <NotFound />
                    </RouteErrorBoundary>
                  } />
                </Routes>
              </AuthProvider>
            </Router>
          </LazyLoadingProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
