
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Compatibility from "./pages/Compatibility";
import Messages from "./pages/Messages";
import NearbyMatches from "./pages/NearbyMatches";
import Resources from "./pages/Resources";
import Demo from "./pages/Demo";
import WaliDashboard from "./pages/WaliDashboard";
import WaliSetup from "./pages/WaliSetup";
import AdminModeration from "./pages/AdminModeration";
import NotFound from "./pages/NotFound";
import Subscription from "./pages/Subscription";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import StandardLoadingState from "./components/ui/StandardLoadingState";
import { AppProvider } from "./providers";
import "./App.css";

console.log("App component rendering");

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Suspense fallback={<StandardLoadingState loading={true} loadingText="Chargement de la page..." />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/compatibility" element={<Compatibility />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/nearby" element={<NearbyMatches />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/wali-dashboard" element={<WaliDashboard />} />
            <Route path="/wali-setup" element={<WaliSetup />} />
            <Route path="/admin" element={<AdminModeration />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </AppProvider>
  );
}

export default App;
