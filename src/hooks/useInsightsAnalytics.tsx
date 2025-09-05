import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface InsightsAnalytics {
  viewCount: number;
  lastViewed: string | null;
  shareCount: number;
  exportCount: number;
  actionsTaken: string[];
}

export const useInsightsAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<InsightsAnalytics>({
    viewCount: 0,
    lastViewed: null,
    shareCount: 0,
    exportCount: 0,
    actionsTaken: []
  });

  useEffect(() => {
    if (user) {
      trackInsightView();
      loadAnalytics();
    }
  }, [user]);

  const trackInsightView = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          // We can extend user_settings table or create a new analytics table
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking insight view:', error);
    }
  };

  const trackAction = async (action: string) => {
    try {
      // For now, we'll store in local state
      // In production, this would go to a proper analytics table
      setAnalytics(prev => ({
        ...prev,
        actionsTaken: [...prev.actionsTaken, action]
      }));
    } catch (error) {
      console.error('Error tracking action:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Load user analytics data
      // For now, using mock data as we'd need to create proper analytics tables
      setAnalytics({
        viewCount: Math.floor(Math.random() * 10) + 1,
        lastViewed: new Date().toISOString(),
        shareCount: Math.floor(Math.random() * 3),
        exportCount: Math.floor(Math.random() * 2),
        actionsTaken: ['view_insights', 'complete_test']
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const getInsightEngagement = (): 'low' | 'medium' | 'high' => {
    const totalActions = analytics.shareCount + analytics.exportCount + analytics.actionsTaken.length;
    if (totalActions >= 10) return 'high';
    if (totalActions >= 5) return 'medium';
    return 'low';
  };

  const getRecommendations = (): string[] => {
    const engagement = getInsightEngagement();
    const recommendations = [];

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

    return recommendations;
  };

  return {
    analytics,
    trackAction,
    getInsightEngagement,
    getRecommendations,
    refresh: loadAnalytics
  };
};