import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DataPoint,
  Prediction,
  Anomaly,
  predictFutureValues,
  detectAnomalies,
  calculateTrend,
} from '@/utils/analytics/predictiveAnalytics';

export interface PredictiveAnalytics {
  registrations: {
    historical: DataPoint[];
    predictions: Prediction[];
    anomalies: Anomaly[];
    trend: ReturnType<typeof calculateTrend>;
  };
  alerts: {
    historical: DataPoint[];
    predictions: Prediction[];
    anomalies: Anomaly[];
    trend: ReturnType<typeof calculateTrend>;
  };
  processingTime: {
    historical: DataPoint[];
    predictions: Prediction[];
    anomalies: Anomaly[];
    trend: ReturnType<typeof calculateTrend>;
  };
}

export const usePredictiveAnalytics = (months: number = 3) => {
  const [analytics, setAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictiveData = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      const startDateStr = startDate.toISOString().split('T')[0];

      // Generate simulated data for analytics (replace with real DB queries when tables are available)
      const daysToGenerate = months * 30;
      const registrationsData: any[] = [];
      const alertsData: any[] = [];
      const processingData: any[] = [];

      // Generate realistic sample data with trends
      for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString();

        // Registrations with upward trend
        const baseReg = 5 + Math.floor(i / 10);
        const regCount = baseReg + Math.floor(Math.random() * 5);
        for (let j = 0; j < regCount; j++) {
          registrationsData.push({
            created_at: dateStr,
            reviewed_at: new Date(
              date.getTime() + Math.random() * 24 * 60 * 60 * 1000
            ).toISOString(),
          });
        }

        // Alerts with slight downward trend
        const baseAlert = Math.max(1, 8 - Math.floor(i / 15));
        const alertCount = baseAlert + Math.floor(Math.random() * 4);
        for (let j = 0; j < alertCount; j++) {
          alertsData.push({
            created_at: dateStr,
            risk_level: Math.random() > 0.7 ? 'critical' : 'medium',
          });
        }

        // Processing times
        const procCount = Math.floor(regCount * 0.7);
        for (let j = 0; j < procCount; j++) {
          const procHours = 2 + Math.random() * 20;
          processingData.push({
            created_at: dateStr,
            reviewed_at: new Date(date.getTime() + procHours * 60 * 60 * 1000).toISOString(),
          });
        }
      }

      // Process registrations data
      const regByDay = new Map<string, number>();
      ((registrationsData as any[]) || []).forEach((reg: any) => {
        if (reg.created_at) {
          const date = reg.created_at.split('T')[0];
          if (date) {
            regByDay.set(date, (regByDay.get(date) || 0) + 1);
          }
        }
      });

      const registrationsHistorical: DataPoint[] = Array.from(regByDay.entries())
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Process alerts data
      const alertsByDay = new Map<string, number>();
      ((alertsData as any[]) || []).forEach((alert: any) => {
        if (alert.created_at) {
          const date = alert.created_at.split('T')[0];
          if (date) {
            alertsByDay.set(date, (alertsByDay.get(date) || 0) + 1);
          }
        }
      });

      const alertsHistorical: DataPoint[] = Array.from(alertsByDay.entries())
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Process processing time data
      const procTimeByDay = new Map<string, number[]>();
      ((processingData as any[]) || []).forEach((proc: any) => {
        if (proc.created_at && proc.reviewed_at) {
          const date = proc.created_at.split('T')[0];
          if (date) {
            const createdAt = new Date(proc.created_at);
            const reviewedAt = new Date(proc.reviewed_at);
            const hours = (reviewedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

            if (!procTimeByDay.has(date)) {
              procTimeByDay.set(date, []);
            }
            procTimeByDay.get(date)?.push(hours);
          }
        }
      });

      const processingTimeHistorical: DataPoint[] = Array.from(procTimeByDay.entries())
        .map(([date, times]) => ({
          date,
          value: Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 10) / 10,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Generate predictions and detect anomalies
      setAnalytics({
        registrations: {
          historical: registrationsHistorical,
          predictions: predictFutureValues(registrationsHistorical, 30),
          anomalies: detectAnomalies(registrationsHistorical, 'Inscriptions'),
          trend: calculateTrend(registrationsHistorical),
        },
        alerts: {
          historical: alertsHistorical,
          predictions: predictFutureValues(alertsHistorical, 30),
          anomalies: detectAnomalies(alertsHistorical, 'Alertes'),
          trend: calculateTrend(alertsHistorical),
        },
        processingTime: {
          historical: processingTimeHistorical,
          predictions: predictFutureValues(processingTimeHistorical, 30),
          anomalies: detectAnomalies(processingTimeHistorical, 'Temps de traitement'),
          trend: calculateTrend(processingTimeHistorical),
        },
      });
    } catch (err) {
      console.error('Error fetching predictive analytics:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictiveData();
  }, [months]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchPredictiveData,
  };
};
