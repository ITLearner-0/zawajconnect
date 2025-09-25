import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.id);
        
        // Handle token refresh events
        if (event === 'TOKEN_REFRESHED') {
          console.log('✅ Token refreshed successfully');
        }
        
        // Handle session expiry with emergency backup
        if (event === 'SIGNED_OUT' && session === null) {
          console.log('⚠️ User signed out - triggering emergency backup');
          // Trigger emergency backup before clearing session
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
        
        // Validate session if it exists
        if (session) {
          try {
            // Test if the session is actually valid by making a simple query
            const { error } = await supabase.auth.getUser();
            if (error) {
              console.error('❌ Session validation failed:', error);
              // Force sign out if session is invalid
              await supabase.auth.signOut();
              return;
            }
          } catch (error) {
            console.error('❌ Session validation error:', error);
            await supabase.auth.signOut();
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session with error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          // Clear invalid sessions
          if (error.message?.includes('Invalid') || 
              error.message?.includes('JWT') || 
              error.message?.includes('expired')) {
            console.log('🧹 Clearing expired session');
            localStorage.removeItem('supabase.auth.token');
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          }
        } else if (session) {
          // Validate the session by testing auth.uid()
          try {
            const { data: user, error: userError } = await supabase.auth.getUser();
            if (userError || !user?.user) {
              console.error('❌ User validation failed:', userError);
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
            } else {
              setSession(session);
              setUser(session.user);
            }
          } catch (error) {
            console.error('❌ User validation error:', error);
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          }
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

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
  return context || { user: null, session: null, loading: true, signIn: async () => ({ error: null }), signUp: async () => ({ error: null }), signOut: async () => {} };
}