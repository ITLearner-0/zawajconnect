import { ShieldCheck } from 'lucide-react';
import { VerificationStatus } from '@/types/profile';

interface TrustScoreCardProps {
  verificationStatus: VerificationStatus;
  verificationScore: number;
  profileCompleteness?: { filled: number; total: number };
  hasCompatibilityTest?: boolean;
  hasVerifiedPhoto?: boolean;
}

const CheckItem = ({
  label,
  checked,
  partial,
  detail,
}: {
  label: string;
  checked: boolean;
  partial?: boolean;
  detail?: string;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span style={{ color: 'var(--color-text-muted)' }}>
      {label}
      {detail && <span className="text-xs ml-1">({detail})</span>}
    </span>
    {checked ? (
      <div className="h-3 w-3 rounded-full" style={{ background: 'var(--color-primary)' }} />
    ) : partial ? (
      <div className="h-3 w-3 rounded-full" style={{ background: 'var(--color-warning)' }} />
    ) : (
      <div className="h-3 w-3 rounded-full" style={{ border: '2px solid var(--color-border-strong)' }} />
    )}
  </div>
);

const TrustScoreCard = ({
  verificationStatus,
  verificationScore,
  profileCompleteness,
  hasCompatibilityTest = false,
  hasVerifiedPhoto = false,
}: TrustScoreCardProps) => {
  const score = Math.min(100, Math.max(0, verificationScore));

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
    >
      <h3
        className="text-base font-semibold flex items-center gap-2 mb-4"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <ShieldCheck className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
        Score de confiance
      </h3>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div
              className="rounded-full overflow-hidden"
              style={{ height: 6, background: 'var(--color-border-subtle)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${score}%`,
                  background: score >= 80 ? 'var(--color-primary)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-text-disabled)',
                }}
              />
            </div>
          </div>
          <span className="text-lg font-bold whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
            {score}{' '}
            <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>/ 100</span>
          </span>
        </div>

        <div className="space-y-2">
          <CheckItem label="Email confirmé" checked={verificationStatus.email} />
          <CheckItem label="Pièce d'identité" checked={verificationStatus.id} />
          <CheckItem
            label="Profil complété"
            checked={profileCompleteness ? profileCompleteness.filled >= profileCompleteness.total : false}
            partial={profileCompleteness ? profileCompleteness.filled > 0 : false}
            detail={profileCompleteness ? `${profileCompleteness.filled}/${profileCompleteness.total}` : undefined}
          />
          <CheckItem label="Test de compatibilité" checked={hasCompatibilityTest} />
          <CheckItem label="Photo vérifiée" checked={hasVerifiedPhoto} />
        </div>
      </div>
    </div>
  );
};

export default TrustScoreCard;
