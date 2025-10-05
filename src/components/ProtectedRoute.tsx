import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasCompleteProfile, setHasCompleteProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      console.log('🔒 ProtectedRoute - Checking profile for user:', user?.id);
      
      if (!user) {
        console.log('🔒 No user, setting profileLoading to false');
        setProfileLoading(false);
        return;
      }

      try {
        console.log('🔒 Fetching profile data...');
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('bio, looking_for')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('🔒 Error fetching profile:', error);
          // Don't block access on error - let the page handle it
          setHasCompleteProfile(false);
          setProfileLoading(false);
          return;
        }

        console.log('🔒 Profile data:', profile);
        
        // Consider profile complete if both bio and looking_for are filled
        const isComplete = profile && profile.bio && profile.looking_for;
        console.log('🔒 Profile complete:', isComplete);
        setHasCompleteProfile(!!isComplete);
      } catch (error) {
        console.error('🔒 Exception checking profile:', error);
        setHasCompleteProfile(false);
      } finally {
        console.log('🔒 Setting profileLoading to false');
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, [user]);

  // Show loading spinner while checking auth/profile
  if (loading || profileLoading) {
    console.log('🔒 ProtectedRoute - Loading state:', { loading, profileLoading, hasUser: !!user });
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

  // Skip onboarding check for onboarding page itself
  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }

  // Redirect to onboarding if profile is incomplete and onboarding is required
  if (requireOnboarding && !hasCompleteProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;