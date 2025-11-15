import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WaliComment {
  id: string;
  registration_id: string;
  admin_id: string;
  comment_text: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  admin_name?: string;
}

export interface WaliActivityLog {
  id: string;
  registration_id: string;
  admin_id?: string;
  action_type: string;
  action_description: string;
  old_value?: any;
  new_value?: any;
  metadata?: any;
  created_at: string;
  admin_name?: string;
}

export const useWaliRegistrationComments = (registrationId: string) => {
  const [comments, setComments] = useState<WaliComment[]>([]);
  const [activityLog, setActivityLog] = useState<WaliActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (registrationId) {
      fetchData();
    }
  }, [registrationId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await (supabase as any)
        .from('wali_registration_comments')
        .select('*')
        .eq('registration_id', registrationId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Fetch activity log
      const { data: activityData, error: activityError } = await (supabase as any)
        .from('wali_registration_activity_log')
        .select('*')
        .eq('registration_id', registrationId)
        .order('created_at', { ascending: false });

      if (activityError) throw activityError;

      // Get admin names
      const adminIds = [
        ...new Set([
          ...(commentsData || []).map((c: any) => c.admin_id),
          ...(activityData || [])
            .map((a: any) => a.admin_id)
            .filter((id: any) => id),
        ]),
      ];

      if (adminIds.length > 0) {
        const { data: profilesData } = await (supabase as any)
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', adminIds);

        const adminMap = new Map(
          profilesData?.map((p: any) => [p.user_id, p.full_name]) || []
        );

        // Add admin names to comments
        const commentsWithNames = (commentsData || []).map((comment: any) => ({
          ...comment,
          admin_name: adminMap.get(comment.admin_id) || 'Admin',
        }));

        // Add admin names to activity log
        const activityWithNames = (activityData || []).map((activity: any) => ({
          ...activity,
          admin_name: activity.admin_id
            ? adminMap.get(activity.admin_id) || 'Système'
            : 'Système',
        }));

        setComments(commentsWithNames);
        setActivityLog(activityWithNames);
      } else {
        setComments(commentsData || []);
        setActivityLog(activityData || []);
      }
    } catch (err) {
      console.error('Error fetching comments and activity:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (commentText: string, isInternal: boolean = true) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: insertError } = await (supabase as any)
        .from('wali_registration_comments')
        .insert({
          registration_id: registrationId,
          admin_id: user.id,
          comment_text: commentText,
          is_internal: isInternal,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Commentaire ajouté',
        description: 'Le commentaire a été enregistré avec succès.',
      });

      await fetchData();
      return true;
    } catch (err) {
      console.error('Error adding comment:', err);
      toast({
        title: 'Erreur',
        description:
          err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateComment = async (commentId: string, commentText: string) => {
    try {
      const { error: updateError } = await (supabase as any)
        .from('wali_registration_comments')
        .update({ comment_text: commentText })
        .eq('id', commentId);

      if (updateError) throw updateError;

      toast({
        title: 'Commentaire modifié',
        description: 'Le commentaire a été mis à jour.',
      });

      await fetchData();
      return true;
    } catch (err) {
      console.error('Error updating comment:', err);
      toast({
        title: 'Erreur',
        description:
          err instanceof Error
            ? err.message
            : 'Erreur lors de la modification',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error: deleteError } = await (supabase as any)
        .from('wali_registration_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;

      toast({
        title: 'Commentaire supprimé',
        description: 'Le commentaire a été supprimé.',
      });

      await fetchData();
      return true;
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast({
        title: 'Erreur',
        description:
          err instanceof Error ? err.message : 'Erreur lors de la suppression',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    comments,
    activityLog,
    loading,
    error,
    refetch: fetchData,
    addComment,
    updateComment,
    deleteComment,
  };
};
