import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown, User as UserIcon, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  current_level: string;
  total_xp: number;
  current_streak: number | null;
  rank: number;
}

const LEVEL_COLORS = {
  bronze: 'text-amber-700 bg-amber-50 border-amber-300',
  argent: 'text-slate-600 bg-slate-50 border-slate-300',
  or: 'text-yellow-600 bg-yellow-50 border-yellow-300',
  platine: 'text-cyan-600 bg-cyan-50 border-cyan-300',
};

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const loadLeaderboard = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Get top 10 users - simplified query
    const { data: levelData } = await supabase
      .from('user_levels')
      .select('user_id, current_level, total_xp')
      .order('total_xp', { ascending: false })
      .limit(10);

    if (levelData) {
      // Fetch related data separately
      const userIds = levelData.map((l) => l.user_id);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const { data: streaksData } = await supabase
        .from('login_streaks')
        .select('user_id, current_streak')
        .in('user_id', userIds);

      const formattedData: LeaderboardEntry[] = levelData.map((entry, index) => {
        const profile = profilesData?.find((p) => p.user_id === entry.user_id);
        const streak = streaksData?.find((s) => s.user_id === entry.user_id);

        return {
          user_id: entry.user_id,
          full_name: profile?.full_name || 'Anonyme',
          avatar_url: profile?.avatar_url || null,
          current_level: entry.current_level,
          total_xp: entry.total_xp,
          current_streak: streak?.current_streak || null,
          rank: index + 1,
        };
      });

      setLeaderboard(formattedData);

      // Get current user's rank
      const { data: allLevels } = await supabase
        .from('user_levels')
        .select('user_id, total_xp, current_level')
        .order('total_xp', { ascending: false });

      if (allLevels) {
        const userIndex = allLevels.findIndex((u) => u.user_id === user.id);
        if (userIndex !== -1) {
          const userInTop10 = formattedData.find((u) => u.user_id === user.id);
          if (userInTop10) {
            setUserRank(userInTop10);
          } else {
            // User not in top 10, fetch their data
            const userLevelData = allLevels[userIndex];
            if (!userLevelData) {
              setLoading(false);
              return;
            }

            const { data: userProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('user_id', user.id)
              .single();

            const { data: userStreak } = await supabase
              .from('login_streaks')
              .select('current_streak')
              .eq('user_id', user.id)
              .maybeSingle();

            setUserRank({
              user_id: user.id,
              full_name: userProfile?.full_name || 'Vous',
              avatar_url: userProfile?.avatar_url || null,
              current_level: userLevelData.current_level,
              total_xp: userLevelData.total_xp,
              current_streak: userStreak?.current_streak || null,
              rank: userIndex + 1,
            });
          }
        }
      }
    }

    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-semibold">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Classement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Classement Global
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* User's rank if not in top 10 */}
        {userRank && userRank.rank > 10 && (
          <div className="p-3 bg-primary/5 rounded-lg border-2 border-primary/20 mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-12 justify-center">
                #{userRank.rank}
              </Badge>
              <Avatar className="h-10 w-10">
                <AvatarImage src={userRank.avatar_url || undefined} />
                <AvatarFallback>
                  <UserIcon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">Vous</p>
                <p className="text-xs text-muted-foreground">{userRank.total_xp} XP</p>
              </div>
              <Badge className={LEVEL_COLORS[userRank.current_level as keyof typeof LEVEL_COLORS]}>
                {userRank.current_level}
              </Badge>
            </div>
          </div>
        )}

        {/* Top 10 */}
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.user_id === user?.id;

            return (
              <div
                key={entry.user_id}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrentUser
                    ? 'bg-primary/5 border-primary/30'
                    : entry.rank <= 3
                      ? 'bg-accent/20 border-accent/30'
                      : 'bg-background border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 flex justify-center">{getRankIcon(entry.rank)}</div>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback>
                      <UserIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {isCurrentUser ? 'Vous' : entry.full_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{entry.total_xp.toLocaleString()} XP</span>
                      {entry.current_streak && entry.current_streak > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>{entry.current_streak}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-xs ${LEVEL_COLORS[entry.current_level as keyof typeof LEVEL_COLORS]}`}
                  >
                    {entry.current_level}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-center text-muted-foreground">
            Complétez des défis et restez actif pour grimper dans le classement
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
