import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/contexts/UserDataContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isWali, profileComplete, loading: dataLoading } = useUserData();
  const location = useLocation();

  // Show loading spinner while checking auth/profile
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald mx-auto"></div>
          <p className="text-sm text-muted-foreground">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Skip onboarding check for onboarding pages
  if (location.pathname === '/onboarding' || location.pathname === '/wali-onboarding') {
    return <>{children}</>;
  }

  // Also skip onboarding check for profile, dashboard, and settings
  // These pages will handle their own onboarding status checks
  // Settings should always be accessible so users can log out if stuck
  if (
    location.pathname === '/profile' ||
    location.pathname === '/dashboard' ||
    location.pathname === '/settings' ||
    location.pathname.startsWith('/profile/')
  ) {
    return <>{children}</>;
  }

  // Redirect to onboarding if profile is incomplete and onboarding is required
  if (requireOnboarding && !profileComplete) {
    // Prevent redirect loop: only redirect if not already on an exempt page
    const exemptPages = ['/onboarding', '/wali-onboarding', '/profile', '/dashboard', '/settings'];
    const shouldRedirect = !exemptPages.some(page => location.pathname.startsWith(page));

    if (shouldRedirect) {
      // Redirect Walis to wali-onboarding, regular users to onboarding
      const onboardingPath = isWali ? '/wali-onboarding' : '/onboarding';
      return <Navigate to={onboardingPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
