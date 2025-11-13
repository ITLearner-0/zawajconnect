import { useEffect, useState } from 'react';
import { Award, Trophy, Crown, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserBadge, BadgeRarity } from '@/types/gamification';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BadgeShowcaseProps {
  userId: string;
  maxBadges?: number;
  compact?: boolean;
}

const rarityOrder: Record<BadgeRarity, number> = {
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 1,
};

const rarityColors: Record<BadgeRarity, { bg: string; text: string; border: string }> = {
  common: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-600',
  },
  rare: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-400 dark:border-blue-600',
  },
  epic: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-400 dark:border-purple-600',
  },
  legendary: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-400 dark:border-amber-600',
  },
};

const rarityIcons: Record<BadgeRarity, React.ReactNode> = {
  common: <Award className="h-4 w-4" />,
  rare: <Star className="h-4 w-4" />,
  epic: <Trophy className="h-4 w-4" />,
  legendary: <Crown className="h-4 w-4" />,
};

const rarityEmojis: Record<BadgeRarity, string> = {
  common: '🥉',
  rare: '🥈',
  epic: '💎',
  legendary: '👑',
};

export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({
  userId,
  maxBadges = 5,
  compact = false,
}) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBadges, setTotalBadges] = useState(0);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);

        // Fetch all user badges using type casting since table may not be in types yet
        const { data, error, count } = await supabase
          .from('user_badges' as any)
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .order('earned_at', { ascending: false });

        if (error) {
          // If table doesn't exist yet, just show empty state
          if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
            console.log('user_badges table not found - showing empty state');
            setBadges([]);
            setTotalBadges(0);
            setLoading(false);
            return;
          }
          throw error;
        }

        setTotalBadges(count || 0);

        if (data && data.length > 0) {
          // Cast data to UserBadge array
          const badgeData = data as unknown as UserBadge[];
          
          // Sort badges by rarity (highest first) and then by earned date
          const sortedBadges = badgeData.sort((a, b) => {
            const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
            if (rarityDiff !== 0) return rarityDiff;
            
            // If same rarity, sort by date (most recent first)
            return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime();
          });

          // Take top N badges
          setBadges(sortedBadges.slice(0, maxBadges));
        } else {
          setBadges([]);
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
        setBadges([]);
        setTotalBadges(0);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchBadges();
    }
  }, [userId, maxBadges]);

  if (loading) {
    return (
      <Card className={compact ? '' : 'shadow-md'}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 w-16 rounded-lg bg-muted"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (badges.length === 0) {
    return (
      <Card className={compact ? '' : 'shadow-md'}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucun badge gagné pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? '' : 'shadow-md'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Badges {totalBadges > 0 && `(${totalBadges})`}
          </CardTitle>
          {badges.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Top {Math.min(maxBadges, totalBadges)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => {
              const colors = rarityColors[badge.rarity];
              
              return (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        relative group cursor-pointer
                        w-16 h-16 rounded-lg
                        ${colors.bg} ${colors.border}
                        border-2 flex items-center justify-center
                        transition-all duration-200
                        hover:scale-110 hover:shadow-lg
                        ${badge.rarity === 'legendary' ? 'animate-pulse-slow' : ''}
                      `}
                    >
                      {/* Badge Icon/Emoji */}
                      <div className="text-2xl">
                        {badge.badge_icon || rarityEmojis[badge.rarity]}
                      </div>
                      
                      {/* Rarity indicator */}
                      <div
                        className={`
                          absolute -top-1 -right-1
                          w-5 h-5 rounded-full
                          ${colors.bg} ${colors.border}
                          border flex items-center justify-center
                          ${colors.text}
                        `}
                      >
                        {rarityIcons[badge.rarity]}
                      </div>

                      {/* Shine effect for legendary */}
                      {badge.rarity === 'legendary' && (
                        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className={`max-w-xs ${colors.bg} ${colors.border} border`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-foreground">
                          {badge.badge_name}
                        </h4>
                        <span
                          className={`
                            text-xs font-medium px-2 py-0.5 rounded-full
                            ${colors.bg} ${colors.text}
                            capitalize whitespace-nowrap
                          `}
                        >
                          {badge.rarity}
                        </span>
                      </div>
                      
                      {badge.badge_description && (
                        <p className="text-sm text-muted-foreground">
                          {badge.badge_description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
                        <span>
                          Gagné le{' '}
                          {new Date(badge.earned_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {badge.progress_value > 0 && (
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {badge.progress_value}
                          </span>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
