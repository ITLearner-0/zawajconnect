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

  const [isWali, setIsWali] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        // UNE SEULE requête simple - pas de timeout, pas de retry
        const [{ data: profile }, { data: familyMember }] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name, bio, looking_for')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('family_members')
            .select('id, is_wali')
            .eq('invited_user_id', user.id)
            .eq('is_wali', true)
            .eq('invitation_status', 'accepted')
            .maybeSingle()
        ]);

        const userIsWali = !!familyMember;
        setIsWali(userIsWali);
        
        const isComplete = userIsWali 
          ? !!(profile?.full_name && profile.full_name.trim().length > 0)
          : !!(profile?.bio && profile?.looking_for);
        
        setHasCompleteProfile(isComplete);
      } catch (error) {
        // En cas d'erreur réseau, on laisse passer (profil considéré incomplet)
        setHasCompleteProfile(false);
      } finally {
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

  // Skip onboarding check for onboarding pages
  if (location.pathname === '/onboarding' || location.pathname === '/wali-onboarding') {
    return <>{children}</>;
  }

  // Redirect to onboarding if profile is incomplete and onboarding is required
  if (requireOnboarding && !hasCompleteProfile) {
    // Redirect Walis to wali-onboarding, regular users to onboarding
    const onboardingPath = isWali ? '/wali-onboarding' : '/onboarding';
    return <Navigate to={onboardingPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;