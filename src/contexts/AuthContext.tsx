import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { useAuthActions } from '@/hooks/auth/useAuthActions';
import { useAuthRedirect } from '@/hooks/auth/useAuthRedirect';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: any) => Promise<any>;
  signIn: (data: any) => Promise<any>;
  signOut: () => Promise<any>;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading: authLoading } = useAuthState();
  const { loading: actionsLoading, signUp, signIn, signOut } = useAuthActions();
  const [subscriptionData, setSubscriptionData] = useState<{
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  }>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null
  });

  // Check subscription status when user changes
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setSubscriptionData({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        });
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        if (!error && data) {
          setSubscriptionData(data);
        }
      } catch (error) {
        console.error('Error checking subscription in AuthContext:', error);
      }
    };

    checkSubscription();
  }, [user]);

  const loading = authLoading || actionsLoading;

  // Keep existing useAuthRedirect
  useAuthRedirect({ user, loading });

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    ...subscriptionData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
