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
import AnimatedCounter from '@/components/AnimatedCounter';
import ProgressiveReveal from '@/components/ProgressiveReveal';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: {
    type: 'points' | 'badge' | 'unlock';
    value: string;
  };
}

interface GamificationLevel {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  icon: React.ReactNode;
}

interface GamifiedInsightsProps {
  userId?: string;
}

const GamifiedInsights: React.FC<GamifiedInsightsProps> = ({ userId }) => {
  const { insights, loading }: UseCompatibilityInsightsReturn = useCompatibilityInsights(userId);
  const [userLevel, setUserLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);

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
    const initializeGamification = (): void => {
      const currentAchievements = [...allAchievements];
      let points = 0;
      
      if (insights) {
        // Check achievements based on insights data
        currentAchievements.forEach(achievement => {
          switch (achievement.id) {
            case 'first_test':
              achievement.unlocked = true;
              if (achievement.unlocked) points += parseInt(achievement.reward.value);
              break;
            case 'perfect_match': {
              const maxScore = Math.max(...insights.compatibilityAreas.map(area => area.score));
              achievement.unlocked = maxScore >= 90;
              if (achievement.unlocked) points += achievement.reward.type === 'points' ? parseInt(achievement.reward.value) : 0;
              break;
            }
            case 'insight_master':
              achievement.progress = insights.compatibilityAreas.length;
              achievement.unlocked = (achievement.progress || 0) >= (achievement.maxProgress || 0);
              break;
          }
        });
      }

      setAchievements(currentAchievements);
      setTotalPoints(points);
      
      // Determine level
      const currentLevel = levels.find(level => 
        points >= level.minPoints && points < level.maxPoints
      );
      if (currentLevel) {
        setUserLevel(currentLevel.level);
      }
    };

    initializeGamification();
  }, [insights]);

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