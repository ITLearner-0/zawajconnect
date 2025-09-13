import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getRouteByPath } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';

interface NavigationGuardProps {
  children: React.ReactNode;
}

const NavigationGuard = ({ children }: NavigationGuardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;

    const currentRoute = getRouteByPath(location.pathname);
    
    // Check if route requires authentication
    if (currentRoute?.requiresAuth && !user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive"
      });
      navigate('/auth', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // Check if route requires onboarding completion
    if (currentRoute?.requiresOnboarding && user && !user.user_metadata?.onboarding_completed) {
      toast({
        title: "Profil incomplet",
        description: "Veuillez compléter votre profil pour continuer.",
      });
      navigate('/onboarding', { replace: true });
      return;
    }

    // Check role-based access
    if (currentRoute?.roles && user) {
      const userRole = user.user_metadata?.role || 'user';
      if (!currentRoute.roles.includes(userRole)) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
          variant: "destructive"
        });
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [location.pathname, user, loading, navigate, toast]);

  return <>{children}</>;
};

export default NavigationGuard;