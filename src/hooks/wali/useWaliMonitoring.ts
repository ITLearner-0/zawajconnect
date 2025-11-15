import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WaliAlert {
  id: string;
  wali_user_id: string;
  alert_type: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: any;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface WaliStatistics {
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

export interface WaliActivity {
  wali_user_id: string;
  full_name: string;
  total_actions: number;
  suspicious_actions: number;
  last_activity: string;
  risk_score: number;
}

export const useWaliMonitoring = () => {
  const [alerts, setAlerts] = useState<WaliAlert[]>([]);
  const [statistics, setStatistics] = useState<WaliStatistics | null>(null);
  const [activities, setActivities] = useState<WaliActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch alerts
      const { data: alertsData, error: alertsError } = await (supabase as any)
        .from('wali_admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsError) throw alertsError;

      // Fetch statistics using RPC
      const { data: statsData, error: statsError } = await (supabase as any).rpc(
        'get_wali_alerts_statistics'
      );

      if (statsError) throw statsError;

      // Fetch recent activities
      const { data: activitiesData, error: activitiesError } = await (supabase as any)
        .from('wali_action_audit')
        .select(
          `
          wali_user_id,
          action_type,
          risk_level,
          suspicious_pattern,
          created_at
        `
        )
        .order('created_at', { ascending: false })
        .limit(100);

      if (activitiesError) throw activitiesError;

      // Process activities to get aggregated data
      const activityMap = new Map<string, any>();

      activitiesData?.forEach((activity: any) => {
        const existing = activityMap.get(activity.wali_user_id) || {
          wali_user_id: activity.wali_user_id,
          total_actions: 0,
          suspicious_actions: 0,
          last_activity: activity.created_at,
          risk_score: 0,
        };

        existing.total_actions += 1;
        if (activity.suspicious_pattern) {
          existing.suspicious_actions += 1;
        }
        if (activity.risk_level === 'critical') {
          existing.risk_score += 10;
        } else if (activity.risk_level === 'high') {
          existing.risk_score += 5;
        } else if (activity.risk_level === 'medium') {
          existing.risk_score += 2;
        }

        activityMap.set(activity.wali_user_id, existing);
      });

      // Get user names for activities
      const userIds = Array.from(activityMap.keys());
      if (userIds.length > 0) {
        const { data: profilesData } = await (supabase as any)
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        profilesData?.forEach((profile: any) => {
          const activity = activityMap.get(profile.user_id);
          if (activity) {
            activity.full_name = profile.full_name || 'Utilisateur inconnu';
          }
        });
      }

      setAlerts(alertsData || []);
      setStatistics(statsData || null);
      setActivities(Array.from(activityMap.values()));
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load monitoring data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string, adminId: string) => {
    try {
      const { error } = await (supabase as any).rpc('acknowledge_wali_alert', {
        p_alert_id: alertId,
        p_admin_id: adminId,
      });

      if (error) throw error;

      toast({
        title: 'Alerte confirmée',
        description: "L'alerte a été marquée comme lue.",
      });

      await fetchMonitoringData();
      return true;
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Erreur lors de la confirmation',
        variant: 'destructive',
      });
      return false;
    }
  };

  const suspendWali = async (
    waliUserId: string,
    adminId: string,
    reason: string,
    durationDays: number = 30
  ) => {
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
        description: `Le Wali a été suspendu pour ${durationDays} jours.`,
      });

      await fetchMonitoringData();
      return true;
    } catch (err) {
      console.error('Error suspending Wali:', err);
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Erreur lors de la suspension',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    alerts,
    statistics,
    activities,
    loading,
    error,
    refetch: fetchMonitoringData,
    acknowledgeAlert,
    suspendWali,
  };
};
