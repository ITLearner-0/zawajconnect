import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

interface UseAuthRedirectProps {
  user: User | null;
  loading: boolean;
  redirectTo?: string;
  redirectFrom?: string;
}

export const useAuthRedirect = ({
  user,
  loading,
  redirectTo = '/profile',
  redirectFrom = '/auth',
}: UseAuthRedirectProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user && window.location.pathname === redirectFrom) {
        navigate(redirectTo);
      } else if (!user && window.location.pathname !== redirectFrom) {
        navigate(redirectFrom);
      }
    }
  }, [user, loading, navigate, redirectTo, redirectFrom]);
};
