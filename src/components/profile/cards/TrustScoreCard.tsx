import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, Check, Circle, AlertCircle } from 'lucide-react';
import { VerificationStatus } from '@/types/profile';

interface TrustScoreCardProps {
  verificationStatus: VerificationStatus;
  verificationScore: number;
  profileCompleteness?: { filled: number; total: number };
  hasCompatibilityTest?: boolean;
  hasVerifiedPhoto?: boolean;
}

interface CheckItemProps {
  label: string;
  checked: boolean;
  partial?: boolean;
  detail?: string;
}

const CheckItem = ({ label, checked, partial, detail }: CheckItemProps) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">
      {label}
      {detail && <span className="text-xs ml-1">({detail})</span>}
    </span>
    {checked ? (
      <div className="h-3 w-3 rounded-full bg-green-500" />
    ) : partial ? (
      <div className="h-3 w-3 rounded-full bg-amber-500" />
    ) : (
      <div className="h-3 w-3 rounded-full border-2 border-gray-300" />
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
  const progressColor =
    score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-gray-400';

  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Score de confiance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
          <span className="text-lg font-bold whitespace-nowrap">
            {score} <span className="text-sm font-normal text-muted-foreground">/ 100</span>
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
      </CardContent>
    </Card>
  );
};

export default TrustScoreCard;
