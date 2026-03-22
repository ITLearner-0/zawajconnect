import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface IslamicPreferences {
  hijabPreference: string | null;
  beardPreference: string | null;
}

export const useIslamicPreferences = (userId: string | null) => {
  const [preferences, setPreferences] = useState<IslamicPreferences>({
    hijabPreference: null,
    beardPreference: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('islamic_preferences')
          .select('hijab_preference, beard_preference')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          setPreferences({
            hijabPreference: data.hijab_preference,
            beardPreference: data.beard_preference,
          });
        }
      } catch (err) {
        console.error('Error fetching islamic preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  return { preferences, loading };
};
