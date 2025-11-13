import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { useLoginStreak } from '@/hooks/useLoginStreak';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export const StreakDisplay = () => {
  const { user } = useAuth();
  const { currentStreak, longestStreak, loading } = useLoginStreak(user?.id);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 100) return 'from-purple-500 to-pink-500';
    if (streak >= 30) return 'from-orange-500 to-red-500';
    if (streak >= 7) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-cyan-500';
  };

  const getNextMilestone = (streak: number) => {
    if (streak < 7) return 7;
    if (streak < 30) return 30;
    if (streak < 100) return 100;
    if (streak < 365) return 365;
    return null;
  };

  const nextMilestone = getNextMilestone(currentStreak);
  const progress = nextMilestone ? (currentStreak / nextMilestone) * 100 : 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${getStreakColor(currentStreak)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-white" />
            <CardTitle className="text-white">Login Streak</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Active
          </Badge>
        </div>
        <CardDescription className="text-white/90">
          Keep logging in daily to maintain your streak
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </div>

          <div className="text-center p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <p className="text-sm font-medium text-muted-foreground">Longest Streak</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{longestStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </div>
        </div>

        {nextMilestone && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                  Next Milestone: {nextMilestone} days
                </p>
              </div>
              <p className="text-sm font-semibold text-primary">
                {nextMilestone - currentStreak} days to go
              </p>
            </div>
            <div className="w-full bg-accent rounded-full h-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getStreakColor(currentStreak)} transition-all duration-500`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground text-center">
            Earn badges at 7, 30, 100, and 365 day streaks! 🏆
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
