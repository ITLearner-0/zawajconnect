import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface UserLevel {
  current_level: 'bronze' | 'argent' | 'or' | 'platine';
  total_xp: number;
  level_progress: number;
}

const LEVEL_CONFIG = {
  bronze: { xp: 0, next: 2000, color: 'from-amber-700 to-amber-900', label: 'Bronze' },
  argent: { xp: 2000, next: 3000, color: 'from-slate-400 to-slate-600', label: 'Argent' },
  or: { xp: 5000, next: 5000, color: 'from-yellow-400 to-yellow-600', label: 'Or' },
  platine: { xp: 10000, next: 0, color: 'from-cyan-400 to-blue-600', label: 'Platine' }
};

export const useUserLevel = () => {
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserLevel();
  }, []);

  const loadUserLevel = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading user level:', error);
    } else if (data) {
      setLevel({
        current_level: data.current_level as any,
        total_xp: data.total_xp,
        level_progress: data.level_progress
      });
    } else {
      // Create initial level
      await initializeUserLevel(user.id);
    }

    setLoading(false);
  };

  const initializeUserLevel = async (userId: string) => {
    const { data } = await supabase
      .from('user_levels')
      .insert({
        user_id: userId,
        current_level: 'bronze',
        total_xp: 0,
        level_progress: 0
      })
      .select()
      .single();

    if (data) {
      setLevel({
        current_level: data.current_level as any,
        total_xp: data.total_xp,
        level_progress: data.level_progress
      });
    }
  };

  const addXP = useCallback(async (amount: number, reason: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !level) return;

    const oldLevel = level.current_level;
    const newTotalXP = level.total_xp + amount;

    const { data, error } = await supabase
      .from('user_levels')
      .update({ total_xp: newTotalXP })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error adding XP:', error);
      return;
    }

    if (data) {
      const newLevel = data.current_level as UserLevel['current_level'];
      const validNewLevel = newLevel as keyof typeof LEVEL_CONFIG;
      setLevel({
        current_level: newLevel,
        total_xp: data.total_xp,
        level_progress: data.level_progress
      });

      // Check for level up
      if (newLevel !== oldLevel) {
        triggerLevelUpCelebration(newLevel);
        toast({
          title: '🎉 Nouveau Niveau !',
          description: (
            <div className="space-y-1">
              <p className="font-bold text-lg">{LEVEL_CONFIG[validNewLevel].label}</p>
              <p className="text-sm">Vous avez atteint le niveau {LEVEL_CONFIG[validNewLevel].label}!</p>
            </div>
          ),
          duration: 5000,
        });
      } else {
        toast({
          title: `+${amount} XP`,
          description: reason,
          duration: 3000,
        });
      }
    }
  }, [level, toast]);

  const triggerLevelUpCelebration = (newLevel: string) => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#00CED1'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const getLevelConfig = (levelName: string) => {
    const validLevel = levelName as keyof typeof LEVEL_CONFIG;
    return LEVEL_CONFIG[validLevel] || LEVEL_CONFIG.bronze;
  };

  const getXPForNextLevel = () => {
    if (!level) return 0;
    const validLevel = level.current_level as keyof typeof LEVEL_CONFIG;
    const config = LEVEL_CONFIG[validLevel] || LEVEL_CONFIG.bronze;
    return config.xp + config.next;
  };

  return {
    level,
    loading,
    addXP,
    getLevelConfig,
    getXPForNextLevel,
    refreshLevel: loadUserLevel
  };
};
