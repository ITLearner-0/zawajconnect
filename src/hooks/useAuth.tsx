import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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
  signUp: (email: string, password: string, fullName: string, metadata?: {
    user_type?: 'wali' | 'candidate';
    invitation_token?: string;
    supervised_user_id?: string;
  }) => Promise<{ error: any }>;
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
    console.log('🔍 checkSubscription appelé, user:', user?.email);
    
    if (!user) {
      console.log('❌ Pas d\'utilisateur, subscription = false');
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
      console.log('📡 Appel DIRECT à la base avec TIMEOUT de 5s...');
      
      // TIMEOUT de 5 secondes pour éviter les blocages
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('subscriptions')
        .select('plan_type, expires_at, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      console.log('📡 Réponse de la base:', { data, error });
      
      if (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        setSubscription({ 
          subscribed: false, 
          product_id: null, 
          subscription_end: null,
          plan_duration: null,
          months_remaining: null
        });
        return;
      }

      // Vérifier si l'abonnement est valide
      const isValid = data && (!data.expires_at || new Date(data.expires_at) > new Date());
      
      const newSubscription = {
        subscribed: isValid,
        product_id: isValid ? data.plan_type : null,
        subscription_end: isValid ? data.expires_at : null,
        plan_duration: null,
        months_remaining: null,
      };
      
      console.log('✅ Mise à jour du statut subscription:', newSubscription);
      setSubscription(newSubscription);
    } catch (error: any) {
      if (error.message === 'Timeout') {
        console.warn('⏰ TIMEOUT sur checkSubscription - Fallback à non-premium');
      } else {
        console.error('❌ Exception dans checkSubscription:', error);
      }
      
      // Fallback sécurisé : non-premium par défaut
      setSubscription({ 
        subscribed: false, 
        product_id: null, 
        subscription_end: null,
        plan_duration: null,
        months_remaining: null
      });
      
      // Réessayer en arrière-plan après 10 secondes
      setTimeout(() => {
        console.log('🔄 Réessai en arrière-plan...');
        checkSubscription();
      }, 10000);
    }
  }, [user]);

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
  }, [checkSubscription]);

  // Auto-refresh subscription every minute
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

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