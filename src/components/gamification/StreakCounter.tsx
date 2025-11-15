import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp } from 'lucide-react';
import { useLoginStreak } from '@/hooks/useLoginStreak';
import { useAuth } from '@/hooks/useAuth';

interface StreakCounterProps {
  compact?: boolean;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ compact = false }) => {
  const { user } = useAuth();
  const { currentStreak, longestStreak, loading } = useLoginStreak(user?.id);

  if (loading || !currentStreak) {
    return null;
  }

  const getStreakColor = (streakDays: number) => {
    if (streakDays >= 30) return 'text-purple-600 bg-purple-50 border-purple-300';
    if (streakDays >= 14) return 'text-red-600 bg-red-50 border-red-300';
    if (streakDays >= 7) return 'text-orange-600 bg-orange-50 border-orange-300';
    return 'text-amber-600 bg-amber-50 border-amber-300';
  };

  const getStreakEmoji = (streakDays: number) => {
    if (streakDays >= 30) return '🔥🔥🔥';
    if (streakDays >= 14) return '🔥🔥';
    if (streakDays >= 7) return '🔥';
    return '✨';
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${getStreakColor(currentStreak)}`}
      >
        <Flame className="h-4 w-4" />
        <span className="font-semibold text-sm">
          {currentStreak} {getStreakEmoji(currentStreak)}
        </span>
      </div>
    );
  }

  return (
    <Card className={`border-2 ${getStreakColor(currentStreak)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5" />
            Streak de Connexion
          </span>
          <Badge variant="outline" className="text-base">
            {getStreakEmoji(currentStreak)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{currentStreak}</p>
            <p className="text-sm text-muted-foreground">Jours consécutifs</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Record</span>
            </div>
            <p className="text-2xl font-bold">{longestStreak}</p>
          </div>
        </div>

        {currentStreak >= 7 && (
          <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <p className="text-sm text-center font-medium text-orange-900">
              {currentStreak >= 30
                ? '🌟 Légende! 30+ jours!'
                : currentStreak >= 14
                  ? '🔥 Incroyable! 2 semaines!'
                  : '💪 Super! 1 semaine complète!'}
            </p>
          </div>
        )}

        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Connectez-vous chaque jour pour maintenir votre streak et gagner des bonus XP
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCounter;
