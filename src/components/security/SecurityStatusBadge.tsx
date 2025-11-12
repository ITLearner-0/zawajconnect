import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { useEnhancedSessionMonitor } from '@/hooks/useEnhancedSessionMonitor';

interface SecurityStatusBadgeProps {
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
}

const SecurityStatusBadge: React.FC<SecurityStatusBadgeProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { securityStatus, loading } = useSecurityMonitor();
  const { isSessionNearExpiry } = useEnhancedSessionMonitor();

  if (loading) {
    return (
      <Badge variant="outline" className={className}>
        <Shield className="h-3 w-3 mr-1" />
        Chargement...
      </Badge>
    );
  }

  const getSecurityLevel = () => {
    const score = securityStatus?.verification_score || 0;
    const emailVerified = securityStatus?.email_verified || false;
    const idVerified = securityStatus?.id_verified || false;

    if (score >= 85 && emailVerified && idVerified) {
      return {
        level: 'high',
        label: 'Sécurité Élevée',
        color: 'bg-emerald-500',
        icon: CheckCircle,
        variant: 'default' as const,
      };
    } else if (score >= 30 || emailVerified) {
      return {
        level: 'medium',
        label: 'Profil Standard',
        color: 'bg-blue-500',
        icon: Shield,
        variant: 'outline' as const,
      };
    } else {
      return {
        level: 'low',
        label: 'À Compléter',
        color: 'bg-amber-500',
        icon: AlertTriangle,
        variant: 'secondary' as const,
      };
    }
  };

  const { level, label, color, icon: Icon, variant: badgeVariant } = getSecurityLevel();

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className={`w-2 h-2 rounded-full ${color}`} />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Badge variant={badgeVariant} className={`flex items-center gap-1 ${className}`}>
        <Icon className="h-3 w-3" />
        {level === 'high' ? 'Vérifié' : level === 'medium' ? 'Standard' : 'Nouveau'}
        {isSessionNearExpiry && <XCircle className="h-3 w-3 text-destructive" />}
      </Badge>
    );
  }

  return (
    <Badge variant={badgeVariant} className={`flex items-center gap-2 ${className}`}>
      <Icon className="h-4 w-4" />
      <div className="flex flex-col items-start">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs opacity-80">
          Score: {securityStatus?.verification_score || 0}/100
        </span>
      </div>
      {isSessionNearExpiry && (
        <div className="flex items-center gap-1 text-destructive">
          <XCircle className="h-3 w-3" />
          <span className="text-xs">Session expire</span>
        </div>
      )}
    </Badge>
  );
};

export default SecurityStatusBadge;
