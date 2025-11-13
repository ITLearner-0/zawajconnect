import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format, subMonths, eachMonthOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface MonthlyTrend {
  month: string;
  monthLabel: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ActivityTrend {
  month: string;
  monthLabel: string;
  registrations: number;
  approvals: number;
  rejections: number;
  suspensions: number;
}

export interface RegistrationStatusTrend {
  month: string;
  monthLabel: string;
  pending: number;
  approved: number;
  rejected: number;
  verified: number;
}

export const useWaliTrends = (months: number = 12) => {
  const [alertsTrend, setAlertsTrend] = useState<MonthlyTrend[]>([]);
  const [activityTrend, setActivityTrend] = useState<ActivityTrend[]>([]);
  const [registrationsTrend, setRegistrationsTrend] = useState<RegistrationStatusTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrends();
  }, [months]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);

      // Générer les mois pour la période
      const endDate = new Date();
      const startDate = subMonths(endDate, months - 1);
      const monthsRange = eachMonthOfInterval({ start: startDate, end: endDate });

      // Fetch alerts trend
      const { data: alertsData, error: alertsError } = await supabase
        .from('wali_admin_alerts' as any)
        .select('created_at, risk_level')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true }) as any;

      if (alertsError) throw alertsError;

      // Fetch activity trend
      const { data: activityData, error: activityError } = await supabase
        .from('wali_action_audit' as any)
        .select('created_at, action_type')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true }) as any;

      if (activityError) throw activityError;

      // Fetch registrations trend
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('wali_registrations' as any)
        .select('created_at, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true }) as any;

      if (registrationsError) throw registrationsError;

      // Process alerts trend
      const alertsTrendData = monthsRange.map(month => {
        const monthKey = format(month, 'yyyy-MM');
        const monthLabel = format(month, 'MMM yyyy', { locale: fr });
        
        const monthAlerts = alertsData?.filter((alert: any) => 
          format(new Date(alert.created_at), 'yyyy-MM') === monthKey
        ) || [];

        return {
          month: monthKey,
          monthLabel,
          total: monthAlerts.length,
          critical: monthAlerts.filter((a: any) => a.risk_level === 'critical').length,
          high: monthAlerts.filter((a: any) => a.risk_level === 'high').length,
          medium: monthAlerts.filter((a: any) => a.risk_level === 'medium').length,
          low: monthAlerts.filter((a: any) => a.risk_level === 'low').length,
        };
      });

      // Process activity trend
      const activityTrendData = monthsRange.map(month => {
        const monthKey = format(month, 'yyyy-MM');
        const monthLabel = format(month, 'MMM yyyy', { locale: fr });
        
        const monthActivities = activityData?.filter((activity: any) => 
          format(new Date(activity.created_at), 'yyyy-MM') === monthKey
        ) || [];

        return {
          month: monthKey,
          monthLabel,
          registrations: monthActivities.filter((a: any) => a.action_type === 'wali_registration_submitted').length,
          approvals: monthActivities.filter((a: any) => a.action_type === 'wali_approved').length,
          rejections: monthActivities.filter((a: any) => a.action_type === 'wali_rejected').length,
          suspensions: monthActivities.filter((a: any) => a.action_type === 'wali_suspended').length,
        };
      });

      // Process registrations status trend
      const registrationsTrendData = monthsRange.map(month => {
        const monthKey = format(month, 'yyyy-MM');
        const monthLabel = format(month, 'MMM yyyy', { locale: fr });
        
        const monthRegistrations = registrationsData?.filter((reg: any) => 
          format(new Date(reg.created_at), 'yyyy-MM') === monthKey
        ) || [];

        return {
          month: monthKey,
          monthLabel,
          pending: monthRegistrations.filter((r: any) => r.status === 'pending').length,
          approved: monthRegistrations.filter((r: any) => r.status === 'approved').length,
          rejected: monthRegistrations.filter((r: any) => r.status === 'rejected').length,
          verified: monthRegistrations.filter((r: any) => r.status === 'verified').length,
        };
      });

      setAlertsTrend(alertsTrendData);
      setActivityTrend(activityTrendData);
      setRegistrationsTrend(registrationsTrendData);
    } catch (err) {
      console.error('Error fetching Wali trends:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return {
    alertsTrend,
    activityTrend,
    registrationsTrend,
    loading,
    error,
    refetch: fetchTrends,
  };
};
