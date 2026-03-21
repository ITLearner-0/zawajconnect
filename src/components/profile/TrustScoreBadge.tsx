import { Shield, ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface TrustScoreBreakdown {
  emailVerified: boolean;
  idVerified: boolean;
  profileCompletionScore: number;
  loginRegularityScore: number;
  compatibilityTestCompleted: boolean;
}

interface TrustScoreBadgeProps {
  score: number;
  breakdown?: TrustScoreBreakdown;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

const getScoreConfig = (score: number) => {
  if (score >= 80) {
    return {
      label: 'Très fiable',
      icon: ShieldCheck,
      badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      ringClass: 'border-emerald-500',
      textClass: 'text-emerald-600',
    };
  }
  if (score >= 50) {
    return {
      label: 'Fiable',
      icon: Shield,
      badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
      ringClass: 'border-amber-500',
      textClass: 'text-amber-600',
    };
  }
  return {
    label: 'En vérification',
    icon: ShieldAlert,
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    ringClass: 'border-gray-400',
    textClass: 'text-gray-500',
  };
};

const breakdownItems = [
  { key: 'emailVerified' as const, label: 'Email vérifié', max: 20, check: (b: TrustScoreBreakdown) => b.emailVerified ? 20 : 0 },
  { key: 'idVerified' as const, label: 'Identité vérifiée', max: 30, check: (b: TrustScoreBreakdown) => b.idVerified ? 30 : 0 },
  { key: 'profileCompletionScore' as const, label: 'Profil complété', max: 25, check: (b: TrustScoreBreakdown) => Math.min(Math.round(b.profileCompletionScore * 25 / 100), 25) },
  { key: 'loginRegularityScore' as const, label: 'Connexion régulière', max: 15, check: (b: TrustScoreBreakdown) => Math.min(Math.round(b.loginRegularityScore * 15 / 100), 15) },
  { key: 'compatibilityTestCompleted' as const, label: 'Test de compatibilité', max: 10, check: (b: TrustScoreBreakdown) => b.compatibilityTestCompleted ? 10 : 0 },
];

const TrustScoreBadge = ({
  score,
  breakdown,
  size = 'md',
  className,
  showTooltip = true,
}: TrustScoreBadgeProps) => {
  const config = getScoreConfig(score);
  const Icon = config.icon;

  const sizeClasses = {
    sm: { badge: 'text-xs py-0.5 px-2', icon: 'h-3 w-3' },
    md: { badge: 'text-xs py-1 px-2.5', icon: 'h-3.5 w-3.5' },
    lg: { badge: 'text-sm py-1.5 px-3', icon: 'h-4 w-4' },
  };

  const badgeElement = (
    <Badge
      variant="outline"
      className={cn(config.badgeClass, sizeClasses[size].badge, 'font-medium cursor-default', className)}
    >
      <Icon className={cn(sizeClasses[size].icon, 'mr-1')} />
      {config.label}
      {size !== 'sm' && <span className="ml-1 font-bold">{score}%</span>}
    </Badge>
  );

  if (!showTooltip || !breakdown) {
    return badgeElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
        <TooltipContent side="bottom" className="w-72 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Score de confiance</span>
              <span className={cn('font-bold text-lg', config.textClass)}>{score}/100</span>
            </div>
            <div className="space-y-2">
              {breakdownItems.map((item) => {
                const value = item.check(breakdown);
                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={cn('font-medium', value > 0 ? 'text-emerald-600' : 'text-gray-400')}>
                        {value}/{item.max}
                      </span>
                    </div>
                    <Progress value={(value / item.max) * 100} className="h-1.5" />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground border-t pt-2">
              Le score augmente avec la vérification d'identité, la complétion du profil et l'activité régulière.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TrustScoreBadge;
