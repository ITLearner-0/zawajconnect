
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NearbyMatches from "./pages/NearbyMatches";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";

function App() {
  return (
    <AccessibilityProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/nearby" element={<NearbyMatches />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AccessibilityProvider>
  );
}

export default App;
