import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import RoleBasedLayout from "@/components/RoleBasedLayout";
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
import FamilyAccess from './pages/FamilyAccess';
import FamilyAccessPortal from './components/FamilyAccessPortal';
import FamilySupervisionPanel from './components/FamilySupervisionPanel';
import CompatibilityTest from "./pages/CompatibilityTest";
import CompatibilityInsightsPage from "./pages/CompatibilityInsights";
import EnhancedProfile from "./pages/EnhancedProfile";
import NotFound from "./pages/NotFound";
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
          <Routes>
            {/* Public routes - no authentication required */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/invitation" element={<InvitationAuth />} />
            
            {/* Protected routes - wrapped in RoleBasedLayout */}
            <Route path="/*" element={
              <RoleBasedLayout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/enhanced-profile" element={<EnhancedProfile />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat/:matchId" element={<Chat />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/family" element={<Family />} />
                  <Route path="/guidance" element={<Guidance />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/moderation-test" element={<ModerationTest />} />
                  <Route path="/wali-dashboard" element={<WaliDashboard />} />
                  <Route path="/match-approval" element={<MatchApproval />} />
                  <Route path="/family-analytics" element={<FamilyAnalyticsPage />} />
                  <Route path="/moderation-tests" element={<ModerationTests />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/islamic-tools" element={<IslamicTools />} />
                  <Route path="/family-supervision" element={<FamilySupervision />} />
                  <Route path="/family-notifications" element={<FamilyNotifications />} />
                  <Route path="/family-access" element={<FamilyAccess />} />
                  <Route path="/family-portal" element={<FamilyAccessPortal />} />
                  <Route path="/family-supervision-panel" element={<FamilySupervisionPanel />} />
                  <Route path="/compatibility-test" element={<CompatibilityTest />} />
                  <Route path="/compatibility-insights" element={<CompatibilityInsightsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </RoleBasedLayout>
            } />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
