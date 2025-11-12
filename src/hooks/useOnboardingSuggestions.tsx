import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type SuggestionType = 'bio' | 'islamic_preferences' | 'field_tips' | 'interests_suggestions';

interface BioSuggestion {
  suggestions: string[];
}

interface IslamicPreferencesSuggestion {
  suggestions: string[];
  warnings?: string[];
}

interface FieldTipsSuggestion {
  suggestions: string[];
}

interface InterestsSuggestion {
  suggestions: string[];
}

type SuggestionResult = BioSuggestion | IslamicPreferencesSuggestion | FieldTipsSuggestion | InterestsSuggestion;

export const useOnboardingSuggestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSuggestions = useCallback(async (
    type: SuggestionType,
    data: Record<string, any>
  ): Promise<SuggestionResult | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🤖 Generating ${type} suggestions...`, data);

      const { data: result, error: functionError } = await supabase.functions.invoke(
        'generate-onboarding-suggestions',
        {
          body: { type, data }
        }
      );

      if (functionError) {
        throw functionError;
      }

      if (result?.error) {
        // Handle rate limiting and payment errors gracefully
        if (result.error.includes('Limite de requêtes')) {
          toast({
            title: "Trop de requêtes",
            description: "Veuillez attendre un moment avant de demander de nouvelles suggestions.",
            variant: "destructive"
          });
        } else if (result.error.includes('Crédits insuffisants')) {
          toast({
            title: "Crédits insuffisants",
            description: "Les suggestions AI ne sont temporairement pas disponibles.",
            variant: "destructive"
          });
        } else {
          throw new Error(result.error);
        }
        return null;
      }

      console.log('✅ Suggestions received:', result.suggestions);
      return result.suggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération des suggestions';
      console.error('Error generating suggestions:', err);
      setError(errorMessage);
      
      // Don't show toast for every error, just log it
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const generateBioSuggestions = useCallback((data: {
    interests?: string[];
    profession?: string;
    education?: string;
    lookingFor?: string;
  }) => generateSuggestions('bio', data), [generateSuggestions]);

  const generateIslamicPreferencesSuggestions = useCallback((data: {
    sect?: string;
    madhab?: string;
    prayerFrequency?: string;
    quranReading?: string;
    importanceOfReligion?: string;
    halalDiet?: boolean;
    hijabPreference?: string;
    beardPreference?: string;
  }) => generateSuggestions('islamic_preferences', data), [generateSuggestions]);

  const generateFieldTips = useCallback((data: {
    fieldName: string;
    currentValue?: string;
    context?: string;
  }) => generateSuggestions('field_tips', data), [generateSuggestions]);

  const generateInterestsSuggestions = useCallback((data: {
    currentInterests?: string[];
    profession?: string;
    education?: string;
  }) => generateSuggestions('interests_suggestions', data), [generateSuggestions]);

  return {
    loading,
    error,
    generateBioSuggestions,
    generateIslamicPreferencesSuggestions,
    generateFieldTips,
    generateInterestsSuggestions,
  };
};
