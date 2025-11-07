import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Crown } from 'lucide-react';
import { useUserLevel } from '@/hooks/useUserLevel';

const LEVEL_CONFIG = {
  bronze: { 
    icon: Award, 
    color: 'from-amber-700 to-amber-900',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    label: 'Bronze',
    next: 'Argent',
    xpNeeded: 2000
  },
  argent: { 
    icon: Star, 
    color: 'from-slate-400 to-slate-600',
    textColor: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    label: 'Argent',
    next: 'Or',
    xpNeeded: 5000
  },
  or: { 
    icon: Trophy, 
    color: 'from-yellow-400 to-yellow-600',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    label: 'Or',
    next: 'Platine',
    xpNeeded: 10000
  },
  platine: { 
    icon: Crown, 
    color: 'from-cyan-400 to-blue-600',
    textColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300',
    label: 'Platine',
    next: 'Maximum',
    xpNeeded: 10000
  }
};

interface UserLevelBadgeProps {
  compact?: boolean;
}

const UserLevelBadge: React.FC<UserLevelBadgeProps> = ({ compact = false }) => {
  const { level, loading } = useUserLevel();

  if (loading || !level) {
    return (
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = LEVEL_CONFIG[level.current_level];
  const Icon = config.icon;
  const isMaxLevel = level.current_level === 'platine';

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${config.borderColor} ${config.bgColor}`}>
        <Icon className={`h-4 w-4 ${config.textColor}`} />
        <span className={`font-semibold text-sm ${config.textColor}`}>
          {config.label}
        </span>
        <Badge variant="secondary" className="text-xs">
          {level.total_xp} XP
        </Badge>
      </div>
    );
  }

  return (
    <Card className={`border-2 ${config.borderColor} overflow-hidden`}>
      <div className={`h-2 bg-gradient-to-r ${config.color}`}></div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full bg-gradient-to-br ${config.color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Niveau {config.label}</h3>
              <p className="text-sm text-muted-foreground">
                {level.total_xp.toLocaleString()} XP Total
              </p>
            </div>
          </div>
          <Badge className={`${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
            Rang {config.label}
          </Badge>
        </div>

        {!isMaxLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Progression vers {config.next}
              </span>
              <span className="font-medium">
                {level.level_progress}%
              </span>
            </div>
            <Progress value={level.level_progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {(config.xpNeeded - (level.total_xp % config.xpNeeded)).toLocaleString()} XP restant
            </p>
          </div>
        )}

        {isMaxLevel && (
          <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-center font-medium text-cyan-900">
              🏆 Niveau Maximum Atteint!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserLevelBadge;
