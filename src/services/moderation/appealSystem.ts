
import { supabase } from '@/integrations/supabase/client';

export interface Appeal {
  id: string;
  userId: string;
  moderationActionId: string;
  appealReason: string;
  evidence?: string[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  originalAction: {
    type: 'warning' | 'temporary_ban' | 'permanent_ban' | 'content_removal';
    reason: string;
    evidence: string[];
  };
}

export interface AppealSubmission {
  moderationActionId: string;
  appealReason: string;
  evidence?: string[];
  additionalContext?: string;
}

export class AppealSystem {
  static async submitAppeal(appeal: AppealSubmission, userId: string): Promise<{ success: boolean; appealId?: string; error?: string }> {
    try {
      // Check if user already has a pending appeal for this action
      const { data: existingAppeals } = await supabase
        .from('moderation_appeals')
        .select('id')
        .eq('user_id', userId)
        .eq('moderation_action_id', appeal.moderationActionId)
        .eq('status', 'pending');

      if (existingAppeals && existingAppeals.length > 0) {
        return {
          success: false,
          error: 'Un appel est déjà en cours pour cette action'
        };
      }

      // Submit new appeal
      const { data, error } = await supabase
        .from('moderation_appeals')
        .insert({
          user_id: userId,
          moderation_action_id: appeal.moderationActionId,
          appeal_reason: appeal.appealReason,
          evidence: appeal.evidence || [],
          additional_context: appeal.additionalContext,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: 'Erreur lors de la soumission de l\'appel'
        };
      }

      // Log the appeal submission
      await this.logAppealActivity(data.id, 'submitted', userId);

      return {
        success: true,
        appealId: data.id
      };
    } catch (error) {
      console.error('Error submitting appeal:', error);
      return {
        success: false,
        error: 'Erreur technique lors de la soumission'
      };
    }
  }

  static async getUserAppeals(userId: string): Promise<Appeal[]> {
    try {
      const { data, error } = await supabase
        .from('moderation_appeals')
        .select(`
          *,
          moderation_actions!inner(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching appeals:', error);
        return [];
      }

      return (data || []).map((appeal: any) => ({
        id: appeal.id,
        userId: appeal.user_id,
        moderationActionId: appeal.moderation_action_id,
        appealReason: appeal.appeal_reason,
        evidence: appeal.evidence,
        status: appeal.status,
        submittedAt: appeal.created_at,
        reviewedAt: appeal.reviewed_at,
        reviewerNotes: appeal.reviewer_notes,
        originalAction: {
          type: appeal.moderation_actions?.action_type || 'warning',
          reason: appeal.moderation_actions?.reason || '',
          evidence: appeal.moderation_actions?.evidence || []
        }
      }));
    } catch (error) {
      console.error('Error fetching user appeals:', error);
      return [];
    }
  }

  static async reviewAppeal(
    appealId: string, 
    reviewerId: string, 
    decision: 'approved' | 'rejected', 
    reviewerNotes: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('moderation_appeals')
        .update({
          status: decision,
          reviewer_id: reviewerId,
          reviewer_notes: reviewerNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', appealId);

      if (error) {
        return {
          success: false,
          error: 'Erreur lors de la révision de l\'appel'
        };
      }

      // Log the review activity
      await this.logAppealActivity(appealId, decision, reviewerId);

      // If approved, reverse the original moderation action
      if (decision === 'approved') {
        await this.reverseModeration(appealId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error reviewing appeal:', error);
      return {
        success: false,
        error: 'Erreur technique lors de la révision'
      };
    }
  }

  private static async reverseModeration(appealId: string): Promise<void> {
    try {
      // Get the appeal and original moderation action
      const { data: appeal } = await supabase
        .from('moderation_appeals')
        .select(`
          *,
          moderation_actions!inner(*)
        `)
        .eq('id', appealId)
        .single();

      if (!appeal) return;

      // Mark the original moderation action as reversed
      await supabase
        .from('moderation_actions')
        .update({
          status: 'reversed',
          reversed_at: new Date().toISOString(),
          reversal_reason: 'Appeal approved'
        })
        .eq('id', appeal?.moderation_action_id);

      // If it was a ban, unban the user
      if (appeal?.moderation_actions?.action_type?.includes('ban')) {
        await (supabase as any)
          .from('user_bans')
          .update({
            is_active: false,
            lifted_at: new Date().toISOString(),
            lift_reason: 'Appeal approved'
          })
          .eq('user_id', appeal.user_id)
          .eq('is_active', true);
      }
    } catch (error) {
      console.error('Error reversing moderation:', error);
    }
  }

  private static async logAppealActivity(appealId: string, activity: string, userId: string): Promise<void> {
    try {
      await (supabase as any)
        .from('appeal_activities')
        .insert({
          appeal_id: appealId,
          activity_type: activity,
          performed_by: userId,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging appeal activity:', error);
    }
  }

  static getAppealGuidelines(): {
    validReasons: string[];
    evidenceTypes: string[];
    tips: string[];
  } {
    return {
      validReasons: [
        'Action prise par erreur',
        'Contexte mal interprété',
        'Preuve insuffisante',
        'Circonstances atténuantes',
        'Malentendu culturel',
        'Problème technique'
      ],
      evidenceTypes: [
        'Captures d\'écran du contexte',
        'Messages précédents',
        'Témoignages de témoins',
        'Preuves de malentendus',
        'Documentation des circonstances'
      ],
      tips: [
        'Soyez respectueux et professionnel',
        'Fournissez des preuves concrètes',
        'Expliquez clairement le contexte',
        'Admettez vos erreurs le cas échéant',
        'Proposez des mesures correctives'
      ]
    };
  }
}
