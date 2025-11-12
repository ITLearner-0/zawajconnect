import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  FamilyNotificationRow,
  FamilyMemberRow,
  FamilyReviewInsert,
  MatchRow,
  EnrichedFamilyNotification,
  EnrichedMatch,
  MatchProfileData
} from '@/types/supabase';

export const useFamilyApproval = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<EnrichedFamilyNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  /**
   * Charge les notifications familiales pour un utilisateur donné
   * @param userId - ID de l'utilisateur wali
   */
  const loadNotifications = async (userId?: string): Promise<void> => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Get family member record with strict typing
      const { data: familyMember, error: memberError } = await supabase
        .from('family_members')
        .select('id')
        .eq('invited_user_id', userId)
        .eq('invitation_status', 'accepted')
        .maybeSingle();

      if (memberError) throw memberError;

      if (!familyMember) {
        setNotifications([]);
        return;
      }

      // Get notifications with match details
      // Note: Supabase doesn't type complex joins well, using 'as any' is necessary here
      // This is a known limitation when selecting nested relations with custom foreign keys
      const { data, error } = await supabase
        .from('family_notifications')
        .select(`
          *,
          match:matches(
            id,
            user1_id,
            user2_id,
            match_score,
            user1_profile:profiles!matches_user1_id_fkey(
              full_name,
              age,
              location,
              profession,
              avatar_url
            ),
            user2_profile:profiles!matches_user2_id_fkey(
              full_name,
              age,
              location,
              profession,
              avatar_url
            )
          )
        `)
        .eq('family_member_id', familyMember.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type-safe data normalization with fallback values
      const normalizedNotifications: EnrichedFamilyNotification[] = (data ?? []).map((item): EnrichedFamilyNotification => {
        // Supabase complex joins require casting due to type generation limitations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawMatch = (item as any).match;

        // Normalize match data with default values for required fields
        const enrichedMatch: EnrichedMatch | null = rawMatch ? {
          id: rawMatch.id ?? '',
          user1_id: rawMatch.user1_id ?? '',
          user2_id: rawMatch.user2_id ?? '',
          match_score: rawMatch.match_score ?? 0,
          user1_profile: rawMatch.user1_profile ? {
            full_name: rawMatch.user1_profile.full_name ?? 'Utilisateur',
            age: rawMatch.user1_profile.age ?? 0,
            location: rawMatch.user1_profile.location ?? 'Non spécifié',
            profession: rawMatch.user1_profile.profession ?? 'Non spécifié',
            avatar_url: rawMatch.user1_profile.avatar_url ?? ''
          } : null,
          user2_profile: rawMatch.user2_profile ? {
            full_name: rawMatch.user2_profile.full_name ?? 'Utilisateur',
            age: rawMatch.user2_profile.age ?? 0,
            location: rawMatch.user2_profile.location ?? 'Non spécifié',
            profession: rawMatch.user2_profile.profession ?? 'Non spécifié',
            avatar_url: rawMatch.user2_profile.avatar_url ?? ''
          } : null
        } : null;

        return {
          id: item.id,
          match_id: item.match_id,
          notification_type: item.notification_type,
          content: item.content,
          severity: item.severity,
          action_required: item.action_required,
          is_read: item.is_read,
          created_at: item.created_at,
          family_member_id: item.family_member_id,
          original_message: item.original_message,
          read_at: item.read_at,
          match: enrichedMatch
        };
      });

      setNotifications(normalizedNotifications);
    } catch (err) {
      const error = err as PostgrestError;
      console.error('Error loading notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      });
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère la décision d'approbation familiale pour un match
   * @param userId - ID de l'utilisateur wali
   * @param notificationId - ID de la notification à traiter
   * @param matchId - ID du match concerné
   * @param decision - Décision prise (approved/rejected/needs_discussion)
   * @param notes - Notes optionnelles pour la décision
   */
  const handleApprovalDecision = async (
    userId: string,
    notificationId: string, 
    matchId: string, 
    decision: 'approved' | 'rejected' | 'needs_discussion',
    notes?: string
  ): Promise<void> => {
    setProcessingIds(prev => new Set([...prev, notificationId]));
    
    try {
      // Get family member record with strict typing
      const { data: familyMember, error: memberError } = await supabase
        .from('family_members')
        .select('id')
        .eq('invited_user_id', userId)
        .maybeSingle();

      if (memberError) throw memberError;
      if (!familyMember) throw new Error('Membre de famille non trouvé');

      // Create family review with strict typing
      const reviewData: FamilyReviewInsert = {
        family_member_id: familyMember.id,
        match_id: matchId,
        status: decision,
        notes: notes ?? null
      };

      const { error: reviewError } = await supabase
        .from('family_reviews')
        .insert(reviewData);

      if (reviewError) throw reviewError;

      // Mark notification as read
      const { error: notifError } = await supabase
        .from('family_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (notifError) throw notifError;

      // Update match status if approved
      if (decision === 'approved') {
        const { error: matchError } = await supabase
          .from('matches')
          .update({ 
            family_approved: true,
            can_communicate: true,
            family_reviewed_at: new Date().toISOString()
          })
          .eq('id', matchId);

        if (matchError) throw matchError;
      }

      toast({
        title: "Décision enregistrée",
        description: `Votre ${decision === 'approved' ? 'approbation' : decision === 'rejected' ? 'refus' : 'demande de discussion'} a été prise en compte`,
      });

      // Reload notifications
      await loadNotifications(userId);
      
    } catch (err) {
      const error = err as PostgrestError | Error;
      console.error('Error processing decision:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'enregistrer votre décision",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  return {
    notifications,
    loading,
    processingIds,
    loadNotifications,
    handleApprovalDecision
  };
};