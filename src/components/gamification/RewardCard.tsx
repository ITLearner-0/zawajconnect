import { GamificationReward } from '@/types/gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Award, Check, Clock, Gift, Loader2, Sparkles, Star, Zap } from 'lucide-react';

interface RewardCardProps {
  reward: GamificationReward;
  onClaim?: (rewardId: string) => Promise<boolean>;
  claiming?: boolean;
}

const RewardCard = ({ reward, onClaim, claiming = false }: RewardCardProps) => {
  const getRewardIcon = (type: string) => {
    const icons = {
      xp: Zap,
      badge: Award,
      unlock: Star,
      boost: Sparkles,
      premium_trial: Gift,
    };
    const Icon = icons[type as keyof typeof icons] || Gift;
    return <Icon className="h-5 w-5" />;
  };

  const getRewardColor = (type: string) => {
    const colors = {
      xp: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      unlock: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      boost: 'bg-green-500/10 text-green-500 border-green-500/20',
      premium_trial: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    };
    return colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const isExpired = reward.expires_at && new Date(reward.expires_at) < new Date();

  return (
    <Card className={`${reward.claimed ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className={`p-3 rounded-lg ${getRewardColor(reward.reward_type)}`}>
            {getRewardIcon(reward.reward_type)}
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant="outline" className={getRewardColor(reward.reward_type)}>
              {reward.reward_type}
            </Badge>
            {reward.claimed && (
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-500 border-green-500/20"
              >
                <Check className="h-3 w-3 mr-1" />
                Claimed
              </Badge>
            )}
            {isExpired && !reward.claimed && (
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                <Clock className="h-3 w-3 mr-1" />
                Expired
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {reward.reward_amount && (
          <div className="mb-2">
            <span className="text-2xl font-bold text-foreground">+{reward.reward_amount}</span>
            <span className="ml-1 text-sm text-muted-foreground uppercase">
              {reward.reward_type}
            </span>
          </div>
        )}
        <CardTitle className="text-lg mb-2">{reward.reward_description}</CardTitle>
        <CardDescription className="mb-3">From: {reward.source_action}</CardDescription>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>
            Earned {formatDistanceToNow(new Date(reward.created_at), { addSuffix: true })}
          </span>
          {reward.expires_at && !isExpired && (
            <span className="text-amber-500">
              Expires {formatDistanceToNow(new Date(reward.expires_at), { addSuffix: true })}
            </span>
          )}
        </div>

        {!reward.claimed && !isExpired && onClaim && (
          <Button
            onClick={() => onClaim(reward.id)}
            disabled={claiming}
            className="w-full"
            size="sm"
          >
            {claiming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Claim Reward
              </>
            )}
          </Button>
        )}

        {reward.claimed && reward.claimed_at && (
          <p className="text-xs text-center text-muted-foreground">
            Claimed {formatDistanceToNow(new Date(reward.claimed_at), { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardCard;
