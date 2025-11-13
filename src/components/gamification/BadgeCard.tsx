import { UserBadge } from '@/types/gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Award, Crown, Star, Trophy } from 'lucide-react';

interface BadgeCardProps {
  badge: UserBadge;
  compact?: boolean;
}

const BadgeCard = ({ badge, compact = false }: BadgeCardProps) => {
  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-muted text-muted-foreground',
      rare: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      epic: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      legendary: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityIcon = (rarity: string) => {
    const icons = {
      common: Award,
      rare: Star,
      epic: Trophy,
      legendary: Crown,
    };
    const Icon = icons[rarity as keyof typeof icons] || Award;
    return <Icon className="h-4 w-4" />;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg border border-border/40 bg-card/50 hover:bg-card transition-colors">
        <div className={`p-2 rounded-md ${getRarityColor(badge.rarity)}`}>
          {getRarityIcon(badge.rarity)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate text-foreground">{badge.badge_name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(badge.earned_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className={`p-3 rounded-lg ${getRarityColor(badge.rarity)}`}>
            {getRarityIcon(badge.rarity)}
          </div>
          <Badge variant="outline" className={getRarityColor(badge.rarity)}>
            {badge.rarity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg mb-1">{badge.badge_name}</CardTitle>
        {badge.badge_description && (
          <CardDescription className="mb-3">
            {badge.badge_description}
          </CardDescription>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Earned {formatDistanceToNow(new Date(badge.earned_at), { addSuffix: true })}</span>
          {badge.progress_value > 0 && (
            <span className="font-medium">Progress: {badge.progress_value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeCard;
