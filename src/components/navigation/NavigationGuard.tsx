import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface NavigationGuardProps {
  children: React.ReactNode;
}

const NavigationGuard = ({ children }: NavigationGuardProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't do anything while auth is loading
    if (loading) return;

    // Redirect authenticated users from auth pages
    if (user && location.pathname === '/auth') {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Redirect authenticated users from landing page to dashboard
    if (user && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Show welcome message for new users on dashboard
    if (user && location.pathname === '/dashboard') {
      const hasShownWelcome = sessionStorage.getItem('welcome-shown');
      if (!hasShownWelcome) {
        setTimeout(() => {
          toast({
            title: "Bienvenue sur NikahConnect!",
            description: "Complétez votre profil pour commencer à découvrir des matches compatibles.",
          });
          sessionStorage.setItem('welcome-shown', 'true');
        }, 1000);
      }
    }
  }, [user, loading, location.pathname, navigate]);

  return <>{children}</>;
};

export default NavigationGuard;