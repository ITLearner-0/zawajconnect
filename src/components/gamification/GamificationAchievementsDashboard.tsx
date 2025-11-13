import { useGamification } from '@/hooks/gamification/useGamification';
import BadgeDisplay from './BadgeDisplay';
import RewardsDisplay from './RewardsDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Gift, Crown, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StandardLoadingState from '@/components/ui/StandardLoadingState';

interface GamificationAchievementsDashboardProps {
  userId: string;
}

const GamificationAchievementsDashboard = ({ userId }: GamificationAchievementsDashboardProps) => {
  const { badges, rewards, isLoading, refreshAll, getGamificationSummary } = useGamification(userId);

  if (isLoading) {
    return <StandardLoadingState loading={true} loadingText="Loading gamification..." />;
  }

  const summary = getGamificationSummary();

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Badges</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Award className="h-6 w-6 text-muted-foreground" />
              {summary.totalBadges}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unclaimed Rewards</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Gift className="h-6 w-6 text-muted-foreground" />
              {summary.unclaimedRewards}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Legendary Badges</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Crown className="h-6 w-6 text-amber-500" />
              {summary.legendaryBadges}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Epic Badges</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Trophy className="h-6 w-6 text-purple-500" />
              {summary.epicBadges}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Latest Badge */}
      {summary.latestBadge && (
        <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Latest Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-lg bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{summary.latestBadge.badge_name}</h3>
                {summary.latestBadge.badge_description && (
                  <p className="text-sm text-muted-foreground">
                    {summary.latestBadge.badge_description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rewards Section */}
      <RewardsDisplay userId={userId} />

      {/* Badges Section */}
      <BadgeDisplay userId={userId} />

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={refreshAll} variant="outline">
          Refresh Gamification Data
        </Button>
      </div>
    </div>
  );
};

export default GamificationAchievementsDashboard;
