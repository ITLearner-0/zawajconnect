import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FamilyNotification {
  id: string;
  match_id: string;
  notification_type: string;
  content: string;
  severity: string;
  action_required: boolean;
  is_read: boolean;
  created_at: string;
  family_member_id: string;
  match?: {
    id: string;
    user1_id: string;
    user2_id: string;
    match_score: number;
    user1_profile?: {
      full_name: string;
      age: number;
      location: string;
      profession: string;
      avatar_url: string;
    } | null;
    user2_profile?: {
      full_name: string;
      age: number;
      location: string;
      profession: string;
      avatar_url: string;
    } | null;
  } | null;
}

export const useFamilyApproval = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<FamilyNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadNotifications = async (userId?: string) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Get family member record
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('invited_user_id', userId)
        .eq('invitation_status', 'accepted')
        .maybeSingle();

      if (!familyMember) {
        setNotifications([]);
        return;
      }

      // Get notifications with match details
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

      setNotifications((data || []).map(item => ({
        id: item.id ?? '',
        match_id: item.match_id ?? '',
        notification_type: item.notification_type ?? '',
        content: item.content ?? '',
        severity: item.severity ?? 'medium',
        action_required: item.action_required ?? false,
        is_read: item.is_read ?? false,
        created_at: item.created_at ?? new Date().toISOString(),
        family_member_id: item.family_member_id ?? '',
        match: item.match ? {
          id: item.match.id ?? '',
          user1_id: item.match.user1_id ?? '',
          user2_id: item.match.user2_id ?? '',
          match_score: item.match.match_score ?? 0,
          user1_profile: Array.isArray(item.match.user1_profile) 
            ? item.match.user1_profile[0] ?? undefined
            : item.match.user1_profile ?? undefined,
          user2_profile: Array.isArray(item.match.user2_profile) 
            ? item.match.user2_profile[0] ?? undefined
            : item.match.user2_profile ?? undefined
        } : undefined
      })));
    } catch (error) {
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

  const handleApprovalDecision = async (
    userId: string,
    notificationId: string, 
    matchId: string, 
    decision: 'approved' | 'rejected' | 'needs_discussion',
    notes?: string
  ) => {
    setProcessingIds(prev => new Set([...prev, notificationId]));
    
    try {
      // Get family member record
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('invited_user_id', userId)
        .maybeSingle();

      if (!familyMember) throw new Error('Membre de famille non trouvé');

      // Create family review
      const { error: reviewError } = await supabase
        .from('family_reviews')
        .insert({
          family_member_id: familyMember.id,
          match_id: matchId,
          status: decision,
          notes: notes || null
        });

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
      
    } catch (error) {
      console.error('Error processing decision:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre décision",
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