import { useUserBadges } from '@/hooks/gamification/useUserBadges';
import BadgeCard from './BadgeCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Crown, Loader2, Star, Trophy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StandardLoadingState from '@/components/ui/StandardLoadingState';

interface BadgeDisplayProps {
  userId: string;
  compact?: boolean;
}

const BadgeDisplay = ({ userId, compact = false }: BadgeDisplayProps) => {
  const { badges, loading, error, getBadgesByCategory, getTotalBadges } = useUserBadges(userId);

  if (loading) {
    return <StandardLoadingState loading={true} loadingText="Loading achievements..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (badges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="mb-2">No Badges Yet</CardTitle>
          <CardDescription>Complete achievements to earn your first badge!</CardDescription>
        </CardContent>
      </Card>
    );
  }

  const categorizedBadges = getBadgesByCategory();

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Achievements</h3>
          <span className="text-sm text-muted-foreground">{getTotalBadges()} badges</span>
        </div>
        <div className="space-y-2">
          {badges.slice(0, 5).map((badge) => (
            <BadgeCard key={badge.id} badge={badge} compact={true} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Achievements
            </CardTitle>
            <CardDescription>{getTotalBadges()} badges earned</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({getTotalBadges()})</TabsTrigger>
            <TabsTrigger value="legendary" className="gap-1">
              <Crown className="h-3 w-3" />
              {categorizedBadges.legendary.length}
            </TabsTrigger>
            <TabsTrigger value="epic" className="gap-1">
              <Trophy className="h-3 w-3" />
              {categorizedBadges.epic.length}
            </TabsTrigger>
            <TabsTrigger value="rare" className="gap-1">
              <Star className="h-3 w-3" />
              {categorizedBadges.rare.length}
            </TabsTrigger>
            <TabsTrigger value="common" className="gap-1">
              <Award className="h-3 w-3" />
              {categorizedBadges.common.length}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </TabsContent>

          {(['legendary', 'epic', 'rare', 'common'] as const).map((rarity) => (
            <TabsContent key={rarity} value={rarity} className="mt-6">
              {categorizedBadges[rarity].length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No {rarity} badges yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedBadges[rarity].map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BadgeDisplay;
