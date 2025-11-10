import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WaliEmailHistoryItem {
  id: string;
  wali_user_id: string;
  sent_by: string;
  sender_name: string;
  email_type: string;
  subject: string;
  message_content: string;
  delivery_status: string;
  error_message?: string;
  metadata: Record<string, any> | null;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
}

export interface WaliEmailStats {
  total_emails: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  opened_count: number;
  clicked_count: number;
  last_email_sent_at?: string;
}

export const useWaliEmailHistory = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getEmailHistory = async (waliUserId: string, limit: number = 50): Promise<WaliEmailHistoryItem[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_wali_email_history', {
        p_wali_user_id: waliUserId,
        p_limit: limit
      });

      if (error) throw error;

      return (data || []) as WaliEmailHistoryItem[];
    } catch (error: any) {
      console.error('Error fetching email history:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des emails",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getEmailStats = async (waliUserId: string): Promise<WaliEmailStats | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_wali_email_stats', {
        p_wali_user_id: waliUserId
      });

      if (error) throw error;

      return data?.[0] || null;
    } catch (error: any) {
      console.error('Error fetching email stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques d'emails",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getEmailHistory,
    getEmailStats,
    loading
  };
};
