import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { MatchProfile, MatchingHistoryPreferences } from '@/types/supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Json = Database['public']['Tables']['matching_history']['Insert']['matched_profiles'];

/**
 * Matching History Record - Raw DB type
 */
interface MatchingHistoryRecord {
  id: string;
  matched_profiles: unknown;
  preferences_used: unknown;
  total_matches: number;
  avg_compatibility_score: number;
  search_timestamp: string;
  user_id: string;
  created_at: string;
}

/**
 * Matching History Entry - Typed for UI
 */
export interface MatchingHistoryEntry {
  id: string;
  matched_profiles: MatchProfile[];
  preferences_used: MatchingHistoryPreferences;
  total_matches: number;
  avg_compatibility_score: number;
  search_timestamp: string;
}

export const useMatchingHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<MatchingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Transform raw data from Supabase to our typed format
  const transformHistoryData = (records: MatchingHistoryRecord[]): MatchingHistoryEntry[] => {
    return records.map((record) => ({
      id: record.id,
      matched_profiles: Array.isArray(record.matched_profiles)
        ? (record.matched_profiles as MatchProfile[])
        : [],
      preferences_used: (record.preferences_used as MatchingHistoryPreferences) || {},
      total_matches: record.total_matches,
      avg_compatibility_score: record.avg_compatibility_score ?? 0,
      search_timestamp: record.search_timestamp,
    }));
  };

  // Load history from database
  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('matching_history')
          .select('*')
          .eq('user_id', user.id)
          .order('search_timestamp', { ascending: false })
          .limit(10);

        if (error) throw error;

        const transformedData = transformHistoryData(
          (data || []).map((item) => ({
            id: item.id,
            matched_profiles: item.matched_profiles,
            preferences_used: item.preferences_used,
            total_matches: item.total_matches,
            avg_compatibility_score: item.avg_compatibility_score ?? 0,
            search_timestamp: item.search_timestamp,
            user_id: item.user_id,
            created_at: item.created_at,
          }))
        );
        setHistory(transformedData);
      } catch (error) {
        const pgError = error as PostgrestError;
        console.error('[useMatchingHistory] Load error:', pgError);
        toast({
          title: 'Erreur',
          description: "Impossible de charger l'historique",
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user, toast]);

  // Save new search to history
  const saveSearchToHistory = async (
    matches: MatchProfile[],
    preferences: MatchingHistoryPreferences
  ): Promise<void> => {
    if (!user || matches.length === 0) return;

    try {
      const avgScore =
        matches.reduce((sum, match) => sum + match.compatibility_score, 0) / matches.length;

      const { error } = await supabase.from('matching_history').insert([
        {
          matched_profiles: matches as unknown as Json,
          preferences_used: preferences as unknown as Json,
          total_matches: matches.length,
          avg_compatibility_score: avgScore,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.error('[useMatchingHistory] Insert error:', error);
        throw error;
      }

      // Refresh history
      const { data } = await supabase
        .from('matching_history')
        .select('*')
        .eq('user_id', user.id)
        .order('search_timestamp', { ascending: false })
        .limit(10);

      if (data) {
        const transformedData = transformHistoryData(
          data.map((item) => ({
            id: item.id,
            matched_profiles: item.matched_profiles,
            preferences_used: item.preferences_used,
            total_matches: item.total_matches,
            avg_compatibility_score: item.avg_compatibility_score ?? 0,
            search_timestamp: item.search_timestamp,
            user_id: item.user_id,
            created_at: item.created_at,
          }))
        );
        setHistory(transformedData);
      }
    } catch (error) {
      const pgError = error as PostgrestError;
      console.error('[useMatchingHistory] Save error:', pgError);
    }
  };

  return {
    history,
    loading,
    saveSearchToHistory,
  };
};
