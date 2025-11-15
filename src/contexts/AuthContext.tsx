import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { useAuthActions } from '@/hooks/auth/useAuthActions';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: ((data: any) => Promise<any>) &
    ((email: string, password: string, fullName?: string, metadata?: any) => Promise<any>);
  signIn: ((data: any) => Promise<any>) & ((email: string, password: string) => Promise<any>);
  signOut: () => Promise<any>;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  subscription: {
    subscribed: boolean;
    product_id: string | null;
    subscription_end: string | null;
    plan_duration: number | null;
    months_remaining: number | null;
  };
  checkSubscription: () => Promise<void>;
}

export type { AuthContextType };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading: authLoading } = useAuthState();
  const {
    loading: actionsLoading,
    signUp: signUpAction,
    signIn: signInAction,
    signOut: signOutAction,
  } = useAuthActions();
  const [subscriptionData, setSubscriptionData] = useState<{
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  }>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });

  // Check subscription status when user changes
  const checkSubscription = async () => {
    if (!user) {
      setSubscriptionData({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
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

  useEffect(() => {
    checkSubscription();
  }, [user]);

  const loading = authLoading || actionsLoading;

  // Wrapper functions to support both old and new call signatures
  const signUp = async (emailOrData: any, password?: string, fullName?: string, metadata?: any) => {
    // Support both object and multiple parameters
    if (typeof emailOrData === 'object') {
      return signUpAction(emailOrData);
    } else {
      return signUpAction({
        email: emailOrData,
        password: password!,
        fullName,
        ...metadata,
      });
    }
  };

  const signIn = async (emailOrData: any, password?: string) => {
    // Support both object and multiple parameters
    if (typeof emailOrData === 'object') {
      return signInAction(emailOrData);
    } else {
      return signInAction({
        email: emailOrData,
        password: password!,
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut: signOutAction,
    ...subscriptionData,
    subscription: {
      subscribed: subscriptionData.subscribed,
      product_id: subscriptionData.subscription_tier,
      subscription_end: subscriptionData.subscription_end,
      plan_duration: null,
      months_remaining: null,
    },
    checkSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
