import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface MatchProfile {
  user_id: string;
  full_name: string;
  age: number;
  location: string;
  profession: string;
  avatar_url?: string;
  bio?: string;
  compatibility_score: number;
  islamic_score: number;
  cultural_score: number;
  personality_score: number;
  matching_reasons: string[];
  potential_concerns: string[];
}

interface MatchingHistoryRecord {
  id: string;
  matched_profiles: any; // JSON type from Supabase
  preferences_used: any; // JSON type from Supabase
  total_matches: number;
  avg_compatibility_score: number;
  search_timestamp: string;
  user_id: string;
  created_at: string;
}

export interface MatchingHistoryEntry {
  id: string;
  matched_profiles: MatchProfile[];
  preferences_used: any;
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
    return records.map(record => ({
      id: record.id,
      matched_profiles: Array.isArray(record.matched_profiles) ? record.matched_profiles : [],
      preferences_used: record.preferences_used,
      total_matches: record.total_matches,
      avg_compatibility_score: record.avg_compatibility_score,
      search_timestamp: record.search_timestamp
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

        const transformedData = transformHistoryData(data || []);
        setHistory(transformedData);
      } catch (error) {
        console.error('Error loading history:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique",
          variant: "destructive",
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
    preferences: any
  ) => {
    if (!user || matches.length === 0) return;

    try {
      const avgScore = matches.reduce((sum, match) => sum + match.compatibility_score, 0) / matches.length;
      
      const { error } = await supabase
        .from('matching_history')
        .insert({
          user_id: user.id,
          matched_profiles: matches as any, // Cast to any for JSON storage
          preferences_used: preferences,
          total_matches: matches.length,
          avg_compatibility_score: avgScore
        });

      if (error) throw error;

      // Refresh history
      const { data } = await supabase
        .from('matching_history')
        .select('*')
        .eq('user_id', user.id)
        .order('search_timestamp', { ascending: false })
        .limit(10);

      if (data) {
        const transformedData = transformHistoryData(data);
        setHistory(transformedData);
      }

    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  return {
    history,
    loading,
    saveSearchToHistory
  };
};