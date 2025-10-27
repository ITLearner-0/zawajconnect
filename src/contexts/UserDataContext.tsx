import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
  const [dataFetched, setDataFetched] = useState(false);

  const refreshUserData = async () => {
    if (!user || dataFetched) {
      setLoading(false);
      return;
    }

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
          .select('full_name, bio, looking_for')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      const adminData = adminResult.data;
      const waliData = waliResult.data;
      const profile = profileResult.data;

      setIsAdmin(!!adminData);
      setIsWali(!!waliData);
      
      const isComplete = waliData 
        ? !!(profile?.full_name && profile.full_name.trim().length > 0)
        : !!(profile?.bio && profile?.looking_for);
      
      setProfileComplete(isComplete);
      setDataFetched(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsAdmin(false);
      setIsWali(false);
      setProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !dataFetched) {
      refreshUserData();
    } else if (!user) {
      setIsAdmin(false);
      setIsWali(false);
      setProfileComplete(false);
      setLoading(false);
      setDataFetched(false);
    }
  }, [user]);

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
