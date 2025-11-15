import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  MessageCircle,
  Edit,
  CheckCircle,
  LogIn,
  Camera,
  Heart,
  Brain,
  BookOpen,
  Settings,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useDailyQuests } from '@/hooks/useDailyQuests';

const ICON_MAP = {
  eye: Eye,
  'message-circle': MessageCircle,
  edit: Edit,
  'check-circle': CheckCircle,
  'log-in': LogIn,
  camera: Camera,
  heart: Heart,
  brain: Brain,
  'book-open': BookOpen,
  settings: Settings,
};

interface DailyQuestsProps {
  compact?: boolean;
}

const DailyQuests: React.FC<DailyQuestsProps> = ({ compact = false }) => {
  const { quests, loading, getQuestProgress, getCompletedCount, getTotalXPEarned } =
    useDailyQuests();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-32"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = getCompletedCount();
  const totalXP = getTotalXPEarned();
  const allCompleted = completedCount === quests.length && quests.length > 0;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-primary/20 bg-primary/5">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">
          {completedCount}/{quests.length} Quêtes
        </span>
      </div>
    );
  }

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quêtes Journalières
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{getTimeUntilReset()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Progression du jour</p>
            <p className="text-2xl font-bold text-primary">
              {completedCount}/{quests.length}
            </p>
          </div>
          {totalXP > 0 && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">XP Gagnés</p>
              <p className="text-xl font-bold text-primary">+{totalXP}</p>
            </div>
          )}
        </div>

        {/* All Completed Message */}
        {allCompleted && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <p className="font-semibold">
                🎉 Toutes les quêtes complétées! Revenez demain pour de nouvelles quêtes.
              </p>
            </div>
          </div>
        )}

        {/* Quest List */}
        <div className="space-y-3">
          {quests.map((quest) => {
            const progress = getQuestProgress(quest.id);
            const Icon = ICON_MAP[quest.icon as keyof typeof ICON_MAP] || Sparkles;
            const progressPercent = ((progress?.current_progress || 0) / quest.target_value) * 100;
            const isCompleted = progress?.completed || false;

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCompleted
                    ? 'bg-green-50/50 dark:bg-green-950/20 border-green-300 dark:border-green-800'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isCompleted ? 'text-green-600 dark:text-green-400' : 'text-primary'
                      }`}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {quest.title}
                          {isCompleted && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            >
                              ✓ Complétée
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">{quest.description}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        +{quest.xp_reward} XP
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {progress?.current_progress || 0} / {quest.target_value}
                        </span>
                        <span className="font-medium">{Math.round(progressPercent)}%</span>
                      </div>
                      <Progress
                        value={progressPercent}
                        className={`h-2 ${isCompleted ? '[&>div]:bg-green-500' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="pt-3 border-t">
          <p className="text-xs text-center text-muted-foreground">
            Les quêtes se renouvellent chaque jour à minuit. Complétez-les toutes pour maximiser vos
            gains XP!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuests;
