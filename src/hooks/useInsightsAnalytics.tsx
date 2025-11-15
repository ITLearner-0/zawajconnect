import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { InsightsAnalytics, EngagementLevel } from '@/types/compatibility';

export interface UseInsightsAnalyticsReturn {
  analytics: InsightsAnalytics;
  trackAction: (action: string, metadata?: Record<string, unknown>) => Promise<void>;
  trackView: () => Promise<void>;
  trackShare: () => Promise<void>;
  trackExport: () => Promise<void>;
  getInsightEngagement: () => EngagementLevel;
  getRecommendations: () => string[];
  refresh: () => Promise<void>;
  loading: boolean;
}

export const useInsightsAnalytics = (): UseInsightsAnalyticsReturn => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<InsightsAnalytics>({
    viewCount: 0,
    lastViewed: undefined,
    shareCount: 0,
    exportCount: 0,
    actionsTaken: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  /**
   * Charge les analytics depuis Supabase
   */
  const loadAnalytics = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      // Charger les analytics de base
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('insights_analytics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (analyticsError && analyticsError.code !== 'PGRST116') {
        throw analyticsError;
      }

      // Charger les actions récentes (derniers 30 jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: actionsData, error: actionsError } = await supabase
        .from('insight_actions')
        .select('action_type')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (actionsError) {
        throw actionsError;
      }

      // Si pas d'analytics, créer une entrée
      if (!analyticsData) {
        const { error: insertError } = await supabase.from('insights_analytics').insert({
          user_id: user.id,
          view_count: 0,
          share_count: 0,
          export_count: 0,
        });

        if (insertError) {
          throw insertError;
        }

        setAnalytics({
          viewCount: 0,
          lastViewed: undefined,
          shareCount: 0,
          exportCount: 0,
          actionsTaken: [],
        });
      } else {
        setAnalytics({
          viewCount: analyticsData.view_count || 0,
          lastViewed: analyticsData.last_viewed_at || undefined,
          shareCount: analyticsData.share_count || 0,
          exportCount: analyticsData.export_count || 0,
          actionsTaken: actionsData?.map((a) => a.action_type) || [],
        });
      }
    } catch (error: unknown) {
      console.error('Error loading analytics:', error);
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Track une action générique
   */
  const trackAction = async (
    action: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase.from('insight_actions').insert({
        user_id: user.id,
        action_type: action,
        metadata: metadata as never,
      });

      if (error) throw error;

      // Mettre à jour l'état local
      setAnalytics((prev) => ({
        ...prev,
        actionsTaken: [action, ...prev.actionsTaken],
      }));
    } catch (error: unknown) {
      console.error('Error tracking action:', error);
    }
  };

  /**
   * Track une vue d'insights
   */
  const trackView = async (): Promise<void> => {
    if (!user) return;

    try {
      // Incrémenter le compteur de vues
      const { error } = await supabase.rpc('increment_insight_views', {
        p_user_id: user.id,
      });

      if (error) {
        // Si la fonction n'existe pas, faire un update manuel
        const { error: updateError } = await supabase
          .from('insights_analytics')
          .update({
            view_count: analytics.viewCount + 1,
            last_viewed_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      // Logger l'action
      await trackAction('view_insights');

      // Mettre à jour l'état local
      setAnalytics((prev) => ({
        ...prev,
        viewCount: prev.viewCount + 1,
        lastViewed: new Date().toISOString(),
      }));
    } catch (error: unknown) {
      console.error('Error tracking view:', error);
    }
  };

  /**
   * Track un partage d'insights
   */
  const trackShare = async (): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('insights_analytics')
        .update({
          share_count: analytics.shareCount + 1,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await trackAction('share_insights');

      setAnalytics((prev) => ({
        ...prev,
        shareCount: prev.shareCount + 1,
      }));

      toast.success('Partage enregistré !');
    } catch (error: unknown) {
      console.error('Error tracking share:', error);
    }
  };

  /**
   * Track un export PDF
   */
  const trackExport = async (): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('insights_analytics')
        .update({
          export_count: analytics.exportCount + 1,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await trackAction('export_pdf');

      setAnalytics((prev) => ({
        ...prev,
        exportCount: prev.exportCount + 1,
      }));

      toast.success('Export enregistré !');
    } catch (error: unknown) {
      console.error('Error tracking export:', error);
    }
  };

  /**
   * Calcule le niveau d'engagement
   */
  const getInsightEngagement = (): EngagementLevel => {
    const totalActions =
      analytics.shareCount + analytics.exportCount + analytics.actionsTaken.length;
    if (totalActions >= 10) return 'high';
    if (totalActions >= 5) return 'medium';
    return 'low';
  };

  /**
   * Génère des recommandations personnalisées
   */
  const getRecommendations = (): string[] => {
    const engagement = getInsightEngagement();
    const recommendations: string[] = [];

    if (analytics.shareCount === 0) {
      recommendations.push('Partagez vos insights avec votre famille pour obtenir leurs avis');
    }

    if (analytics.exportCount === 0) {
      recommendations.push('Exportez vos insights en PDF pour les consulter hors ligne');
    }

    if (engagement === 'low') {
      recommendations.push('Explorez davantage vos insights pour optimiser votre recherche');
    }

    if (!analytics.actionsTaken.includes('browse_profiles')) {
      recommendations.push('Découvrez des profils compatibles basés sur vos insights');
    }

    if (analytics.viewCount < 3) {
      recommendations.push('Revisitez vos insights régulièrement pour suivre votre progression');
    }

    return recommendations;
  };

  return {
    analytics,
    trackAction,
    trackView,
    trackShare,
    trackExport,
    getInsightEngagement,
    getRecommendations,
    refresh: loadAnalytics,
    loading,
  };
};
