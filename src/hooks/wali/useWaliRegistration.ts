import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WaliRegistration {
  id: string;
  user_id: string;
  wali_profile_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  relationship_to_user: string;
  id_document_url?: string;
  proof_of_relationship_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'verified';
  rejection_reason?: string;
  verification_notes?: string;
  verified_by?: string;
  verified_at?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export const useWaliRegistration = (userId?: string) => {
  const [registration, setRegistration] = useState<WaliRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchRegistration();
  }, [userId]);

  const fetchRegistration = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('wali_registrations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setRegistration(data as WaliRegistration | null);
    } catch (err) {
      console.error('Error fetching wali registration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load registration';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createRegistration = async (data: Partial<WaliRegistration>) => {
    if (!userId) return null;

    try {
      const { data: newRegistration, error: createError } = await (supabase as any)
        .from('wali_registrations')
        .insert({
          user_id: userId,
          ...data,
        })
        .select()
        .single();

      if (createError) throw createError;

      setRegistration(newRegistration as WaliRegistration);
      toast({
        title: 'Registration Submitted',
        description: 'Your Wali registration has been submitted for review.',
      });

      return newRegistration as WaliRegistration;
    } catch (err) {
      console.error('Error creating wali registration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create registration';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateRegistration = async (id: string, updates: Partial<WaliRegistration>) => {
    try {
      const { data, error: updateError } = await (supabase as any)
        .from('wali_registrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setRegistration(data as WaliRegistration);
      toast({
        title: 'Updated',
        description: 'Registration has been updated.',
      });

      return data as WaliRegistration;
    } catch (err) {
      console.error('Error updating wali registration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update registration';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    registration,
    loading,
    error,
    refetch: fetchRegistration,
    createRegistration,
    updateRegistration,
  };
};
