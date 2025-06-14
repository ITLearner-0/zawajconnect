
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CompatibilityMatch } from "@/types/compatibility";
import { MatchingFilters } from "./types/matchingTypes";
import { PaginationOptions, PaginatedResult } from "./types/paginationTypes";
import { enhancedMatchingService } from "./services/enhancedMatchingService";
import { paginationService } from "./services/paginationService";
import { logInfo, logError } from "./services/loggingService";

export function useEnhancedCompatibilityMatching() {
  const [matches, setMatches] = useState<CompatibilityMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [backgroundProcessing, setBackgroundProcessing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  // Find matches with pagination support
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

      // Use pagination for initial load
      const paginatedResult = await enhancedMatchingService.findMatchesWithPagination(
        session.user.id,
        { ...filters, pagination: { limit: 20 } }
      );

      setMatches(paginatedResult.data);
      setHasMore(paginatedResult.hasMore);
      setTotalCount(paginatedResult.totalCount || 0);
      
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

      logInfo('useEnhancedMatching', 'Loaded initial matches', { 
        count: paginatedResult.data.length,
        hasMore: paginatedResult.hasMore
      });

      return paginatedResult.data;
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

  // Load more matches for pagination
  const loadMoreMatches = useCallback(async (
    paginationOptions: PaginationOptions,
    filters?: MatchingFilters
  ): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const result = await enhancedMatchingService.loadMoreMatches(
        session.user.id,
        matches,
        paginationOptions,
        filters
      );

      setMatches(result.data);
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount || 0);

      logInfo('useEnhancedMatching', 'Loaded more matches', {
        newTotal: result.data.length,
        hasMore: result.hasMore
      });
    } catch (error) {
      logError('useEnhancedMatching', error as Error);
      toast({
        title: "Erreur",
        description: "Impossible de charger plus de correspondances",
        variant: "destructive",
      });
    }
  }, [matches, toast]);

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
      
      // Reset pagination state
      setMatches([]);
      setHasMore(false);
      setTotalCount(0);
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
    hasMore,
    totalCount,
    findMatches,
    loadMoreMatches,
    refreshMatches,
    getProcessingStatus
  };
}

// Export types for external use
export type { MatchingFilters } from "./types/matchingTypes";
export type { PaginationOptions, PaginatedResult } from "./types/paginationTypes";
