// DEPRECATED: Use useUserData from UserDataContext instead
// This hook is kept for backward compatibility but now uses the centralized cache
import { useUserData } from '@/contexts/UserDataContext';

export const useIsAdmin = () => {
  const { isAdmin, loading } = useUserData();
  return { isAdmin, loading };
};
