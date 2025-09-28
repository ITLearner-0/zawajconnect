import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthSessionState {
  session: Session | null;
  loading: boolean;
  isValid: boolean;
  isNearExpiry: boolean;
}

export const useAuthSession = () => {
  const [state, setState] = useState<AuthSessionState>({
    session: null,
    loading: true,
    isValid: false,
    isNearExpiry: false
  });
  const { toast } = useToast();

  const checkSessionValidity = useCallback((session: Session | null): boolean => {
    if (!session?.expires_at) return false;
    const expiryTime = new Date(session.expires_at * 1000);
    return expiryTime > new Date();
  }, []);

  const checkSessionExpiry = useCallback((session: Session | null): boolean => {
    if (!session?.expires_at) return false;
    const expiryTime = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeDiff = expiryTime.getTime() - now.getTime();
    return timeDiff <= 5 * 60 * 1000; // 5 minutes
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (data.session) {
        setState(prev => ({
          ...prev,
          session: data.session,
          isValid: checkSessionValidity(data.session),
          isNearExpiry: checkSessionExpiry(data.session)
        }));
        return { success: true, session: data.session };
      }
      return { success: false, error: 'No session returned' };
    } catch (error: any) {
      console.error('Session refresh failed:', error);
      return { success: false, error: error.message };
    }
  }, [checkSessionValidity, checkSessionExpiry]);

  const getCurrentSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Get session error:', error);
        setState(prev => ({ ...prev, session: null, isValid: false, loading: false }));
        return { success: false, session: null, error: error.message };
      }

      const isValid = checkSessionValidity(session);
      const isNearExpiry = checkSessionExpiry(session);

      setState(prev => ({
        ...prev,
        session,
        isValid,
        isNearExpiry,
        loading: false
      }));

      // Auto-refresh if near expiry
      if (session && isNearExpiry && isValid) {
        toast({
          title: "Session bientôt expirée",
          description: "Actualisation en cours...",
          duration: 3000
        });
        await refreshSession();
      }

      return { success: true, session, isValid };
    } catch (error: any) {
      console.error('Unexpected error getting session:', error);
      setState(prev => ({ ...prev, session: null, isValid: false, loading: false }));
      return { success: false, session: null, error: error.message };
    }
  }, [checkSessionValidity, checkSessionExpiry, refreshSession, toast]);

  // Set up auth state listener and initial session check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const isValid = checkSessionValidity(session);
        const isNearExpiry = checkSessionExpiry(session);
        
        setState(prev => ({
          ...prev,
          session,
          isValid,
          isNearExpiry,
          loading: false
        }));

        if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed successfully');
        }
      }
    );

    // Initialize session
    getCurrentSession();

    return () => subscription.unsubscribe();
  }, [getCurrentSession, checkSessionValidity, checkSessionExpiry]);

  // Auto-refresh timer for sessions near expiry
  useEffect(() => {
    if (!state.session || !state.isNearExpiry || !state.isValid) return;

    const interval = setInterval(async () => {
      if (state.isNearExpiry && state.isValid) {
        await refreshSession();
      }
    }, 2 * 60 * 1000); // Check every 2 minutes

    return () => clearInterval(interval);
  }, [state.session, state.isNearExpiry, state.isValid, refreshSession]);

  return {
    session: state.session,
    loading: state.loading,
    isValid: state.isValid,
    isNearExpiry: state.isNearExpiry,
    getCurrentSession,
    refreshSession
  };
};