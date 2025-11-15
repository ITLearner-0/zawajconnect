import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { getRouteByPath } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';

interface NavigationGuardProps {
  children: React.ReactNode;
}

const NavigationGuard = ({ children }: NavigationGuardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Safely get auth state with error handling
  let user = null;
  let loading = true;
  let authError = false;

  try {
    const authState = useAuth();
    user = authState.user;
    loading = authState.loading;
  } catch (error) {
    console.warn('NavigationGuard: AuthProvider not ready yet, skipping auth checks');
    authError = true;
  }

  const { isAdmin, loading: adminLoading } = useIsAdmin();

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // If auth context is not available yet, skip navigation checks
    if (authError) return;
    if (loading || adminLoading) return;

    const currentRoute = getRouteByPath(location.pathname);

    // Check if route requires authentication
    if (currentRoute?.requiresAuth && !user) {
      toast({
        title: 'Authentification requise',
        description: 'Vous devez être connecté pour accéder à cette page.',
        variant: 'destructive',
      });
      navigate('/auth', {
        state: { from: location.pathname },
        replace: true,
      });
      return;
    }

    // Check if route requires onboarding completion
    if (currentRoute?.requiresOnboarding && user && !user.user_metadata?.onboarding_completed) {
      toast({
        title: 'Profil incomplet',
        description: 'Veuillez compléter votre profil pour continuer.',
      });
      navigate('/onboarding', { replace: true });
      return;
    }

    // Check role-based access - Use proper database role checking
    if (currentRoute?.roles && user) {
      // Special handling for admin routes
      if (currentRoute.roles.includes('admin')) {
        if (!isAdmin) {
          toast({
            title: 'Accès refusé',
            description: "Vous n'avez pas les permissions administrateur nécessaires.",
            variant: 'destructive',
          });
          navigate('/enhanced-profile', { replace: true });
          return;
        }
      }
      // For other roles, we can add similar logic here if needed
      // For now, admin is the main role we're checking
    }
  }, [location.pathname, user, loading, adminLoading, isAdmin, navigate, toast]);

  return <>{children}</>;
};

export default NavigationGuard;
