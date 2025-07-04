
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileAnalytics {
  profileViews: number;
  profileViewsThisWeek: number;
  averageMatchScore: number;
  responseRate: number;
  profileCompleteness: number;
  popularTimes: string[];
  topMatchingCategories: string[];
}

export const useProfileAnalytics = (userId?: string) => {
  const [analytics, setAnalytics] = useState<ProfileAnalytics>({
    profileViews: 0,
    profileViewsThisWeek: 0,
    averageMatchScore: 0,
    responseRate: 0,
    profileCompleteness: 0,
    popularTimes: [],
    topMatchingCategories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Calculate profile completeness
        const completeness = await calculateProfileCompleteness(userId);

        // For now, return mock data since we don't have analytics tables
        // In a real implementation, you would fetch from analytics tables
        const mockAnalytics: ProfileAnalytics = {
          profileViews: Math.floor(Math.random() * 500) + 50,
          profileViewsThisWeek: Math.floor(Math.random() * 50) + 5,
          averageMatchScore: Math.floor(Math.random() * 30) + 65,
          responseRate: Math.floor(Math.random() * 40) + 50,
          profileCompleteness: completeness,
          popularTimes: ['14h-16h', '19h-21h', '21h-23h'],
          topMatchingCategories: ['Pratique religieuse', 'Valeurs familiales', 'Éducation']
        };

        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Error fetching profile analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  const calculateProfileCompleteness = async (userId: string): Promise<number> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile for completeness:', error);
        return 0;
      }

      if (!profile) return 0;

      const requiredFields = [
        'first_name', 'last_name', 'gender', 'birth_date', 
        'location', 'education_level', 'occupation', 
        'religious_practice_level', 'about_me'
      ];

      const completedFields = requiredFields.filter(field => 
        profile[field] && profile[field].toString().trim() !== ''
      );

      return Math.round((completedFields.length / requiredFields.length) * 100);
    } catch (error) {
      console.error('Error calculating profile completeness:', error);
      return 0;
    }
  };

  return { analytics, loading };
};
