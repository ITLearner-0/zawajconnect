import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Target, 
  Award, 
  TrendingUp,
  Crown,
  Zap,
  Medal,
  Gift,
  Sparkles,
  Heart
} from 'lucide-react';
import { useCompatibilityInsights, type UseCompatibilityInsightsReturn } from '@/hooks/useCompatibilityInsights';
import { useInsightsAnalytics, type UseInsightsAnalyticsReturn } from '@/hooks/useInsightsAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AnimatedCounter from '@/components/AnimatedCounter';
import ProgressiveReveal from '@/components/ProgressiveReveal';
import type { Achievement, GamificationLevel } from '@/types/compatibility';

interface GamifiedInsightsProps {
  userId?: string;
}

const GamifiedInsights: React.FC<GamifiedInsightsProps> = ({ userId }) => {
  const { insights, loading }: UseCompatibilityInsightsReturn = useCompatibilityInsights(userId);
  const { trackView, trackAction, analytics }: UseInsightsAnalyticsReturn = useInsightsAnalytics();
  const { user } = useAuth();
  const [userLevel, setUserLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Track view when component mounts
  useEffect(() => {
    trackView();
  }, []);

  const levels: GamificationLevel[] = [
    {
      level: 1,
      title: 'Débutant',
      minPoints: 0,
      maxPoints: 100,
      benefits: ['Profil de base', 'Test de compatibilité'],
      icon: <Heart className="w-4 h-4" />
    },
    {
      level: 2,
      title: 'Explorer',
      minPoints: 100,
      maxPoints: 300,
      benefits: ['Insights détaillés', 'Recherche avancée'],
      icon: <Target className="w-4 h-4" />
    },
    {
      level: 3,
      title: 'Expert',
      minPoints: 300,
      maxPoints: 600,
      benefits: ['Analyses approfondies', 'Matches premium'],
      icon: <Star className="w-4 h-4" />
    },
    {
      level: 4,
      title: 'Maître',
      minPoints: 600,
      maxPoints: 1000,
      benefits: ['Consultations personnalisées', 'Priorité de matching'],
      icon: <Crown className="w-4 h-4" />
    }
  ];

  const allAchievements: Achievement[] = [
    {
      id: 'first_test',
      title: 'Premier Pas',
      description: 'Complétez votre premier test de compatibilité',
      icon: <Zap className="w-4 h-4" />,
      unlocked: false,
      rarity: 'common',
      reward: { type: 'points', value: '50' }
    },
    {
      id: 'insights_explorer',
      title: 'Explorateur d\'Insights',
      description: 'Consultez vos insights de compatibilité 5 fois',
      icon: <Target className="w-4 h-4" />,
      unlocked: false,
      progress: 0,
      maxProgress: 5,
      rarity: 'common',
      reward: { type: 'points', value: '75' }
    },
    {
      id: 'perfect_match',
      title: 'Match Parfait',
      description: 'Obtenez un score de compatibilité de 90%+',
      icon: <Medal className="w-4 h-4" />,
      unlocked: false,
      rarity: 'rare',
      reward: { type: 'badge', value: 'Match Parfait' }
    },
    {
      id: 'insight_master',
      title: 'Maître des Insights',
      description: 'Débloquez tous les domaines de compatibilité',
      icon: <Trophy className="w-4 h-4" />,
      unlocked: false,
      progress: 0,
      maxProgress: 8,
      rarity: 'epic',
      reward: { type: 'unlock', value: 'Mode Expert' }
    },
    {
      id: 'guidance_seeker',
      title: 'Chercheur de Guidance',
      description: 'Lisez 10 conseils islamiques',
      icon: <Sparkles className="w-4 h-4" />,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      rarity: 'rare',
      reward: { type: 'points', value: '100' }
    }
  ];

  useEffect(() => {
    // Initialize achievements and check progress
    const initializeGamification = async (): Promise<void> => {
      if (!user) return;
      
      const currentAchievements = [...allAchievements];
      let points = 0;
      
      // Charger la progression depuis Supabase
      const { data: progression } = await supabase
        .from('user_progression')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progression) {
        setTotalPoints(progression.total_points);
        setUserLevel(progression.current_level);
        points = progression.total_points;
      }
      
      // Charger les achievements depuis Supabase
      const { data: unlockedAchievements } = await supabase
        .from('achievement_unlocks')
        .select('achievement_id, points_awarded')
        .eq('user_id', user.id);

      const unlockedIds = new Set(unlockedAchievements?.map(ua => ua.achievement_id) || []);
      
      if (insights) {
        // Check achievements based on insights data
        currentAchievements.forEach(achievement => {
          const isUnlocked = unlockedIds.has(achievement.id);
          
          switch (achievement.id) {
            case 'first_test':
              achievement.unlocked = isUnlocked || true;
              if (achievement.unlocked && !isUnlocked) {
                unlockAchievement(achievement);
              }
              break;
            case 'perfect_match': {
              const maxScore = Math.max(...insights.compatibilityAreas.map(area => area.score));
              achievement.unlocked = maxScore >= 90;
              if (achievement.unlocked && !isUnlocked) {
                unlockAchievement(achievement);
              }
              break;
            }
            case 'insight_master':
              achievement.progress = insights.compatibilityAreas.length;
              achievement.unlocked = (achievement.progress || 0) >= (achievement.maxProgress || 0);
              if (achievement.unlocked && !isUnlocked) {
                unlockAchievement(achievement);
              }
              break;
            case 'insights_explorer':
              achievement.progress = analytics.viewCount;
              achievement.unlocked = (achievement.progress || 0) >= (achievement.maxProgress || 0);
              if (achievement.unlocked && !isUnlocked) {
                unlockAchievement(achievement);
              }
              break;
            default:
              achievement.unlocked = isUnlocked;
          }
        });
      }

      setAchievements(currentAchievements);
      
      // Determine level if not loaded from DB
      if (!progression) {
        const currentLevel = levels.find(level => 
          points >= level.minPoints && points < level.maxPoints
        );
        if (currentLevel) {
          setUserLevel(currentLevel.level);
        }
      }
    };

    initializeGamification();
  }, [insights, user, analytics.viewCount]);

  const unlockAchievement = async (achievement: Achievement): Promise<void> => {
    if (!user) return;
    
    try {
      const pointsToAward = achievement.reward.type === 'points' 
        ? parseInt(achievement.reward.value) 
        : 0;

      // Enregistrer l'achievement débloqué
      const { error: achievementError } = await supabase
        .from('achievement_unlocks')
        .insert({
          user_id: user.id,
          achievement_id: achievement.id,
          achievement_title: achievement.title,
          rarity: achievement.rarity,
          points_awarded: pointsToAward
        });

      if (achievementError && achievementError.code !== '23505') throw achievementError;

      // Mettre à jour la progression
      const newTotalPoints = totalPoints + pointsToAward;
      const { error: progressionError } = await supabase
        .from('user_progression')
        .upsert({
          user_id: user.id,
          total_points: newTotalPoints,
          achievements_count: achievements.filter(a => a.unlocked).length + 1,
          insights_viewed_count: analytics.viewCount
        });

      if (progressionError) throw progressionError;

      // Tracker l'action
      await trackAction('achievement_unlocked', {
        achievement_id: achievement.id,
        achievement_title: achievement.title,
        rarity: achievement.rarity,
        points_awarded: pointsToAward
      });

      setTotalPoints(newTotalPoints);

      // Afficher notification
      toast.success(`Achievement débloqué: ${achievement.title}!`, {
        description: `+${pointsToAward} points`
      });

    } catch (error: unknown) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground border-muted';
      case 'rare': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'epic': return 'text-purple-600 border-purple-200 bg-purple-50';
      case 'legendary': return 'text-gold border-gold/20 bg-gold/5';
      default: return 'text-muted-foreground border-muted';
    }
  };

  const currentLevelInfo = levels.find(level => level.level === userLevel);
  const nextLevelInfo = levels.find(level => level.level === userLevel + 1);
  const levelProgress = nextLevelInfo && currentLevelInfo
    ? ((totalPoints - currentLevelInfo.minPoints) / (nextLevelInfo.minPoints - currentLevelInfo.minPoints)) * 100
    : 100;

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card className="bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {currentLevelInfo?.icon}
              <span>Niveau {userLevel}: {currentLevelInfo?.title}</span>
            </CardTitle>
            <Badge variant="secondary" className="animate-pulse-gentle">
              <AnimatedCounter target={totalPoints} suffix=" points" />
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression vers le niveau suivant</span>
                  {nextLevelInfo && (
                    <span><AnimatedCounter target={Math.round(levelProgress)} suffix="%" /></span>
                  )}
                </div>
                <Progress 
                  value={levelProgress} 
                  className="h-3 animate-slide-in-right" 
                />
              </div>
            
            {nextLevelInfo && (
              <div className="p-3 bg-background/50 rounded-lg border">
                <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
                  {nextLevelInfo.icon}
                  <span>Prochain niveau: {nextLevelInfo.title}</span>
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {nextLevelInfo.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Gift className="w-3 h-3 text-gold" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-gold" />
            <span>Réalisations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressiveReveal
            items={achievements.map((achievement, index) => ({
              id: achievement.id,
              delay: index * 100,
              content: (
                <div
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    achievement.unlocked 
                      ? `${getRarityColor(achievement.rarity)} opacity-100` 
                      : 'border-muted bg-muted/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      achievement.unlocked 
                        ? 'bg-emerald text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {achievement.unlocked ? (
                        <Trophy className="w-4 h-4" />
                      ) : (
                        achievement.icon
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium">{achievement.title}</h4>
                        {achievement.unlocked && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Débloqué
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRarityColor(achievement.rarity)}`}
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      
                      {achievement.progress !== undefined && achievement.maxProgress && (
                        <div className="space-y-1">
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-2" 
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                            <span>+{achievement.reward.value} {achievement.reward.type}</span>
                          </div>
                        </div>
                      )}
                      
                      {achievement.unlocked && (
                        <div className="flex items-center space-x-1 text-xs text-emerald">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{achievement.reward.value} {achievement.reward.type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            }))}
            staggerDelay={100}
            className="space-y-3"
          />
        </CardContent>
      </Card>

      {/* Level Up Celebration */}
      {showLevelUp && (
        <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in bg-gradient-to-br from-emerald to-gold text-white">
          <CardContent className="p-8 text-center">
            <div className="animate-float mb-4">
              <Crown className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Niveau supérieur ! 🎉
            </h2>
            <p className="text-emerald-light mb-4">
              Vous avez atteint le niveau {userLevel}: {currentLevelInfo?.title}
            </p>
            <Button 
              variant="secondary"
              onClick={() => setShowLevelUp(false)}
              className="bg-white text-emerald hover:bg-emerald-light hover:text-white"
            >
              Continuer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamifiedInsights;