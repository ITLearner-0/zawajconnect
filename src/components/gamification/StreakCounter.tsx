import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp } from 'lucide-react';
import { useLoginStreak } from '@/hooks/useLoginStreak';

interface StreakCounterProps {
  compact?: boolean;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ compact = false }) => {
  const { streak, loading } = useLoginStreak();

  if (loading || !streak) {
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
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${getStreakColor(streak.current_streak)}`}>
        <Flame className="h-4 w-4" />
        <span className="font-semibold text-sm">
          {streak.current_streak} {getStreakEmoji(streak.current_streak)}
        </span>
      </div>
    );
  }

  return (
    <Card className={`border-2 ${getStreakColor(streak.current_streak)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5" />
            Streak de Connexion
          </span>
          <Badge variant="outline" className="text-base">
            {getStreakEmoji(streak.current_streak)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{streak.current_streak}</p>
            <p className="text-sm text-muted-foreground">Jours consécutifs</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Record</span>
            </div>
            <p className="text-2xl font-bold">{streak.longest_streak}</p>
          </div>
        </div>

        {streak.current_streak >= 7 && (
          <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <p className="text-sm text-center font-medium text-orange-900">
              {streak.current_streak >= 30 ? '🌟 Légende! 30+ jours!' :
               streak.current_streak >= 14 ? '🔥 Incroyable! 2 semaines!' :
               '💪 Super! 1 semaine complète!'}
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
