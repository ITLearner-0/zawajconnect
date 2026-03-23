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
    <div
      className="rounded-2xl"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
    >
      <div className="p-4 pb-3">
        <h3
          className="text-base font-semibold flex items-center gap-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <Heart className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          Parcours vers le nikah
        </h3>
      </div>
      <div className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {step.status === 'completed' ? (
                <Check className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
              ) : step.status === 'current' ? (
                <ArrowRight className="h-4 w-4 shrink-0" style={{ color: 'var(--color-warning)' }} />
              ) : (
                <Circle className="h-4 w-4 shrink-0" style={{ color: 'var(--color-text-disabled)' }} />
              )}
              <span
                style={{
                  color:
                    step.status === 'completed'
                      ? 'var(--color-primary)'
                      : step.status === 'current'
                        ? 'var(--color-warning)'
                        : 'var(--color-text-muted)',
                  fontWeight: step.status === 'current' ? 500 : 400,
                }}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <div
            className="rounded-full overflow-hidden"
            style={{ height: 6, background: 'var(--color-border-subtle)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: 'var(--color-primary)' }}
            />
          </div>
          <p className="text-xs mt-1 text-right" style={{ color: 'var(--color-text-muted)' }}>
            Étape {(currentIdx >= 0 ? currentIdx : completedCount) + 1} / {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NikahJourneyCard;
