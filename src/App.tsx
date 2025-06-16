
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Messages from "./pages/Messages";
import Compatibility from "./pages/Compatibility";
import Demo from "./pages/Demo";
import Resources from "./pages/Resources";
import AdminModeration from "./pages/AdminModeration";
import WaliDashboard from "./pages/WaliDashboard";
import NearbyMatches from "./pages/NearbyMatches";
import Subscription from "./pages/Subscription";
import Matches from "./pages/Matches";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalErrorBoundary>
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<UserProfile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/compatibility" element={<Compatibility />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/admin" element={<AdminModeration />} />
                <Route path="/wali" element={<WaliDashboard />} />
                <Route path="/nearby" element={<NearbyMatches />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/support" element={<Support />} />
                <Route path="/notifications" element={<Notifications />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AccessibilityProvider>
      </GlobalErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
