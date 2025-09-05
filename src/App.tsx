import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
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
import Admin from "./pages/Admin";
import FAQ from "./pages/FAQ";
import Settings from "./pages/Settings";
import IslamicTools from "./pages/IslamicTools";
import FamilySupervision from "./pages/FamilySupervision";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";

// Create QueryClient with simple configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/chat/:matchId" element={<Chat />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/family" element={<Family />} />
              <Route path="/guidance" element={<Guidance />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/islamic-tools" element={<IslamicTools />} />
            <Route path="/family-supervision" element={<FamilySupervision />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
