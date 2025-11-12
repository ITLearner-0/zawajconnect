import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminWaliAlert {
  id: string;
  wali_user_id: string;
  alert_type: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  pattern_detected: string;
  details: Record<string, any>;
  audit_log_ids: string[];
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
  wali_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface AlertsStatistics {
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  unacknowledged_alerts: number;
  alerts_today: number;
  alerts_this_week: number;
  alerts_this_month: number;
}

export interface AlertTrend {
  date: string;
  total_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

export const useAdminWaliAlerts = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  /**
   * Récupère toutes les alertes avec filtres
   */
  const getAlerts = useCallback(
    async (filters?: {
      risk_level?: string;
      acknowledged?: boolean;
      date_from?: string;
      date_to?: string;
      limit?: number;
    }) => {
      try {
        setLoading(true);

        let query = (supabase as any)
          .from('wali_admin_alerts')
          .select(
            `
          *,
          wali_profile:profiles!wali_admin_alerts_wali_user_id_fkey(
            first_name,
            last_name,
            email
          )
        `
          )
          .order('created_at', { ascending: false });

        if (filters?.risk_level) {
          query = query.eq('risk_level', filters.risk_level);
        }

        if (filters?.acknowledged !== undefined) {
          query = query.eq('acknowledged', filters.acknowledged);
        }

        if (filters?.date_from) {
          query = query.gte('created_at', filters.date_from);
        }

        if (filters?.date_to) {
          query = query.lte('created_at', filters.date_to);
        }

        if (filters?.limit) {
          query = query.limit(filters.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return (data || []) as AdminWaliAlert[];
      } catch (error) {
        console.error('Error fetching alerts:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les alertes',
          variant: 'destructive',
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  /**
   * Récupère les statistiques globales
   */
  const getStatistics = useCallback(async (): Promise<AlertsStatistics | null> => {
    try {
      const { data, error } = await (supabase as any).rpc('get_wali_alerts_statistics');

      if (error) throw error;

      if (data && data.length > 0) {
        return data[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return null;
    }
  }, []);

  /**
   * Récupère les tendances d'alertes
   */
  const getTrends = useCallback(async (days: number = 30): Promise<AlertTrend[]> => {
    try {
      const { data, error } = await (supabase as any).rpc('get_wali_alerts_trend', {
        p_days: days,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trends:', error);
      return [];
    }
  }, []);

  /**
   * Marque une alerte comme traitée
   */
  const acknowledgeAlert = useCallback(
    async (alertId: string, adminId: string) => {
      try {
        const { error } = await (supabase as any).rpc('acknowledge_wali_alert', {
          p_alert_id: alertId,
          p_admin_id: adminId,
        });

        if (error) throw error;

        toast({
          title: 'Alerte traitée',
          description: "L'alerte a été marquée comme traitée",
        });

        return true;
      } catch (error: any) {
        console.error('Error acknowledging alert:', error);
        toast({
          title: 'Erreur',
          description: error.message || "Impossible de marquer l'alerte comme traitée",
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast]
  );

  /**
   * Suspend un Wali
   */
  const suspendWali = useCallback(
    async (waliUserId: string, adminId: string, reason: string, durationDays: number = 30) => {
      try {
        const { error } = await (supabase as any).rpc('suspend_wali_user', {
          p_wali_user_id: waliUserId,
          p_admin_id: adminId,
          p_reason: reason,
          p_duration_days: durationDays,
        });

        if (error) throw error;

        toast({
          title: 'Wali suspendu',
          description: `Le Wali a été suspendu pour ${durationDays} jours`,
        });

        return true;
      } catch (error: any) {
        console.error('Error suspending wali:', error);
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible de suspendre le Wali',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast]
  );

  /**
   * Vérifie si un Wali est suspendu
   */
  const checkSuspension = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await (supabase as any).rpc('is_wali_suspended', {
        p_user_id: userId,
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking suspension:', error);
      return false;
    }
  }, []);

  return {
    getAlerts,
    getStatistics,
    getTrends,
    acknowledgeAlert,
    suspendWali,
    checkSuspension,
    loading,
  };
};
