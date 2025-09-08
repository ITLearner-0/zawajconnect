import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface MatchingPreferences {
  use_ai_scoring: boolean;
  weight_islamic: number;
  weight_cultural: number;
  weight_personality: number;
  min_compatibility: number;
  family_approval_required: boolean;
}

const defaultPreferences: MatchingPreferences = {
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
  const [preferences, setPreferences] = useState<MatchingPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
          setPreferences({
            use_ai_scoring: data.use_ai_scoring,
            weight_islamic: data.weight_islamic,
            weight_cultural: data.weight_cultural,
            weight_personality: data.weight_personality,
            min_compatibility: data.min_compatibility,
            family_approval_required: data.family_approval_required
          });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
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
  const savePreferences = async (newPreferences: MatchingPreferences) => {
    if (!user) return false;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('matching_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences
        });

      if (error) throw error;

      setPreferences(newPreferences);
      toast({
        title: "Préférences sauvegardées",
        description: "Vos préférences de matching ont été mises à jour",
      });
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
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

  const updatePreferences = (updates: Partial<MatchingPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    // Auto-save after a delay
    const timeoutId = setTimeout(() => {
      savePreferences(newPreferences);
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
    savePreferences: () => savePreferences(preferences)
  };
};