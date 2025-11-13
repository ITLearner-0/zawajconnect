import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WaliSuspension {
  id: string;
  wali_id: string;
  user_id: string;
  reason: string;
  suspension_type: 'temporary' | 'permanent' | 'warning';
  suspended_by: string;
  suspended_at: string;
  expires_at?: string;
  lifted_at?: string;
  lifted_by?: string;
  notes?: string;
  severity_level?: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWaliSuspensions = (waliId?: string) => {
  const [suspensions, setSuspensions] = useState<WaliSuspension[]>([]);
  const [activeSuspension, setActiveSuspension] = useState<WaliSuspension | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!waliId) {
      setLoading(false);
      return;
    }
    fetchSuspensions();
  }, [waliId]);

  const fetchSuspensions = async () => {
    if (!waliId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('wali_suspensions')
        .select('*')
        .eq('wali_id', waliId)
        .order('suspended_at', { ascending: false });

      if (error) throw error;

      setSuspensions(data || []);

      // Find active suspension
      const active = data?.find(
        (s) =>
          s.is_active &&
          (!s.expires_at || new Date(s.expires_at) > new Date())
      ) || null;
      
      setActiveSuspension(active);
    } catch (err) {
      console.error('Error fetching suspensions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSuspension = async (data: Partial<WaliSuspension>) => {
    if (!waliId) return null;

    try {
      const { data: newSuspension, error } = await supabase
        .from('wali_suspensions')
        .insert({
          wali_id: waliId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchSuspensions();
      
      toast({
        title: 'Suspension Created',
        description: 'Wali has been suspended.',
      });

      return newSuspension;
    } catch (err) {
      console.error('Error creating suspension:', err);
      toast({
        title: 'Error',
        description: 'Failed to create suspension',
        variant: 'destructive',
      });
      return null;
    }
  };

  const liftSuspension = async (suspensionId: string, liftedBy: string) => {
    try {
      const { data, error } = await supabase
        .from('wali_suspensions')
        .update({
          is_active: false,
          lifted_at: new Date().toISOString(),
          lifted_by: liftedBy,
        })
        .eq('id', suspensionId)
        .select()
        .single();

      if (error) throw error;

      await fetchSuspensions();
      
      toast({
        title: 'Suspension Lifted',
        description: 'Wali suspension has been lifted.',
      });

      return data;
    } catch (err) {
      console.error('Error lifting suspension:', err);
      toast({
        title: 'Error',
        description: 'Failed to lift suspension',
        variant: 'destructive',
      });
      return null;
    }
  };

  const isSuspended = (): boolean => {
    return activeSuspension !== null;
  };

  return {
    suspensions,
    activeSuspension,
    loading,
    refetch: fetchSuspensions,
    createSuspension,
    liftSuspension,
    isSuspended,
  };
};
