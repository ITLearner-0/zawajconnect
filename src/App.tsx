import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Privacy from "./pages/Privacy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Family from "./pages/Family";
import Guidance from "./pages/Guidance";
import ModerationTest from "./pages/ModerationTest";
import WaliDashboard from "./pages/WaliDashboard";
import WaliAccess from "./pages/WaliAccess";
import MatchApproval from "./pages/MatchApproval";
import FamilyAnalyticsPage from "./pages/FamilyAnalytics";
import ModerationTests from "./pages/ModerationTests";
import Admin from "./pages/Admin";
import FAQ from "./pages/FAQ";
import Settings from "./pages/Settings";
import IslamicTools from "./pages/IslamicTools";
import FamilySupervision from './pages/FamilySupervision';
import FamilyNotifications from './pages/FamilyNotifications';
import InvitationAuth from './pages/InvitationAuth';
import InvitationAccept from './pages/InvitationAccept';
import FamilyAccess from './pages/FamilyAccess';
import FamilyAccessPortal from './components/FamilyAccessPortal';
import FamilySupervisionPanel from './components/FamilySupervisionPanel';
import CompatibilityTest from "./pages/CompatibilityTest";
import CompatibilityInsightsPage from "./pages/CompatibilityInsights";
import EnhancedProfile from "./pages/EnhancedProfile";
import AdvancedMatching from "./pages/AdvancedMatching";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import NavigationGuard from "@/components/navigation/NavigationGuard";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import RouteTransition from "@/components/navigation/RouteTransition";
import { Toaster } from "@/components/ui/toaster";

// Create QueryClient outside component to avoid hook issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <NavigationProvider>
            <NavigationGuard>
              <RouteTransition>
                <Routes>
            {/* Public routes - no authentication required */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/wali" element={<WaliAccess />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/invitation-auth" element={<InvitationAuth />} />
            <Route path="/invitation" element={<InvitationAccept />} />
            <Route path="/invitation/accept" element={<InvitationAccept />} />
            
            {/* Onboarding - protected but doesn't require complete profile */}
            <Route path="/onboarding" element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            } />
            
            {/* Protected routes - wrapped in ProtectedRoute and RoleBasedLayout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Dashboard />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            <Route path="/enhanced-profile" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EnhancedProfile />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <EnhancedProfile />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/advanced-matching" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <AdvancedMatching />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/browse" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Browse />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/matches" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Matches />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/chat" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Chat />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/chat/:matchId" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Chat />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Profile />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/privacy" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Privacy />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/family" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Family />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/guidance" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Guidance />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Admin />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/moderation-test" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <ModerationTest />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/wali-dashboard" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <WaliDashboard />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/match-approval" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <MatchApproval />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/family-analytics" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <FamilyAnalyticsPage />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/moderation-tests" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <ModerationTests />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/faq" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <FAQ />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <Settings />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/islamic-tools" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <IslamicTools />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/family-supervision" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <FamilySupervision />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/family-notifications" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <FamilyNotifications />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/family-access" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <FamilyAccess />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/family-portal" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <FamilyAccessPortal />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/family-supervision-panel" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <FamilySupervisionPanel />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/compatibility-test" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <CompatibilityTest />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/compatibility-insights" element={
              <ProtectedRoute>
                <RoleBasedLayout>
                  <CompatibilityInsightsPage />
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
                </Routes>
              </RouteTransition>
            </NavigationGuard>
          </NavigationProvider>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;