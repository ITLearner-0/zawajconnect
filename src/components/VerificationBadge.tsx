interface VerificationBadgeProps {
  verificationScore: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  idVerified?: boolean;
  familyVerified?: boolean;
  className?: string;
}

import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Mail, Phone, CreditCard, Users } from 'lucide-react';

const VerificationBadge = ({ 
  verificationScore, 
  emailVerified, 
  phoneVerified, 
  idVerified, 
  familyVerified,
  className 
}: VerificationBadgeProps) => {
  const getVerificationLevel = () => {
    if (verificationScore >= 80) return { level: 'premium', color: 'bg-gold/10 text-gold-dark border-gold/20', icon: Shield };
    if (verificationScore >= 60) return { level: 'verified', color: 'bg-emerald/10 text-emerald border-emerald/20', icon: CheckCircle };
    if (verificationScore >= 40) return { level: 'partial', color: 'bg-blue/10 text-blue-dark border-blue/20', icon: Shield };
    return { level: 'basic', color: 'bg-muted text-muted-foreground', icon: Shield };
  };

  const verification = getVerificationLevel();
  const Icon = verification.icon;

  const getVerificationText = () => {
    if (verification.level === 'premium') return 'Profil Premium';
    if (verification.level === 'verified') return 'Vérifié';
    if (verification.level === 'partial') return 'Partiellement vérifié';
    return 'Non vérifié';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge className={verification.color}>
        <Icon className="h-3 w-3 mr-1" />
        {getVerificationText()}
      </Badge>
      
      {/* Individual verification indicators */}
      <div className="flex gap-1">
        {emailVerified && (
          <div className="h-4 w-4 rounded-full bg-emerald/20 flex items-center justify-center" title="Email vérifié">
            <Mail className="h-2 w-2 text-emerald" />
          </div>
        )}
        {phoneVerified && (
          <div className="h-4 w-4 rounded-full bg-emerald/20 flex items-center justify-center" title="Téléphone vérifié">
            <Phone className="h-2 w-2 text-emerald" />
          </div>
        )}
        {idVerified && (
          <div className="h-4 w-4 rounded-full bg-emerald/20 flex items-center justify-center" title="Identité vérifiée">
            <CreditCard className="h-2 w-2 text-emerald" />
          </div>
        )}
        {familyVerified && (
          <div className="h-4 w-4 rounded-full bg-emerald/20 flex items-center justify-center" title="Famille vérifiée">
            <Users className="h-2 w-2 text-emerald" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationBadge;