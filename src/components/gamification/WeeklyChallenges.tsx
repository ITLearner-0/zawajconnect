import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle, Trophy, Calendar } from 'lucide-react';
import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges';

const WeeklyChallenges: React.FC = () => {
  const { challenges, userProgress, loading } = useWeeklyChallenges();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Défis Hebdomadaires</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Défis Hebdomadaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucun défi actif pour le moment. Revenez bientôt!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getWeekDates = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return {
      start: startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      end: endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Défis Hebdomadaires
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Cette semaine
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => {
          const progress = userProgress.get(challenge.id);
          const progressPercentage = progress
            ? Math.min((progress.current_progress / challenge.target_value) * 100, 100)
            : 0;
          const isCompleted = progress?.completed || false;
          const dates = getWeekDates(challenge.week_start, challenge.week_end);

          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCompleted ? 'bg-emerald-50 border-emerald-300' : 'bg-background border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{challenge.title}</h4>
                    {isCompleted && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                  <Trophy className="h-3 w-3" />+{challenge.xp_reward} XP
                </Badge>
              </div>

              {!isCompleted && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">
                      {progress?.current_progress || 0}/{challenge.target_value}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}

              {isCompleted && progress?.completed_at && (
                <div className="mt-2 text-xs text-emerald-600 font-medium">
                  ✓ Complété le {new Date(progress.completed_at).toLocaleDateString('fr-FR')}
                </div>
              )}

              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                {dates.start} - {dates.end}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default WeeklyChallenges;
