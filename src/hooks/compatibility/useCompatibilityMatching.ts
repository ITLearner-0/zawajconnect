import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { MatchingFilters } from './types/matchingTypes';
import { findCompatibilityMatches } from './services/matchingService';

export function useCompatibilityMatching() {
  const { toast } = useToast();

  const findMatches = async (filters?: MatchingFilters) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Vous devez être connecté pour voir les correspondances');
      }

      return await findCompatibilityMatches(session.user.id, filters);
    } catch (error) {
      console.error('Error in useCompatibilityMatching:', error);
      toast({
        title: 'Erreur',
        description:
          error instanceof Error ? error.message : 'Impossible de charger les correspondances',
        variant: 'destructive',
      });
      return [];
    }
  };

  return { findMatches };
}

// Export the MatchingFilters type for external use
export type { MatchingFilters } from './types/matchingTypes';
