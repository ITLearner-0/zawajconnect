import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProfileData {
  profile: any;
  islamicPreferences: any;
  privacySettings: any;
  userVerifications: any;
  matchingPreferences: any;
}

interface UseProfileDataReturn {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProfileData = (): UseProfileDataReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all profile data in parallel
      const [
        profileResult,
        islamicPrefsResult,
        privacyResult,
        verificationsResult,
        matchingPrefsResult
      ] = await Promise.allSettled([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('islamic_preferences').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('privacy_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_verifications').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('matching_preferences').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      // Process results
      const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
      const islamicPreferences = islamicPrefsResult.status === 'fulfilled' ? islamicPrefsResult.value.data : null;
      const privacySettings = privacyResult.status === 'fulfilled' ? privacyResult.value.data : null;
      const userVerifications = verificationsResult.status === 'fulfilled' ? verificationsResult.value.data : null;
      const matchingPreferences = matchingPrefsResult.status === 'fulfilled' ? matchingPrefsResult.value.data : null;

      // Check for errors
      const errors = [
        profileResult.status === 'rejected' ? profileResult.reason : null,
        islamicPrefsResult.status === 'rejected' ? islamicPrefsResult.reason : null,
        privacyResult.status === 'rejected' ? privacyResult.reason : null,
        verificationsResult.status === 'rejected' ? verificationsResult.reason : null,
        matchingPrefsResult.status === 'rejected' ? matchingPrefsResult.reason : null
      ].filter(Boolean);

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
        matchingPreferences
      });
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Erreur inattendue lors du chargement');
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  return {
    data,
    loading,
    error,
    refetch: fetchProfileData
  };
};