import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string, metadata?: {
    user_type?: 'wali' | 'candidate';
    invitation_token?: string;
    supervised_user_id?: string;
  }) => Promise<{ error: AuthError | null }>;
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

  const checkSubscription = useCallback(async () => {
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
      // Requête simple - pas de timeout, pas de retry
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_type, expires_at, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;

      // Vérifier si l'abonnement est valide
      const isValid = data && (!data.expires_at || new Date(data.expires_at) > new Date());
      
      setSubscription({
        subscribed: !!isValid,
        product_id: isValid ? data.plan_type : null,
        subscription_end: isValid ? data.expires_at : null,
        plan_duration: null,
        months_remaining: null,
      });
    } catch (error) {
      // Fallback silencieux en cas d'erreur réseau
      setSubscription({ 
        subscribed: false, 
        product_id: null, 
        subscription_end: null,
        plan_duration: null,
        months_remaining: null
      });
    }
  }, [user]);

  useEffect(() => {
    // PROTECTION: Ne s'exécute qu'UNE SEULE FOIS au montage
    let mounted = true;
    
    // Set up auth state listener FIRST - CRITICAL: Keep synchronous!
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        // CRITICAL: Only synchronous state updates here to prevent deadlocks
        logger.auth.log('Auth state changed:', event, session?.user?.email);

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
        logger.auth.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logger.auth.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (!mounted) return;

        logger.auth.log('Initial session check:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Check subscription after initial session load
        if (session?.user) {
          setTimeout(() => checkSubscription(), 0);
        }
      } catch (error) {
        logger.auth.error('Exception during auth initialization:', error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      authSubscription.unsubscribe();
    };
  }, []); // VIDE - ne s'exécute qu'au montage !

  // Subscribe to real-time subscription changes instead of polling
  useEffect(() => {
    if (!user) return;

    // Initial check
    checkSubscription();

    // Set up real-time subscription to subscriptions table
    const channel = supabase
      .channel(`subscription-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          logger.api.log('Subscription changed via Realtime:', payload.eventType);
          // Update subscription state immediately
          checkSubscription();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.realtime.log('Subscribed to subscription changes');
        }
      });

    return () => {
      logger.realtime.log('Unsubscribing from subscription changes');
      supabase.removeChannel(channel);
    };
  }, [user?.id, checkSubscription]); // Depend on user.id and checkSubscription

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string,
    metadata?: {
      user_type?: 'wali' | 'candidate';
      invitation_token?: string;
      supervised_user_id?: string;
    }
  ) => {
    // Determine redirect based on user type
    const redirectPath = metadata?.user_type === 'wali' 
      ? `/wali-onboarding${metadata.invitation_token ? `?token=${metadata.invitation_token}` : ''}`
      : '/onboarding';
    
    const redirectUrl = `${window.location.origin}${redirectPath}`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          user_type: metadata?.user_type || 'candidate',
          invitation_token: metadata?.invitation_token,
          supervised_user_id: metadata?.supervised_user_id,
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