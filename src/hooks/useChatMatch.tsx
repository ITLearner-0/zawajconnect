// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { normalizeMatch } from '@/types/supabase';

export interface ChatMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  is_mutual: boolean;
  can_communicate: boolean;
  family_supervision_required: boolean;
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export const useChatMatch = (matchId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [match, setMatch] = useState<ChatMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [canCommunicate, setCanCommunicate] = useState(false);

  const fetchMatchData = useCallback(async () => {
    if (!user || !matchId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch match data
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .maybeSingle();

      if (matchError) throw matchError;

      if (!matchData) {
        setMatch(null);
        setCanCommunicate(false);
        return;
      }

      // Determine other user
      const otherUserId = matchData.user1_id === user.id ? matchData.user2_id : matchData.user1_id;
      
      // Fetch other user profile
      const { data: otherProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .eq('user_id', otherUserId)
        .maybeSingle();

      if (profileError) throw profileError;

      const chatMatch: ChatMatch = {
        ...normalizeMatch(matchData),
        other_user: {
          id: otherUserId,
          full_name: otherProfile?.full_name || 'Utilisateur inconnu',
          avatar_url: otherProfile?.avatar_url || undefined
        }
      };

      setMatch(chatMatch);
      
      // Check communication permissions
      await checkCommunicationPermissions(matchData);
      
    } catch (error) {
      console.error('Error fetching match data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations du match",
        variant: "destructive"
      });
      setMatch(null);
    } finally {
      setLoading(false);
    }
  }, [user, matchId, toast]);

  const checkCommunicationPermissions = useCallback(async (matchData: Record<string, unknown>) => {
    if (!user) return;
    
    try {
      // If match allows communication, no need for further checks
      if (matchData.can_communicate) {
        setCanCommunicate(true);
        return;
      }

      // Check if user is male (males can communicate directly)
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userProfile?.gender === 'male') {
        setCanCommunicate(true);
        return;
      }

      // For females, check family supervision
      if (matchData.family_supervision_required) {
        const { data: familyMembers } = await supabase
          .from('family_members')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_wali', true)
          .eq('invitation_status', 'accepted')
          .eq('can_communicate', true);

        setCanCommunicate(!!(familyMembers && familyMembers.length > 0));
      } else {
        setCanCommunicate(true);
      }
    } catch (error) {
      console.error('Error checking communication permissions:', error);
      setCanCommunicate(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMatchData();
  }, [fetchMatchData]);

  return {
    match,
    loading,
    canCommunicate,
    refetch: fetchMatchData
  };
};