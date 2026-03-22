import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, Check, Circle, ArrowRight } from 'lucide-react';

interface JourneyStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
}

interface NikahJourneyCardProps {
  profileCompleted?: boolean;
  compatibilityDone?: boolean;
  firstMatch?: boolean;
  supervisedExchange?: boolean;
  familyMeeting?: boolean;
  istikharaCompleted?: boolean;
  nikah?: boolean;
}

const NikahJourneyCard = ({
  profileCompleted = false,
  compatibilityDone = false,
  firstMatch = false,
  supervisedExchange = false,
  familyMeeting = false,
  istikharaCompleted = false,
  nikah = false,
}: NikahJourneyCardProps) => {
  const steps: JourneyStep[] = [
    { label: 'Profil complété', status: profileCompleted ? 'completed' : 'current' },
    { label: 'Test compatibilité', status: compatibilityDone ? 'completed' : profileCompleted ? 'current' : 'pending' },
    { label: 'Premier match', status: firstMatch ? 'completed' : compatibilityDone ? 'current' : 'pending' },
    { label: 'Échange supervisé', status: supervisedExchange ? 'completed' : firstMatch ? 'current' : 'pending' },
    { label: 'Réunion famille', status: familyMeeting ? 'completed' : supervisedExchange ? 'current' : 'pending' },
    { label: 'Istikhara & décision', status: istikharaCompleted ? 'completed' : familyMeeting ? 'current' : 'pending' },
    { label: 'Nikah', status: nikah ? 'completed' : istikharaCompleted ? 'current' : 'pending' },
  ];

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const currentIdx = steps.findIndex((s) => s.status === 'current');
  const progressPct = Math.round(((currentIdx >= 0 ? currentIdx : completedCount) / steps.length) * 100);

  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Parcours vers le nikah
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {step.status === 'completed' ? (
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              ) : step.status === 'current' ? (
                <ArrowRight className="h-4 w-4 text-amber-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
              )}
              <span
                className={
                  step.status === 'completed'
                    ? 'text-green-600 dark:text-green-400'
                    : step.status === 'current'
                      ? 'text-amber-600 dark:text-amber-400 font-medium'
                      : 'text-muted-foreground'
                }
              >
                {step.label}
                {step.label === 'Nikah' && ' ✨'}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            Étape {(currentIdx >= 0 ? currentIdx : completedCount) + 1} / {steps.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NikahJourneyCard;
