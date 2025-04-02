
import { useAuth } from '@/contexts/AuthContext';

export const useUserSession = () => {
  const { user, loading } = useAuth();
  
  return {
    currentUserId: user?.id || null,
    isAuthenticated: !!user,
    loading
  };
};
