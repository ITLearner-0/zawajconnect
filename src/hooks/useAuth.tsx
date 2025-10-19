import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  plan_duration: number | null;
  months_remaining: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionStatus;
  checkSubscription: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    product_id: null,
    subscription_end: null,
    plan_duration: null,
    months_remaining: null,
  });

  const checkSubscription = async () => {
    if (!user) {
      setSubscription({ 
        subscribed: false, 
        product_id: null, 
        subscription_end: null,
        plan_duration: null,
        months_remaining: null
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-braintree-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data) {
        setSubscription({
          subscribed: data.subscribed || false,
          product_id: data.plan_id || null,
          subscription_end: data.subscription_end || null,
          plan_duration: null,
          months_remaining: null,
        });
      }
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST - CRITICAL: Keep synchronous!
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // CRITICAL: Only synchronous state updates here to prevent deadlocks
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        // Handle session expiry events
        if (event === 'SIGNED_OUT' && session === null) {
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          setSubscription({ 
            subscribed: false, 
            product_id: null, 
            subscription_end: null,
            plan_duration: null,
            months_remaining: null
          });
        }
        
        // Update state synchronously
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Check subscription after auth state change (deferred with setTimeout)
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => checkSubscription(), 0);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('🔐 Initial session check:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Check subscription after initial session load
        if (session?.user) {
          setTimeout(() => checkSubscription(), 0);
        }
      } catch (error) {
        console.error('🔐 Exception during auth initialization:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => authSubscription.unsubscribe();
  }, []);

  // Auto-refresh subscription every minute
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/onboarding`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    subscription,
    checkSubscription,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Safe hook for components that might be rendered before AuthProvider is ready
export function useSafeAuth() {
  const context = useContext(AuthContext);
  return context || { 
    user: null, 
    session: null, 
    loading: true, 
    subscription: { 
      subscribed: false, 
      product_id: null, 
      subscription_end: null,
      plan_duration: null,
      months_remaining: null
    },
    checkSubscription: async () => {},
    signIn: async () => ({ error: null }), 
    signUp: async () => ({ error: null }), 
    signOut: async () => {} 
  };
}