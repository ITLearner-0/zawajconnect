import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Zap, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_badges: number;
  legendary_count: number;
  epic_count: number;
  rare_count: number;
  total_xp: number;
  rank: number;
}

export default function BadgeLeaderboard() {
  const [loading, setLoading] = useState(true);
  const [totalBadgesLeaderboard, setTotalBadgesLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [legendaryLeaderboard, setLegendaryLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [xpLeaderboard, setXpLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    try {
      setLoading(true);

      // Get total badges leaderboard
      const { data: totalBadgesData } = await (supabase as any).from('user_badges').select(`
          user_id,
          profiles:user_id (
            username,
            avatar_url
          )
        `);

      // Get legendary badges leaderboard
      const { data: legendaryData } = await (supabase as any).from('user_badges').select(`
          user_id,
          rarity,
          profiles:user_id (
            username,
            avatar_url
          )
        `);

      // Get XP leaderboard
      const { data: xpData } = await supabase
        .from('user_levels')
        .select(
          `
          user_id,
          total_xp,
          profiles:user_id (
            username,
            avatar_url
          )
        `
        )
        .order('total_xp', { ascending: false })
        .limit(50);

      // Process total badges
      const totalBadgesMap = new Map<string, any>();
      totalBadgesData?.forEach((badge: any) => {
        const userId = badge.user_id;
        if (!totalBadgesMap.has(userId)) {
          totalBadgesMap.set(userId, {
            user_id: userId,
            username: badge.profiles?.username || 'Anonymous',
            avatar_url: badge.profiles?.avatar_url,
            total_badges: 0,
            legendary_count: 0,
            epic_count: 0,
            rare_count: 0,
            total_xp: 0,
          });
        }
        const entry = totalBadgesMap.get(userId);
        entry.total_badges += 1;
      });

      // Process legendary badges
      const legendaryMap = new Map<string, any>();
      legendaryData?.forEach((badge: any) => {
        const userId = badge.user_id;
        if (!legendaryMap.has(userId)) {
          legendaryMap.set(userId, {
            user_id: userId,
            username: badge.profiles?.username || 'Anonymous',
            avatar_url: badge.profiles?.avatar_url,
            total_badges: 0,
            legendary_count: 0,
            epic_count: 0,
            rare_count: 0,
            total_xp: 0,
          });
        }
        const entry = legendaryMap.get(userId);
        if (badge.rarity === 'legendary') entry.legendary_count += 1;
        if (badge.rarity === 'epic') entry.epic_count += 1;
        if (badge.rarity === 'rare') entry.rare_count += 1;
      });

      // Sort and rank
      const sortedTotal = Array.from(totalBadgesMap.values())
        .sort((a, b) => b.total_badges - a.total_badges)
        .slice(0, 50)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      const sortedLegendary = Array.from(legendaryMap.values())
        .sort((a, b) => b.legendary_count - a.legendary_count)
        .slice(0, 50)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      const sortedXp = (xpData || []).map((entry: any, index: number) => ({
        user_id: entry.user_id,
        username: entry.profiles?.username || 'Anonymous',
        avatar_url: entry.profiles?.avatar_url,
        total_badges: 0,
        legendary_count: 0,
        epic_count: 0,
        rare_count: 0,
        total_xp: entry.total_xp || 0,
        rank: index + 1,
      }));

      setTotalBadgesLeaderboard(sortedTotal);
      setLegendaryLeaderboard(sortedLegendary);
      setXpLeaderboard(sortedXp);
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />;
    if (rank === 2) return <Trophy className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />;
    if (rank === 3) return <Trophy className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />;
    return <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>#{rank}</span>;
  };

  const renderLeaderboardEntry = (
    entry: LeaderboardEntry,
    showBadges: boolean,
    showXp: boolean
  ) => (
    <div
      key={entry.user_id}
      className="flex items-center gap-4 p-4 transition-colors"
      style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-card)' }}
    >
      <div className="flex items-center justify-center w-12">{getRankIcon(entry.rank)}</div>

      <Avatar className="w-12 h-12">
        <AvatarImage src={entry.avatar_url || undefined} alt={entry.username} />
        <AvatarFallback style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
          {entry.username.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{entry.username}</p>
        {showBadges && (
          <div className="flex gap-2 mt-1">
            {entry.legendary_count > 0 && (
              <Badge
                variant="outline"
                className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50"
              >
                <Crown className="w-3 h-3 mr-1" />
                {entry.legendary_count} Legendary
              </Badge>
            )}
            {entry.epic_count > 0 && (
              <Badge
                variant="outline"
                className="text-xs bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30"
              >
                {entry.epic_count} Epic
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="text-right">
        {showBadges && <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{entry.total_badges}</p>}
        {showXp && (
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{entry.total_xp.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
          <Award className="w-10 h-10" style={{ color: 'var(--color-primary)' }} />
          Badge Leaderboard
        </h1>
        <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Compete with others and climb the ranks by earning badges and XP
        </p>
      </div>

      <Tabs defaultValue="total" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="total" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Most Badges
          </TabsTrigger>
          <TabsTrigger value="legendary" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Most Legendary
          </TabsTrigger>
          <TabsTrigger value="xp" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Highest XP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="total">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-text-primary)' }}>Total Badges Leaderboard</CardTitle>
              <CardDescription style={{ color: 'var(--color-text-secondary)' }}>Users ranked by their total number of badges earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {totalBadgesLeaderboard.length > 0 ? (
                  totalBadgesLeaderboard.map((entry) => renderLeaderboardEntry(entry, true, false))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legendary">
          <Card>
            <CardHeader>
              <CardTitle>Legendary Badges Leaderboard</CardTitle>
              <CardDescription>
                Users ranked by their legendary and epic badge collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {legendaryLeaderboard.length > 0 ? (
                  legendaryLeaderboard.map((entry) => renderLeaderboardEntry(entry, true, false))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="xp">
          <Card>
            <CardHeader>
              <CardTitle>Experience Points Leaderboard</CardTitle>
              <CardDescription>Users ranked by their total XP accumulated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {xpLeaderboard.length > 0 ? (
                  xpLeaderboard.map((entry) => renderLeaderboardEntry(entry, false, true))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data available yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
