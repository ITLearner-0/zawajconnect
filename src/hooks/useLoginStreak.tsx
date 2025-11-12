import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoginStreak {
  current_streak: number;
  longest_streak: number;
  last_login_date: string;
}

export const useLoginStreak = () => {
  const [streak, setStreak] = useState<LoginStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  const checkAndUpdateStreak = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get current streak
    const { data: streakData } = await supabase
      .from('login_streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const today = new Date().toISOString().split('T')[0];

    if (!streakData) {
      // First login - create streak
      const { data: newStreak } = await supabase
        .from('login_streaks')
        .insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_login_date: today,
        })
        .select()
        .single();

      if (newStreak) {
        setStreak({
          current_streak: newStreak.current_streak,
          longest_streak: newStreak.longest_streak,
          last_login_date: newStreak.last_login_date,
        });

        toast({
          title: '🔥 Streak commencée!',
          description: 'Connectez-vous chaque jour pour maintenir votre streak',
          duration: 4000,
        });
      }
    } else {
      const lastLoginDate = streakData.last_login_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastLoginDate === today) {
        // Already logged in today
        setStreak({
          current_streak: streakData.current_streak,
          longest_streak: streakData.longest_streak,
          last_login_date: streakData.last_login_date,
        });
      } else if (lastLoginDate === yesterdayStr) {
        // Consecutive day - increment streak
        const newStreak = streakData.current_streak + 1;
        const newLongest = Math.max(newStreak, streakData.longest_streak);

        const { data: updatedStreak } = await supabase
          .from('login_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_login_date: today,
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (updatedStreak) {
          setStreak({
            current_streak: updatedStreak.current_streak,
            longest_streak: updatedStreak.longest_streak,
            last_login_date: updatedStreak.last_login_date,
          });

          // Celebrate milestone streaks
          if (newStreak % 7 === 0) {
            toast({
              title: '🔥 Streak Incroyable!',
              description: `${newStreak} jours consécutifs! Vous êtes en feu!`,
              duration: 5000,
            });
          } else {
            toast({
              title: `🔥 ${newStreak} jours de suite!`,
              description: 'Continuez comme ça!',
              duration: 3000,
            });
          }
        }
      } else {
        // Streak broken
        const { data: resetStreak } = await supabase
          .from('login_streaks')
          .update({
            current_streak: 1,
            last_login_date: today,
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (resetStreak) {
          setStreak({
            current_streak: resetStreak.current_streak,
            longest_streak: resetStreak.longest_streak,
            last_login_date: resetStreak.last_login_date,
          });
        }
      }
    }

    setLoading(false);
  };

  return {
    streak,
    loading,
    refreshStreak: checkAndUpdateStreak,
  };
};
