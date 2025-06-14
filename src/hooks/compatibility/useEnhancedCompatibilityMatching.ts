
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CompatibilityMatch } from "@/types/compatibility";
import { MatchingFilters } from "./types/matchingTypes";
import { enhancedMatchingService } from "./services/enhancedMatchingService";
import { logInfo, logError } from "./services/loggingService";

export function useEnhancedCompatibilityMatching() {
  const [matches, setMatches] = useState<CompatibilityMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [backgroundProcessing, setBackgroundProcessing] = useState(false);
  const { toast } = useToast();

  // Find matches with background processing
  const findMatches = async (
    filters?: MatchingFilters,
    useBackground = true,
    showLoadingToast = true
  ): Promise<CompatibilityMatch[]> => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Vous devez être connecté pour voir les correspondances");
      }

      if (showLoadingToast && useBackground) {
        toast({
          title: "Recherche en cours",
          description: "Calcul des correspondances en arrière-plan...",
        });
      }

      // Check for cached matches first
      const cachedMatches = await enhancedMatchingService.getCachedMatches(session.user.id);
      if (cachedMatches && !filters) {
        setMatches(cachedMatches);
        logInfo('useEnhancedMatching', 'Loaded cached matches', { count: cachedMatches.length });
        return cachedMatches;
      }

      const results = await enhancedMatchingService.findMatchesWithBackgroundProcessing(
        session.user.id,
        filters,
        useBackground
      );

      setMatches(results);
      
      if (useBackground) {
        setBackgroundProcessing(true);
        // Check processing status periodically
        const interval = setInterval(() => {
          const status = enhancedMatchingService.getProcessingStatus();
          if (status.pending === 0 && status.processing === 0) {
            setBackgroundProcessing(false);
            clearInterval(interval);
            
            toast({
              title: "Calculs terminés",
              description: "Les correspondances ont été mises à jour.",
            });
          }
        }, 5000);

        // Clear interval after 2 minutes
        setTimeout(() => {
          clearInterval(interval);
          setBackgroundProcessing(false);
        }, 120000);
      }

      return results;
    } catch (error) {
      logError('useEnhancedMatching', error as Error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger les correspondances",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Refresh matches with high priority
  const refreshMatches = async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await enhancedMatchingService.refreshMatches(session.user.id, 'high');
      
      toast({
        title: "Actualisation en cours",
        description: "Vos correspondances sont en cours de mise à jour...",
      });

      setBackgroundProcessing(true);
    } catch (error) {
      logError('useEnhancedMatching', error as Error);
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les correspondances",
        variant: "destructive",
      });
    }
  };

  // Get processing status
  const getProcessingStatus = () => {
    return enhancedMatchingService.getProcessingStatus();
  };

  // Cleanup effect
  useEffect(() => {
    const cleanup = () => {
      enhancedMatchingService.cleanupCompletedTasks();
    };

    // Cleanup on component unmount
    return cleanup;
  }, []);

  // Auto-refresh cached matches every 30 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const cachedMatches = await enhancedMatchingService.getCachedMatches(session.user.id);
        if (!cachedMatches) {
          // No cached matches, trigger background calculation
          await enhancedMatchingService.refreshMatches(session.user.id, 'low');
        }
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    matches,
    loading,
    backgroundProcessing,
    findMatches,
    refreshMatches,
    getProcessingStatus
  };
}

// Export types for external use
export type { MatchingFilters } from "./types/matchingTypes";
