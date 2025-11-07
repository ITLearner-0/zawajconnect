import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Zap, FileText, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AchievementUnlock {
  achievement_id: string;
  achievement_title: string;
  rarity: string;
  points_awarded: number;
  unlocked_at: string | null;
}

const ACHIEVEMENT_ICONS: Record<string, React.ElementType> = {
  profile_complete: Award,
  speed_master: Zap,
  detail_oriented: FileText
};

const RARITY_COLORS: Record<string, string> = {
  common: 'text-slate-600 bg-slate-100 border-slate-300',
  rare: 'text-blue-600 bg-blue-50 border-blue-300',
  epic: 'text-purple-600 bg-purple-50 border-purple-300',
  legendary: 'text-amber-600 bg-amber-50 border-amber-300'
};

const ALL_ACHIEVEMENTS = [
  {
    id: 'profile_complete',
    title: 'Profil Complet',
    description: 'Complétez 100% de votre profil',
    rarity: 'epic'
  },
  {
    id: 'speed_master',
    title: 'Rapide comme l\'éclair',
    description: 'Complétez votre profil en moins de 5 minutes',
    rarity: 'rare'
  },
  {
    id: 'detail_oriented',
    title: 'Détaillé',
    description: 'Écrivez une bio de plus de 200 caractères',
    rarity: 'common'
  }
];

const OnboardingBadges: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementUnlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('achievement_unlocks')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (data) {
      setAchievements(data);
    }
    setLoading(false);
  };

  const unlockedIds = new Set(achievements.map(a => a.achievement_id));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Badges d'Onboarding
          </CardTitle>
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Badges d'Onboarding
          </CardTitle>
          <Badge variant="outline">
            {achievements.length}/{ALL_ACHIEVEMENTS.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ALL_ACHIEVEMENTS.map(achievement => {
            const unlocked = unlockedIds.has(achievement.id);
            const unlockedData = achievements.find(a => a.achievement_id === achievement.id);
            const Icon = ACHIEVEMENT_ICONS[achievement.id] || Award;
            const colorClass = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;

            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  unlocked
                    ? `${colorClass} shadow-sm`
                    : 'bg-muted/50 border-muted text-muted-foreground'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${unlocked ? 'bg-background/50' : 'bg-background'}`}>
                    {unlocked ? (
                      <Icon className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 truncate">
                      {achievement.title}
                    </h4>
                    <p className="text-xs opacity-90 leading-tight">
                      {achievement.description}
                    </p>
                    {unlocked && unlockedData && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {achievement.rarity}
                        </Badge>
                        <span className="text-xs font-medium">
                          +{unlockedData.points_awarded} pts
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingBadges;
