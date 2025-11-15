import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoginStreakData {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  loading: boolean;
}

export const useLoginStreak = (userId?: string) => {
  const [streakData, setStreakData] = useState<LoginStreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: null,
    loading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setStreakData(prev => ({ ...prev, loading: false }));
      return;
    }

    loadStreak();
    trackDailyLogin();
  }, [userId]);

  const loadStreak = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('user_levels')
        .select('current_streak, longest_streak, last_login_date')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading streak:', error);
        setStreakData(prev => ({ ...prev, loading: false }));
        return;
      }

      if (data) {
        setStreakData({
          currentStreak: data.current_streak || 0,
          longestStreak: data.longest_streak || 0,
          lastLoginDate: data.last_login_date || null,
          loading: false,
        });
      } else {
        setStreakData(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading login streak:', error);
      setStreakData(prev => ({ ...prev, loading: false }));
    }
  };

  const trackDailyLogin = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) return;

      const { data, error } = await supabase.functions.invoke('track-daily-login', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setStreakData({
          currentStreak: data.streak,
          longestStreak: data.longestStreak || data.streak,
          lastLoginDate: new Date().toISOString().split('T')[0] || null,
          loading: false,
        });

        // Show notification for new streak or milestone
        if (data.isNewStreak) {
          toast({
            title: '🔥 Streak Started!',
            description: 'Welcome back! Your login streak has begun.',
          });
        } else if (data.badgesAwarded && data.badgesAwarded.length > 0) {
          toast({
            title: '🏆 Streak Milestone!',
            description: `${data.streak} day streak! Keep it going!`,
          });
        } else if (!data.alreadyLoggedToday && !data.streakBroken) {
          toast({
            title: '🔥 Streak Updated!',
            description: `${data.streak} day streak! Keep it going!`,
          });
        }
      }
    } catch (error) {
      console.error('Error tracking daily login:', error);
    }
  };

  return {
    ...streakData,
    refetch: loadStreak,
  };
};
