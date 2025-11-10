import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MatchApprovalData, ApprovalDecision, FamilyMemberData } from '@/types/match-approval';
import { useWaliRateLimit } from '@/hooks/useWaliRateLimit';
import { useWaliAudit } from '@/hooks/useWaliAudit';

export const useMatchApproval = () => {
  const [matches, setMatches] = useState<MatchApprovalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const { checkAndWarn, incrementRateLimit } = useWaliRateLimit();
  const { logAction } = useWaliAudit();

  const loadMatchesForApproval = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les family_members où l'utilisateur actuel est le wali invité
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('id, user_id, invited_user_id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('is_wali', true);

      if (!familyMembers || familyMembers.length === 0) {
        setMatches([]);
        return;
      }

      const supervisedUserIds = familyMembers.map(fm => fm.user_id);

      // Récupérer les matches nécessitant approbation
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          match_score,
          created_at,
          can_communicate,
          family_approved,
          family_notes
        `)
        .in('user1_id', supervisedUserIds)
        .eq('is_mutual', true)
        .is('family_approved', null)
        .order('created_at', { ascending: false });

      if (!matchesData) {
        setMatches([]);
        return;
      }

      // Récupérer tous les profils en une seule requête
      const allUserIds = [
        ...matchesData.map(m => m.user1_id),
        ...matchesData.map(m => m.user2_id)
      ];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, age, profession, location, bio, avatar_url')
        .in('user_id', allUserIds);

      if (!profiles) {
        setMatches([]);
        return;
      }

      // Créer un map des profils pour un accès rapide
      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Formater les matches avec les vraies données de profil
      const formattedMatches: MatchApprovalData[] = matchesData.map(match => {
        const familyMember = familyMembers.find(fm => fm.user_id === match.user1_id);
        const user1Profile = profileMap[match.user1_id];
        const user2Profile = profileMap[match.user2_id];

        return {
          id: match.id,
          user1_id: match.user1_id,
          user2_id: match.user2_id,
          match_score: match.match_score ?? 0,
          created_at: match.created_at,
          can_communicate: match.can_communicate,
          family_approved: match.family_approved ?? undefined,
          family_notes: match.family_notes ?? undefined,
          supervised_user_id: match.user1_id,
          family_member_id: familyMember?.id || '',
          user1_profile: {
            id: match.user1_id,
            full_name: user1Profile?.full_name || 'Utilisateur supervisé',
            age: user1Profile?.age,
            profession: user1Profile?.profession,
            location: user1Profile?.location,
            bio: user1Profile?.bio,
            avatar_url: user1Profile?.avatar_url
          },
          user2_profile: {
            id: match.user2_id,
            full_name: user2Profile?.full_name || 'Match potentiel',
            age: user2Profile?.age,
            profession: user2Profile?.profession,
            location: user2Profile?.location,
            bio: user2Profile?.bio,
            avatar_url: user2Profile?.avatar_url
          }
        };
      });

      setMatches(formattedMatches);
    } catch (error) {
      console.error('Error loading matches for approval:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les matches pour approbation",
        variant: "destructive"
      });
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const processApprovalDecision = async (match: MatchApprovalData, decision: ApprovalDecision) => {
    if (!match.family_member_id) {
      toast({
        title: "Erreur",
        description: "Impossible de traiter cette décision",
        variant: "destructive"
      });
      return false;
    }

    try {
      setProcessingId(match.id);
      
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // SÉCURITÉ: Vérifier le rate limit avant de procéder
      const allowed = await checkAndWarn(user.id, 'match_approval');
      if (!allowed) {
        return false;
      }

      // Créer une révision familiale avec le bon family_member_id
      const { error: reviewError } = await supabase
        .from('family_reviews')
        .insert({
          match_id: match.id,
          family_member_id: match.family_member_id,
          status: decision.approved ? 'approved' : 'rejected',
          notes: decision.notes,
          reviewed_at: new Date().toISOString()
        });

      if (reviewError) throw reviewError;

      // Mettre à jour le match
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          family_approved: decision.approved,
          can_communicate: decision.approved,
          family_reviewed_at: new Date().toISOString(),
          family_notes: decision.notes
        })
        .eq('id', match.id);

      if (matchError) throw matchError;

      // Créer une notification pour l'utilisateur supervisé
      await supabase.functions.invoke('send-family-notification', {
        body: {
          userId: match.supervised_user_id,
          type: decision.approved ? 'match_approved' : 'match_rejected',
          title: decision.approved ? 'Match approuvé par votre famille' : 'Match refusé par votre famille',
          content: `Votre famille a ${decision.approved ? 'approuvé' : 'refusé'} le match avec ${match.user2_profile.full_name}. ${decision.notes}`,
          matchId: match.id
        }
      });

      // Supprimer de la liste locale
      setMatches(prev => prev.filter(m => m.id !== match.id));

      // AUDIT: Logger l'action avec succès
      await logAction({
        waliUserId: user.id,
        actionType: decision.approved ? 'match_approved' : 'match_rejected',
        supervisedUserId: match.supervised_user_id,
        actionDetails: {
          match_score: match.match_score,
          user2_name: match.user2_profile.full_name,
          notes: decision.notes,
          conditions: decision.conditions,
          meeting_required: decision.meetingRequired
        },
        matchId: match.id,
        familyMemberId: match.family_member_id,
        success: true
      });

      // RATE LIMIT: Incrémenter le compteur
      await incrementRateLimit(user.id, 'match_approval');

      toast({
        title: decision.approved ? "Match approuvé" : "Match refusé",
        description: decision.approved 
          ? "La communication est maintenant autorisée"
          : "Le match a été refusé selon vos directives",
        variant: decision.approved ? "default" : "destructive"
      });

      return true;
    } catch (error) {
      console.error('Error processing approval decision:', error);
      
      // AUDIT: Logger l'échec
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logAction({
          waliUserId: user.id,
          actionType: decision.approved ? 'match_approved' : 'match_rejected',
          supervisedUserId: match.supervised_user_id,
          matchId: match.id,
          familyMemberId: match.family_member_id,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      toast({
        title: "Erreur",
        description: "Impossible de traiter la décision d'approbation",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessingId(undefined);
    }
  };

  useEffect(() => {
    loadMatchesForApproval();
  }, []);

  return {
    matches,
    loading,
    processingId,
    processApprovalDecision,
    reloadMatches: loadMatchesForApproval
  };
};