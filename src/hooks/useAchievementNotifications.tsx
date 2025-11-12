import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Trophy, Star, Award, Crown, Zap } from 'lucide-react';

interface AchievementUnlock {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement_title: string;
  points_awarded: number;
  rarity: string;
  unlocked_at: string;
}

interface AchievementNotificationProps {
  achievement: AchievementUnlock;
}

// Composant personnalisé pour la notification
const AchievementNotification = ({ achievement }: AchievementNotificationProps) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-amber-400 via-yellow-300 to-amber-500';
      case 'epic':
        return 'from-purple-400 via-pink-300 to-purple-500';
      case 'rare':
        return 'from-blue-400 via-cyan-300 to-blue-500';
      default:
        return 'from-emerald-400 via-green-300 to-emerald-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return Crown;
      case 'epic':
        return Star;
      case 'rare':
        return Award;
      default:
        return Trophy;
    }
  };

  const Icon = getRarityIcon(achievement.rarity);

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-r ${getRarityColor(achievement.rarity)} shadow-2xl border-2 border-white/20`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0 animate-bounce">
          <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30">
            <Icon className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-white uppercase tracking-wider drop-shadow-md">
              Achievement Débloqué!
            </p>
            <Zap className="h-4 w-4 text-yellow-200 animate-pulse" />
          </div>

          <h4 className="text-lg font-bold text-white drop-shadow-lg truncate">
            {achievement.achievement_title}
          </h4>

          <div className="flex items-center gap-2 mt-2">
            <div className="px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-sm border border-white/40">
              <span className="text-xs font-bold text-white">
                +{achievement.points_awarded} pts
              </span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-sm border border-white/40">
              <span className="text-xs font-bold text-white capitalize">{achievement.rarity}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sons pour les achievements
const playAchievementSound = (rarity: string) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Différentes fréquences selon la rareté
  const frequencies = {
    common: [523.25, 659.25, 783.99], // C5, E5, G5
    rare: [659.25, 783.99, 987.77], // E5, G5, B5
    epic: [783.99, 987.77, 1174.66], // G5, B5, D6
    legendary: [1046.5, 1318.51, 1567.98], // C6, E6, G6
  };

  const notes = frequencies[rarity as keyof typeof frequencies] || frequencies.common;

  // Jouer une mélodie rapide
  notes.forEach((freq, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = freq;
    osc.type = 'sine';

    const startTime = audioContext.currentTime + index * 0.1;
    const duration = 0.15;

    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  });
};

// Animation de confettis
const triggerConfetti = (rarity: string) => {
  const particleCount =
    {
      common: 30,
      rare: 60,
      epic: 100,
      legendary: 150,
    }[rarity] || 30;

  const colors = {
    common: ['#10b981', '#34d399', '#6ee7b7'],
    rare: ['#3b82f6', '#60a5fa', '#93c5fd'],
    epic: ['#a855f7', '#c084fc', '#e9d5ff'],
    legendary: ['#f59e0b', '#fbbf24', '#fcd34d'],
  }[rarity] || ['#10b981', '#34d399', '#6ee7b7'];

  // Configuration pour legendary
  if (rarity === 'legendary') {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, colors };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  } else {
    // Configuration pour les autres raretés
    const spread = rarity === 'epic' ? 120 : rarity === 'rare' ? 90 : 70;

    confetti({
      particleCount,
      spread,
      origin: { y: 0.6 },
      colors,
      gravity: rarity === 'epic' ? 0.5 : 1,
      scalar: rarity === 'epic' ? 1.2 : 1,
      drift: rarity === 'epic' ? 1 : 0,
    });

    // Deuxième explosion pour epic
    if (rarity === 'epic') {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
      }, 200);
    }
  }
};

export function useAchievementNotifications() {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user || !isEnabled) return;

    // S'abonner aux nouveaux achievements en temps réel
    const channel = supabase
      .channel('achievement-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievement_unlocks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const achievement = payload.new as AchievementUnlock;

          console.log('🏆 New achievement unlocked:', achievement);

          // Jouer le son
          try {
            playAchievementSound(achievement.rarity);
          } catch (error) {
            console.error('Error playing sound:', error);
          }

          // Déclencher les confettis pour rare, epic et legendary
          if (['rare', 'epic', 'legendary'].includes(achievement.rarity)) {
            try {
              triggerConfetti(achievement.rarity);
            } catch (error) {
              console.error('Error triggering confetti:', error);
            }
          }

          // Afficher la notification toast personnalisée
          toast.custom((t) => <AchievementNotification achievement={achievement} />, {
            duration:
              achievement.rarity === 'legendary'
                ? 6000
                : achievement.rarity === 'epic'
                  ? 5000
                  : achievement.rarity === 'rare'
                    ? 4000
                    : 3000,
            position: 'top-center',
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, isEnabled]);

  return {
    isEnabled,
    setIsEnabled,
    triggerTestNotification: (rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common') => {
      const testAchievement: AchievementUnlock = {
        id: 'test-' + Date.now(),
        user_id: user?.id || '',
        achievement_id: 'test',
        achievement_title: `Test ${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Achievement`,
        points_awarded:
          rarity === 'legendary' ? 500 : rarity === 'epic' ? 200 : rarity === 'rare' ? 100 : 50,
        rarity,
        unlocked_at: new Date().toISOString(),
      };

      playAchievementSound(rarity);

      if (['rare', 'epic', 'legendary'].includes(rarity)) {
        triggerConfetti(rarity);
      }

      toast.custom((t) => <AchievementNotification achievement={testAchievement} />, {
        duration:
          rarity === 'legendary'
            ? 6000
            : rarity === 'epic'
              ? 5000
              : rarity === 'rare'
                ? 4000
                : 3000,
        position: 'top-center',
      });
    },
  };
}
