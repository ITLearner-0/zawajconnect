import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { PostgrestError } from '@supabase/supabase-js';
import type { MatchingPreferencesRow, MatchingPreferencesUpdate } from '@/types/supabase';

// Export le type principal pour compatibilité avec le code existant
export type MatchingPreferences = MatchingPreferencesRow;

const defaultPreferences: MatchingPreferencesUpdate = {
  use_ai_scoring: true,
  weight_islamic: 40,
  weight_cultural: 30,
  weight_personality: 30,
  min_compatibility: 70,
  family_approval_required: false
};

export const useMatchingPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<MatchingPreferencesUpdate>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load preferences from database
  useEffect(() => {
    if (!user) return;
    
    const loadPreferences = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('matching_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          // Type strict: data est de type MatchingPreferences (Row)
          setPreferences({
            use_ai_scoring: data.use_ai_scoring,
            weight_islamic: data.weight_islamic,
            weight_cultural: data.weight_cultural,
            weight_personality: data.weight_personality,
            min_compatibility: data.min_compatibility,
            family_approval_required: data.family_approval_required
          });
        }
      } catch (err) {
        const error = err as PostgrestError;
        console.error('[useMatchingPreferences] Error loading preferences:', error.message);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos préférences",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user, toast]);

  // Save preferences to database
  const savePreferences = async (newPreferences: MatchingPreferencesUpdate): Promise<boolean> => {
    if (!user) return false;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('matching_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setPreferences(newPreferences);
      toast({
        title: "Préférences sauvegardées",
        description: "Vos préférences de matching ont été mises à jour",
      });
      return true;
    } catch (err) {
      const error = err as PostgrestError;
      console.error('[useMatchingPreferences] Error saving preferences:', error.message);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos préférences",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updatePreferences = (updates: Partial<MatchingPreferencesUpdate>) => {
    const newPreferences: MatchingPreferencesUpdate = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Auto-save after 1 second delay
    saveTimeoutRef.current = setTimeout(() => {
      savePreferences(newPreferences);
    }, 1000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
    savePreferences: () => savePreferences(preferences)
  };
};