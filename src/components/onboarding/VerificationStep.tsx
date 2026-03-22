import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EmailVerification from '@/components/profile/verification/EmailVerification';
import PhoneVerification from '@/components/profile/verification/PhoneVerification';
import { VerificationStatus } from '@/types/profile';
import { ShieldCheck, Star, Info } from 'lucide-react';

interface VerificationStepProps {
  verificationStatus: VerificationStatus;
  userEmail: string;
}

const VerificationStep = ({ verificationStatus, userEmail }: VerificationStepProps) => {
  const verifiedCount = [verificationStatus.email, verificationStatus.phone].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Vérification du compte</h2>
        <p className="text-muted-foreground">
          Vérifiez votre identité pour gagner la confiance des autres membres
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center">
        <Badge
          variant="outline"
          className={`text-sm px-4 py-1 ${
            verifiedCount === 2
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : verifiedCount === 1
                ? 'bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 mr-1.5" />
          {verifiedCount}/2 vérification{verifiedCount !== 1 ? 's' : ''} complétée{verifiedCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Email Verification */}
      <Card>
        <CardContent className="p-4">
          <EmailVerification isVerified={verificationStatus.email} userEmail={userEmail} />
        </CardContent>
      </Card>

      {/* Phone Verification */}
      <Card>
        <CardContent className="p-4">
          <PhoneVerification isVerified={verificationStatus.phone} />
        </CardContent>
      </Card>

      {/* Benefits notice */}
      <Alert className="border-emerald-200 bg-emerald-50">
        <Info className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-sm text-emerald-700">
          <strong>Avantages de la vérification :</strong>
          <ul className="mt-1 ml-4 list-disc space-y-0.5">
            <li>Badge de profil vérifié visible par tous</li>
            <li>Priorité dans les résultats de recherche</li>
            <li>Accès aux fonctionnalités premium de messagerie</li>
          </ul>
        </AlertDescription>
      </Alert>

      <p className="text-xs text-center text-muted-foreground">
        Cette étape est optionnelle. Vous pouvez vérifier votre compte plus tard depuis les paramètres.
      </p>
    </div>
  );
};

export default VerificationStep;
