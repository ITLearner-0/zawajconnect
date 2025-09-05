import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Star, 
  Target, 
  Heart, 
  BookOpen, 
  Users, 
  CheckCircle,
  Lock,
  Trophy,
  Sparkles
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: 'completion' | 'engagement' | 'social' | 'growth';
  reward?: string;
}

interface CompatibilityAchievementsProps {
  completionPercentage: number;
  insightsViewed: number;
  profilesVisited: number;
  guidanceRead: number;
}

const CompatibilityAchievements: React.FC<CompatibilityAchievementsProps> = ({
  completionPercentage,
  insightsViewed,
  profilesVisited,
  guidanceRead
}) => {
  const achievements: Achievement[] = [
    {
      id: 'first_step',
      title: 'Premier Pas',
      description: 'Commencer le test de compatibilité',
      icon: Heart,
      progress: completionPercentage > 0 ? 1 : 0,
      maxProgress: 1,
      unlocked: completionPercentage > 0,
      category: 'completion',
      reward: 'Badge Débutant'
    },
    {
      id: 'halfway_there',
      title: 'À Mi-Chemin',
      description: 'Compléter 50% du test',
      icon: Target,
      progress: Math.min(completionPercentage, 50),
      maxProgress: 50,
      unlocked: completionPercentage >= 50,
      category: 'completion',
      reward: 'Aperçu des insights'
    },
    {
      id: 'test_master',
      title: 'Maître du Test',
      description: 'Compléter 100% du test de compatibilité',
      icon: Trophy,
      progress: Math.min(completionPercentage, 100),
      maxProgress: 100,
      unlocked: completionPercentage >= 100,
      category: 'completion',
      reward: 'Insights complets débloqués'
    },
    {
      id: 'insight_explorer',
      title: 'Explorateur d\'Insights',
      description: 'Consulter vos insights 5 fois',
      icon: Sparkles,
      progress: Math.min(insightsViewed, 5),
      maxProgress: 5,
      unlocked: insightsViewed >= 5,
      category: 'engagement',
      reward: 'Conseils avancés'
    },
    {
      id: 'wisdom_seeker',
      title: 'Chercheur de Sagesse',
      description: 'Lire 3 conseils islamiques',
      icon: BookOpen,
      progress: Math.min(guidanceRead, 3),
      maxProgress: 3,
      unlocked: guidanceRead >= 3,
      category: 'growth',
      reward: 'Badge Spirituel'
    },
    {
      id: 'social_butterfly',
      title: 'Papillon Social',
      description: 'Visiter 10 profils compatibles',
      icon: Users,
      progress: Math.min(profilesVisited, 10),
      maxProgress: 10,
      unlocked: profilesVisited >= 10,
      category: 'social',
      reward: 'Recommandations personnalisées'
    }
  ];

  const getCategoryColor = (category: Achievement['category']): string => {
    switch (category) {
      case 'completion': return 'text-blue-600 bg-blue-50';
      case 'engagement': return 'text-purple-600 bg-purple-50';
      case 'social': return 'text-green-600 bg-green-50';
      case 'growth': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryLabel = (category: Achievement['category']): string => {
    switch (category) {
      case 'completion': return 'Progression';
      case 'engagement': return 'Engagement';
      case 'social': return 'Social';
      case 'growth': return 'Croissance';
      default: return 'Général';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Réalisations
          </CardTitle>
          <Badge variant="outline" className="font-medium">
            {unlockedCount}/{totalAchievements}
          </Badge>
        </div>
        <div className="mt-2">
          <Progress value={(unlockedCount / totalAchievements) * 100} className="h-2" />
          <p className="text-sm text-muted-foreground mt-1">
            {Math.round((unlockedCount / totalAchievements) * 100)}% des réalisations débloquées
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
          
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all ${
                achievement.unlocked 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  achievement.unlocked 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {achievement.unlocked ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${
                        achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {achievement.title}
                      </h4>
                      {achievement.unlocked && (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getCategoryColor(achievement.category)}`}
                    >
                      {getCategoryLabel(achievement.category)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  
                  {!achievement.unlocked && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progression</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-1" />
                    </div>
                  )}
                  
                  {achievement.reward && achievement.unlocked && (
                    <div className="flex items-center space-x-1 text-xs text-emerald-600">
                      <Star className="h-3 w-3" />
                      <span>Récompense: {achievement.reward}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default CompatibilityAchievements;