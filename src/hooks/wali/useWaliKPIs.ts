import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WaliKPIData {
  total_registrations: number;
  approved_count: number;
  rejected_count: number;
  pending_count?: number;
  avg_processing_time_hours: number;
  approval_rate: number;
  total_alerts: number;
  critical_alerts: number;
  alerts_per_day?: number;
}

export interface WaliKPIComparison {
  registrations_change: number;
  approval_rate_change: number;
  processing_time_change: number;
  alerts_change: number;
}

export interface WaliKPIs {
  current: WaliKPIData;
  previous: WaliKPIData;
  comparison: WaliKPIComparison;
}

export type KPIPeriod = '7days' | '30days' | '90days' | 'custom';

const getPeriodDates = (period: KPIPeriod) => {
  const now = new Date();
  const currentEnd = new Date(now);
  currentEnd.setHours(23, 59, 59, 999);

  let currentStart: Date;
  let previousStart: Date;
  let previousEnd: Date;

  switch (period) {
    case '7days':
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 7);
      currentStart.setHours(0, 0, 0, 0);

      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousEnd.getDate() - 7);
      previousStart.setHours(0, 0, 0, 0);
      break;

    case '30days':
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 30);
      currentStart.setHours(0, 0, 0, 0);

      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousEnd.getDate() - 30);
      previousStart.setHours(0, 0, 0, 0);
      break;

    case '90days':
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 90);
      currentStart.setHours(0, 0, 0, 0);

      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousEnd.getDate() - 90);
      previousStart.setHours(0, 0, 0, 0);
      break;

    default:
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 30);
      currentStart.setHours(0, 0, 0, 0);

      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousEnd.getDate() - 30);
      previousStart.setHours(0, 0, 0, 0);
  }

  return {
    currentStart: currentStart.toISOString().split('T')[0],
    currentEnd: currentEnd.toISOString().split('T')[0],
    previousStart: previousStart.toISOString().split('T')[0],
    previousEnd: previousEnd.toISOString().split('T')[0],
  };
};

export const useWaliKPIs = (period: KPIPeriod = '30days') => {
  const [kpis, setKpis] = useState<WaliKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      setError(null);

      const dates = getPeriodDates(period);

      const { data, error: rpcError } = await (supabase as any).rpc('get_wali_kpis', {
        p_current_start: dates.currentStart,
        p_current_end: dates.currentEnd,
        p_previous_start: dates.previousStart,
        p_previous_end: dates.previousEnd,
      });

      if (rpcError) throw rpcError;

      setKpis(data);
    } catch (err) {
      console.error('Error fetching Wali KPIs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load KPIs';
      setError(errorMessage);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les métriques',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, [period]);

  return {
    kpis,
    loading,
    error,
    refetch: fetchKPIs,
  };
};
