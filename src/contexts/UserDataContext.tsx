import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface UserDataContextType {
  isAdmin: boolean;
  isWali: boolean;
  profileComplete: boolean;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWali, setIsWali] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const refreshUserData = async () => {
    // Protection contre boucle infinie - mais permet le refresh si on demande explicitement
    if (!user || fetchingRef.current) {
      setLoading(false);
      return;
    }

    fetchingRef.current = true;

    try {
      // Une seule requête parallèle pour toutes les données
      const [adminResult, waliResult, profileResult] = await Promise.all([
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['super_admin', 'admin', 'moderator'])
          .maybeSingle(),
        supabase
          .from('family_members')
          .select('id')
          .eq('invited_user_id', user.id)
          .eq('is_wali', true)
          .eq('invitation_status', 'accepted')
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('full_name, onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      const adminData = adminResult.data;
      const waliData = waliResult.data;
      const profile = profileResult.data;

      setIsAdmin(!!adminData);
      setIsWali(!!waliData);
      
      // Use onboarding_completed field for profile completion status
      const isComplete = waliData 
        ? !!(profile?.full_name && profile.full_name.trim().length > 0)
        : !!(profile?.onboarding_completed);
      
      setProfileComplete(isComplete);
      lastUserIdRef.current = user.id;
    } catch (error) {
      // Log error for debugging but don't block the UI
      logger.error('Failed to fetch user data', error, { userId: user.id });
      setIsAdmin(false);
      setIsWali(false);
      setProfileComplete(false);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (user) {
      // Always refresh when user changes or user is logged in
      refreshUserData();
    } else {
      // Reset state when user logs out
      setIsAdmin(false);
      setIsWali(false);
      setProfileComplete(false);
      setLoading(false);
      lastUserIdRef.current = null;
    }
  }, [user?.id]); // Dépendance sur user.id uniquement

  return (
    <UserDataContext.Provider value={{ isAdmin, isWali, profileComplete, loading, refreshUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  return context;
};
