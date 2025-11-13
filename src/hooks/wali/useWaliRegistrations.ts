import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WaliRegistration } from './useWaliRegistration';

interface UseWaliRegistrationsOptions {
  status?: 'pending' | 'approved' | 'rejected' | 'verified';
  limit?: number;
}

export const useWaliRegistrations = (options: UseWaliRegistrationsOptions = {}) => {
  const [registrations, setRegistrations] = useState<WaliRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
  }, [options.status, options.limit]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = (supabase as any)
        .from('wali_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setRegistrations(data as WaliRegistration[]);
    } catch (err) {
      console.error('Error fetching wali registrations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load registrations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (id: string, reviewedBy: string) => {
    try {
      const { error: updateError } = await (supabase as any)
        .from('wali_registrations')
        .update({
          status: 'approved',
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Send notification email
      try {
        await supabase.functions.invoke('send-wali-status-notification', {
          body: {
            registration_id: id,
            status: 'approved',
          },
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the approval if email fails
      }

      toast({
        title: 'Inscription approuvée',
        description: 'Le Wali a été approuvé avec succès. Un email de confirmation a été envoyé.',
      });

      await fetchRegistrations();
      return true;
    } catch (err) {
      console.error('Error approving registration:', err);
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Erreur lors de l\'approbation',
        variant: 'destructive',
      });
      return false;
    }
  };

  const rejectRegistration = async (
    id: string,
    reviewedBy: string,
    rejectionReason: string
  ) => {
    try {
      const { error: updateError } = await (supabase as any)
        .from('wali_registrations')
        .update({
          status: 'rejected',
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Send notification email
      try {
        await supabase.functions.invoke('send-wali-status-notification', {
          body: {
            registration_id: id,
            status: 'rejected',
            rejection_reason: rejectionReason,
          },
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the rejection if email fails
      }

      toast({
        title: 'Inscription rejetée',
        description: 'L\'inscription a été rejetée. Un email a été envoyé au candidat.',
      });

      await fetchRegistrations();
      return true;
    } catch (err) {
      console.error('Error rejecting registration:', err);
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Erreur lors du rejet',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateVerificationNotes = async (id: string, notes: string) => {
    try {
      const { error: updateError } = await (supabase as any)
        .from('wali_registrations')
        .update({
          verification_notes: notes,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Notes mises à jour',
        description: 'Les notes de vérification ont été enregistrées.',
      });

      await fetchRegistrations();
      return true;
    } catch (err) {
      console.error('Error updating notes:', err);
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Erreur lors de la mise à jour',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    registrations,
    loading,
    error,
    refetch: fetchRegistrations,
    approveRegistration,
    rejectRegistration,
    updateVerificationNotes,
  };
};
