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
      console.log('🔒 ProtectedRoute - START - Checking profile for user:', user?.id);
      console.log('🔒 Current path:', location.pathname);
      
      if (!user) {
        console.log('🔒 No user, setting profileLoading to false');
        setProfileLoading(false);
        return;
      }

      try {
        console.log('🔒 Step 1: Checking if user is a Wali...');
        
        // Check if user is a Wali (invited user)
        const { data: familyMember, error: familyError } = await supabase
          .from('family_members')
          .select('id, invitation_status, is_wali, user_id')
          .eq('invited_user_id', user.id)
          .eq('is_wali', true)
          .eq('invitation_status', 'accepted')
          .maybeSingle();

        if (familyError) {
          console.error('🔒 Error fetching family member:', familyError);
        }

        const userIsWali = !!familyMember;
        console.log('🔒 Step 1 Result - Is Wali:', userIsWali, 'Family member data:', familyMember);
        setIsWali(userIsWali);

        console.log('🔒 Step 2: Fetching profile data...');
        // Fetch all profile fields
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, bio, looking_for')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('🔒 Error fetching profile:', profileError);
          setHasCompleteProfile(false);
          setProfileLoading(false);
          return;
        }

        console.log('🔒 Step 2 Result - Profile data:', profile);
        
        // For Walis, only full_name is required
        // For regular users, bio and looking_for are required
        const isComplete = userIsWali 
          ? !!(profile?.full_name && profile.full_name.trim().length > 0)
          : !!(profile?.bio && profile?.looking_for);
        
        console.log('🔒 Step 3: Profile completion check');
        console.log('🔒 - Is Wali:', userIsWali);
        console.log('🔒 - Full name:', profile?.full_name);
        console.log('🔒 - Full name trimmed length:', profile?.full_name?.trim().length);
        console.log('🔒 - Bio:', profile?.bio);
        console.log('🔒 - Looking for:', profile?.looking_for);
        console.log('🔒 - Profile complete:', isComplete);
        
        setHasCompleteProfile(isComplete);
      } catch (error) {
        console.error('🔒 Exception checking profile:', error);
        setHasCompleteProfile(false);
      } finally {
        console.log('🔒 ProtectedRoute - END - Setting profileLoading to false');
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, [user, location.pathname]);

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