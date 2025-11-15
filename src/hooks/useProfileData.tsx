import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

// Strict types from Supabase schema
type Profile = Database['public']['Tables']['profiles']['Row'];
type IslamicPreferences = Database['public']['Tables']['islamic_preferences']['Row'];
type PrivacySettings = Database['public']['Tables']['privacy_settings']['Row'];
type UserVerification = Database['public']['Tables']['user_verifications']['Row'];
type MatchingPreferences = Database['public']['Tables']['matching_preferences']['Row'];

/**
 * Complete profile data including all related settings and preferences
 */
export interface ProfileData {
  profile: Profile | null;
  islamicPreferences: IslamicPreferences | null;
  privacySettings: PrivacySettings | null;
  userVerifications: UserVerification | null;
  matchingPreferences: MatchingPreferences | null;
}

/**
 * Return type for useProfileData hook
 */
interface UseProfileDataReturn {
  data: ProfileData | undefined;
  loading: boolean;
  error: string | undefined;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage complete user profile data
 * Includes profile, Islamic preferences, privacy settings, verifications, and matching preferences
 */
export const useProfileData = (): UseProfileDataReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<ProfileData | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchProfileData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(undefined);

      // Fetch all profile data in parallel with proper type inference
      const [
        profileResult,
        islamicPrefsResult,
        privacyResult,
        verificationsResult,
        matchingPrefsResult,
      ] = await Promise.allSettled([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('islamic_preferences').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('privacy_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_verifications').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('matching_preferences').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      // Process results with strict type casting
      const profile: Profile | null =
        profileResult.status === 'fulfilled' ? (profileResult.value.data ?? null) : null;

      const islamicPreferences: IslamicPreferences | null =
        islamicPrefsResult.status === 'fulfilled' ? (islamicPrefsResult.value.data ?? null) : null;

      const privacySettings: PrivacySettings | null =
        privacyResult.status === 'fulfilled' ? (privacyResult.value.data ?? null) : null;

      const userVerifications: UserVerification | null =
        verificationsResult.status === 'fulfilled'
          ? (verificationsResult.value.data ?? null)
          : null;

      const matchingPreferences: MatchingPreferences | null =
        matchingPrefsResult.status === 'fulfilled'
          ? (matchingPrefsResult.value.data ?? null)
          : null;

      // Check for errors with proper type handling
      const errors: Error[] = [
        profileResult.status === 'rejected' ? (profileResult.reason as Error) : undefined,
        islamicPrefsResult.status === 'rejected' ? (islamicPrefsResult.reason as Error) : undefined,
        privacyResult.status === 'rejected' ? (privacyResult.reason as Error) : undefined,
        verificationsResult.status === 'rejected'
          ? (verificationsResult.reason as Error)
          : undefined,
        matchingPrefsResult.status === 'rejected'
          ? (matchingPrefsResult.reason as Error)
          : undefined,
      ].filter((err): err is Error => err !== undefined);

      if (errors.length > 0) {
        console.error('Profile data fetch errors:', errors);
        setError('Erreur lors du chargement des données de profil');
        return;
      }

      setData({
        profile,
        islamicPreferences,
        privacySettings,
        userVerifications,
        matchingPreferences,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Error fetching profile data:', errorMessage, err);
      setError('Erreur inattendue lors du chargement');

      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only re-fetch when user ID changes

  return {
    data,
    loading,
    error,
    refetch: fetchProfileData,
  };
};
