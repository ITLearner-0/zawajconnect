import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

const ACHIEVEMENTS: Record<string, Achievement> = {
  profile_complete: {
    id: 'profile_complete',
    title: 'Profil Complet',
    description: 'Complétez 100% de votre profil',
    rarity: 'epic',
    points: 100
  },
  speed_master: {
    id: 'speed_master',
    title: 'Rapide comme l\'éclair',
    description: 'Complétez votre profil en moins de 5 minutes',
    rarity: 'rare',
    points: 50
  },
  detail_oriented: {
    id: 'detail_oriented',
    title: 'Détaillé',
    description: 'Écrivez une bio de plus de 200 caractères',
    rarity: 'common',
    points: 25
  }
};

export const useOnboardingAchievements = () => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadUnlockedAchievements();
  }, []);

  const loadUnlockedAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('achievement_unlocks')
      .select('achievement_id')
      .eq('user_id', user.id);

    if (data) {
      setUnlockedAchievements(new Set(data.map(a => a.achievement_id)));
    }
  };

  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }, []);

  const unlockAchievement = useCallback(async (achievementId: string) => {
    if (unlockedAchievements.has(achievementId)) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return;

    const { error } = await supabase
      .from('achievement_unlocks')
      .insert({
        user_id: user.id,
        achievement_id: achievement.id,
        achievement_title: achievement.title,
        rarity: achievement.rarity,
        points_awarded: achievement.points
      });

    if (!error) {
      setUnlockedAchievements(prev => new Set([...prev, achievementId]));
      
      triggerConfetti();

      toast({
        title: '🏆 Achievement Débloqué!',
        description: (
          <div className="space-y-1">
            <p className="font-semibold text-base">{achievement.title}</p>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            <p className="text-xs text-primary">+{achievement.points} points</p>
          </div>
        ),
        duration: 5000,
      });
    }
  }, [unlockedAchievements, toast, triggerConfetti]);

  const checkProfileComplete = useCallback(async (completionPercentage: number) => {
    if (completionPercentage >= 100) {
      await unlockAchievement('profile_complete');
    }
  }, [unlockAchievement]);

  const checkSpeedMaster = useCallback(async (startTime: number) => {
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    if (elapsedMinutes <= 5) {
      await unlockAchievement('speed_master');
    }
  }, [unlockAchievement]);

  const checkDetailOriented = useCallback(async (bioLength: number) => {
    if (bioLength > 200) {
      await unlockAchievement('detail_oriented');
    }
  }, [unlockAchievement]);

  return {
    unlockedAchievements,
    unlockAchievement,
    checkProfileComplete,
    checkSpeedMaster,
    checkDetailOriented,
    achievements: ACHIEVEMENTS
  };
};
