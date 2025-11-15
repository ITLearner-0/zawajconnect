import { useEffect, useState } from 'react';
import { Award, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgeRarity } from '@/types/gamification';

interface BadgeNotificationProps {
  badge: {
    badge_name: string;
    badge_description: string | null;
    badge_icon: string | null;
    rarity: BadgeRarity;
  };
  onClose: () => void;
  show: boolean;
}

const rarityColors: Record<BadgeRarity, { bg: string; border: string; glow: string }> = {
  common: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-slate-300 dark:border-slate-600',
    glow: 'shadow-slate-400/50',
  },
  rare: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-400 dark:border-blue-600',
    glow: 'shadow-blue-400/50',
  },
  epic: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-400 dark:border-purple-600',
    glow: 'shadow-purple-400/50',
  },
  legendary: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-400 dark:border-amber-600',
    glow: 'shadow-amber-400/50',
  },
};

const rarityEmojis: Record<BadgeRarity, string> = {
  common: '🥉',
  rare: '🥈',
  epic: '💎',
  legendary: '👑',
};

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge, onClose, show }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      // Trigger confetti based on rarity
      const confettiCount =
        badge.rarity === 'legendary'
          ? 150
          : badge.rarity === 'epic'
            ? 100
            : badge.rarity === 'rare'
              ? 60
              : 30;

      const colors =
        badge.rarity === 'legendary'
          ? ['#fbbf24', '#f59e0b', '#d97706']
          : badge.rarity === 'epic'
            ? ['#a855f7', '#9333ea', '#7e22ce']
            : badge.rarity === 'rare'
              ? ['#3b82f6', '#2563eb', '#1d4ed8']
              : ['#94a3b8', '#64748b', '#475569'];

      // Fire confetti
      confetti({
        particleCount: confettiCount,
        spread: 70,
        origin: { y: 0.6 },
        colors,
        zIndex: 9999,
      });

      // Additional burst for legendary
      if (badge.rarity === 'legendary') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
            zIndex: 9999,
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
            zIndex: 9999,
          });
        }, 250);
      }

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [show, badge.rarity]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const colors = rarityColors[badge.rarity];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            duration: 0.4,
          }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4"
        >
          <Card
            className={`
              ${colors.bg} ${colors.border} ${colors.glow}
              border-2 shadow-2xl overflow-hidden
              animate-pulse-slow
            `}
          >
            <div className="relative p-6">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Content */}
              <div className="flex items-start gap-4">
                {/* Badge Icon */}
                <motion.div
                  initial={{ rotate: 0, scale: 1 }}
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1.1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: 2,
                    repeatDelay: 0.3,
                  }}
                  className="flex-shrink-0"
                >
                  <div
                    className={`
                    w-16 h-16 rounded-full 
                    ${colors.bg} ${colors.border}
                    border-2 flex items-center justify-center
                    text-3xl
                  `}
                  >
                    {badge.badge_icon || rarityEmojis[badge.rarity]}
                  </div>
                </motion.div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Badge Earned!
                    </h3>
                  </div>

                  <h2 className="text-xl font-bold text-foreground mb-1 line-clamp-1">
                    {badge.badge_name}
                  </h2>

                  {badge.badge_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {badge.badge_description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary capitalize">
                      {badge.rarity} Badge
                    </span>
                  </div>
                </div>
              </div>

              {/* Animated background effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none"
              />
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
