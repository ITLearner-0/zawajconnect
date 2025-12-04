/**
 * Badge Progress Component - Phase 5
 * Displays user's progress towards Daily Question achievements
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Flame,
  Star,
  Heart,
  Lock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface BadgeProgress {
  badge_id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  current_progress: number;
  required_progress: number;
  percentage: number;
  is_unlocked: boolean;
}

interface BadgeProgressProps {
  userId: string;
  compact?: boolean;
}

export const BadgeProgressComponent = ({ userId, compact = false }: BadgeProgressProps) => {
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadgeProgress();
  }, [userId]);

  const fetchBadgeProgress = async () => {
    try {
      const { data, error } = await supabase.rpc('get_daily_question_progress', {
        p_user_id: userId,
      });

      if (error) throw error;

      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badge progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (percentage: number) => {
    if (percentage >= 100) return 'text-yellow-500';
    if (percentage >= 75) return 'text-purple-500';
    if (percentage >= 50) return 'text-blue-500';
    return 'text-gray-500';
  };

  const unlockedBadges = badges.filter((b) => b.is_unlocked);
  const lockedBadges = badges.filter((b) => !b.is_unlocked);
  const nextBadge = lockedBadges.sort(
    (a, b) => b.percentage - a.percentage
  )[0];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            Prochain Badge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextBadge ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{nextBadge.badge_icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{nextBadge.badge_name}</p>
                  <p className="text-xs text-gray-600">{nextBadge.badge_description}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>
                    {nextBadge.current_progress} / {nextBadge.required_progress}
                  </span>
                  <span className="font-semibold">{Math.round(nextBadge.percentage)}%</span>
                </div>
                <Progress value={nextBadge.percentage} className="h-2" />
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm font-semibold">Tous les badges débloqués !</p>
              <p className="text-xs text-gray-600">Félicitations ! 🎉</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Badges & Achievements
          </CardTitle>
          <Badge variant="outline">
            {unlockedBadges.length} / {badges.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="unlocked">
              Débloqués ({unlockedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Verrouillés ({lockedBadges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {badges.map((badge, index) => (
              <BadgeItem key={badge.badge_id} badge={badge} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="unlocked" className="space-y-3">
            {unlockedBadges.length > 0 ? (
              unlockedBadges.map((badge, index) => (
                <BadgeItem key={badge.badge_id} badge={badge} index={index} />
              ))
            ) : (
              <div className="text-center py-8">
                <Lock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Aucun badge débloqué pour le moment</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="locked" className="space-y-3">
            {lockedBadges.length > 0 ? (
              lockedBadges.map((badge, index) => (
                <BadgeItem key={badge.badge_id} badge={badge} index={index} />
              ))
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm text-gray-600 font-semibold">
                  Tous les badges débloqués !
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const BadgeItem = ({ badge, index }: { badge: BadgeProgress; index: number }) => {
  const getRarityColor = (percentage: number) => {
    if (percentage >= 100) return 'from-yellow-400 to-orange-500';
    if (percentage >= 75) return 'from-purple-400 to-pink-500';
    if (percentage >= 50) return 'from-blue-400 to-cyan-500';
    return 'from-gray-300 to-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 rounded-lg border ${
        badge.is_unlocked
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`text-4xl ${
              badge.is_unlocked ? 'filter-none' : 'filter grayscale opacity-50'
            }`}
          >
            {badge.badge_icon}
          </div>
          {badge.is_unlocked && (
            <div className="absolute -top-1 -right-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 bg-white rounded-full" />
            </div>
          )}
          {!badge.is_unlocked && (
            <div className="absolute -top-1 -right-1">
              <Lock className="h-4 w-4 text-gray-400 bg-white rounded-full" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{badge.badge_name}</h4>
            {badge.is_unlocked && (
              <Badge className="bg-emerald-500 text-white text-xs">Débloqué</Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mb-2">{badge.badge_description}</p>

          {!badge.is_unlocked && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">
                  {badge.current_progress} / {badge.required_progress}
                </span>
                <span className="font-semibold">
                  {Math.round(badge.percentage)}%
                </span>
              </div>
              <Progress
                value={badge.percentage}
                className={`h-2 bg-gradient-to-r ${getRarityColor(badge.percentage)}`}
              />
            </div>
          )}

          {badge.is_unlocked && (
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              <span className="font-medium">Objectif atteint !</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BadgeProgressComponent;
