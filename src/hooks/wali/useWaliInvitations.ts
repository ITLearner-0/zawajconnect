import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WaliInvitation } from '@/types/waliInvitation';
import { useToast } from '@/hooks/use-toast';

export const useWaliInvitations = (userId?: string) => {
  const [invitations, setInvitations] = useState<WaliInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch invitations for current user (both sent and received)
  const fetchInvitations = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wali_invitations')
        .select('*')
        .or(
          `managed_user_id.eq.${userId},wali_profile_id.in.(select id from wali_profiles where user_id = '${userId}')`
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching wali invitations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les invitations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Send wali invitation
  const sendInvitation = async (managedUserEmail: string) => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase.rpc('generate_wali_invitation', {
        wali_user_id: userId,
        managed_user_email: managedUserEmail,
      });

      if (error) throw error;

      toast({
        title: 'Invitation envoyée',
        description: `Une invitation a été envoyée à ${managedUserEmail}`,
      });

      fetchInvitations(); // Refresh the list
      return true;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Erreur d'invitation",
        description: error.message || "Impossible d'envoyer l'invitation",
        variant: 'destructive',
      });
      return false;
    }
  };

  // Confirm wali invitation
  const confirmInvitation = async (token: string) => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase.rpc('confirm_wali_invitation', {
        token: token,
        confirming_user_id: userId,
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Invitation confirmée',
          description: 'Votre wali a été confirmé avec succès',
        });
        fetchInvitations(); // Refresh the list
        return true;
      } else {
        toast({
          title: 'Invitation invalide',
          description: 'Cette invitation est expirée ou invalide',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error confirming invitation:', error);
      toast({
        title: 'Erreur de confirmation',
        description: error.message || "Impossible de confirmer l'invitation",
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchInvitations();
    }
  }, [userId]);

  return {
    invitations,
    loading,
    sendInvitation,
    confirmInvitation,
    refreshInvitations: fetchInvitations,
  };
};
