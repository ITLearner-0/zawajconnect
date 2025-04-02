
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
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<UserProfile />} />
              <Route path="/nearby" element={<NearbyMatches />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:conversationId" element={<Messages />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
              <Route path="/wali" element={<WaliDashboard />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/resources/:resourceId" element={<Resources />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

export default App;
