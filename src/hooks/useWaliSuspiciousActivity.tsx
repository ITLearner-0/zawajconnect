import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SuspiciousPattern {
  type: 'consecutive_rejections' | 'repeated_views' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  description: string;
  details: Record<string, any>;
  auditIds: string[];
}

export const useWaliSuspiciousActivity = () => {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [patterns, setPatterns] = useState<SuspiciousPattern[]>([]);

  /**
   * Détecte les rejets consécutifs
   */
  const detectConsecutiveRejections = useCallback(
    async (userId: string, threshold: number = 5): Promise<SuspiciousPattern | null> => {
      try {
        const { data, error } = await (supabase as any).rpc('detect_consecutive_rejections', {
          p_wali_user_id: userId,
          p_threshold: threshold,
        });

        if (error) throw error;

        if (data && data.length > 0 && data[0].should_alert) {
          const result = data[0];
          return {
            type: 'consecutive_rejections',
            severity: result.consecutive_count >= 10 ? 'critical' : 'high',
            count: result.consecutive_count,
            description: `${result.consecutive_count} rejets consécutifs détectés`,
            details: { consecutive_count: result.consecutive_count },
            auditIds: result.audit_ids || [],
          };
        }

        return null;
      } catch (error) {
        console.error('Error detecting consecutive rejections:', error);
        return null;
      }
    },
    []
  );

  /**
   * Détecte les vues répétées du même profil
   */
  const detectRepeatedProfileViews = useCallback(
    async (
      userId: string,
      threshold: number = 5,
      windowHours: number = 1
    ): Promise<SuspiciousPattern[]> => {
      try {
        const { data, error } = await (supabase as any).rpc('detect_repeated_profile_views', {
          p_wali_user_id: userId,
          p_threshold: threshold,
          p_window_hours: windowHours,
        });

        if (error) throw error;

        if (data && data.length > 0) {
          return data
            .filter((item: any) => item.should_alert)
            .map((item: any) => ({
              type: 'repeated_views' as const,
              severity:
                item.view_count >= 10 ? 'critical' : item.view_count >= 7 ? 'high' : 'medium',
              count: item.view_count,
              description: `${item.view_count} vues du même profil en ${windowHours}h`,
              details: {
                viewed_user_id: item.viewed_user_id,
                view_count: item.view_count,
                window_hours: windowHours,
              },
              auditIds: item.audit_ids || [],
            }));
        }

        return [];
      } catch (error) {
        console.error('Error detecting repeated profile views:', error);
        return [];
      }
    },
    []
  );

  /**
   * Détecte les tentatives de dépassement de limites
   */
  const detectRateLimitViolations = useCallback(
    async (userId: string): Promise<SuspiciousPattern[]> => {
      try {
        // Récupérer les stats de rate limit
        const { data: rateLimits, error } = await (supabase as any)
          .from('wali_rate_limits')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        const limits = {
          match_approval: 20,
          profile_view: 50,
          settings_modification: 10,
          notification_send: 30,
        };

        const violations: SuspiciousPattern[] = [];

        rateLimits?.forEach((limit: any) => {
          const maxLimit = limits[limit.action_type as keyof typeof limits] || 100;
          const percentage = (limit.action_count / maxLimit) * 100;

          if (percentage >= 95) {
            violations.push({
              type: 'rate_limit_exceeded',
              severity: percentage >= 100 ? 'critical' : 'high',
              count: limit.action_count,
              description: `Limite atteinte à ${Math.round(percentage)}% pour ${limit.action_type}`,
              details: {
                action_type: limit.action_type,
                action_count: limit.action_count,
                max_limit: maxLimit,
                percentage,
              },
              auditIds: [],
            });
          }
        });

        return violations;
      } catch (error) {
        console.error('Error detecting rate limit violations:', error);
        return [];
      }
    },
    []
  );

  /**
   * Analyse complète des comportements suspects
   */
  const analyzeActivity = useCallback(
    async (userId: string) => {
      try {
        setChecking(true);

        const [rejections, profileViews, rateLimitViolations] = await Promise.all([
          detectConsecutiveRejections(userId),
          detectRepeatedProfileViews(userId),
          detectRateLimitViolations(userId),
        ]);

        const allPatterns: SuspiciousPattern[] = [
          ...(rejections ? [rejections] : []),
          ...profileViews,
          ...rateLimitViolations,
        ];

        setPatterns(allPatterns);

        // Créer des alertes pour les patterns critiques et high
        for (const pattern of allPatterns) {
          if (pattern.severity === 'critical' || pattern.severity === 'high') {
            await createAdminAlert(userId, pattern);
          }
        }

        return allPatterns;
      } catch (error) {
        console.error('Error analyzing activity:', error);
        return [];
      } finally {
        setChecking(false);
      }
    },
    [detectConsecutiveRejections, detectRepeatedProfileViews, detectRateLimitViolations]
  );

  /**
   * Crée une alerte admin
   */
  const createAdminAlert = useCallback(async (userId: string, pattern: SuspiciousPattern) => {
    try {
      // Créer l'alerte dans la base
      const { data: alertData, error: alertError } = await (supabase as any).rpc(
        'create_admin_alert',
        {
          p_wali_user_id: userId,
          p_alert_type: pattern.type,
          p_risk_level: pattern.severity,
          p_pattern_detected: pattern.description,
          p_details: pattern.details,
          p_audit_log_ids: pattern.auditIds,
        }
      );

      if (alertError) throw alertError;

      // Notifier les admins via edge function
      const { error: notifyError } = await supabase.functions.invoke('notify-admin-alert', {
        body: {
          alert_id: alertData,
          wali_user_id: userId,
          alert_type: pattern.type,
          risk_level: pattern.severity,
          pattern_detected: pattern.description,
          details: pattern.details,
        },
      });

      if (notifyError) {
        console.error('Error notifying admins:', notifyError);
      }

      return alertData;
    } catch (error) {
      console.error('Error creating admin alert:', error);
      return null;
    }
  }, []);

  /**
   * Récupère les alertes d'un Wali
   */
  const getWaliAlerts = useCallback(async (userId: string, limit: number = 20) => {
    try {
      const { data, error } = await (supabase as any)
        .from('wali_admin_alerts')
        .select('*')
        .eq('wali_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting wali alerts:', error);
      return [];
    }
  }, []);

  return {
    analyzeActivity,
    detectConsecutiveRejections,
    detectRepeatedProfileViews,
    detectRateLimitViolations,
    createAdminAlert,
    getWaliAlerts,
    patterns,
    checking,
  };
};
