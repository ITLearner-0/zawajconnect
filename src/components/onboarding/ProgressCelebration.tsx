import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProgressCelebrationProps {
  message: string;
  isVisible: boolean;
  onComplete?: () => void;
}

const ProgressCelebration: React.FC<ProgressCelebrationProps> = ({
  message,
  isVisible,
  onComplete
}) => {
  useEffect(() => {
    if (isVisible) {
      // Trigger confetti
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          if (onComplete) {
            setTimeout(onComplete, 500);
          }
          return;
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

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="p-8 shadow-2xl border-2 border-primary animate-scale-in max-w-md mx-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-2">
            <Trophy className="h-12 w-12 text-gold animate-pulse" />
            <Star className="h-8 w-8 text-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
            <Sparkles className="h-10 w-10 text-emerald animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-gold to-emerald bg-clip-text text-transparent">
              Félicitations !
            </h2>
            <p className="text-lg font-medium text-foreground">
              {message}
            </p>
          </div>

          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald/10 to-primary/10 rounded-full border border-primary/20">
              <Star className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium">Continuez votre excellent travail!</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgressCelebration;
