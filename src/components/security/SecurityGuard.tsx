import React, { ReactNode } from 'react';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import SecurityStatusBadge from './SecurityStatusBadge';

interface SecurityGuardProps {
  children: ReactNode;
  requiredOperation?: 'family' | 'message' | 'profile';
  requiredScore?: number;
  fallbackComponent?: ReactNode;
  showUpgrade?: boolean;
}

const SecurityGuard: React.FC<SecurityGuardProps> = ({
  children,
  requiredOperation = 'message',
  requiredScore = 60,
  fallbackComponent,
  showUpgrade = true
}) => {
  const { securityStatus, loading } = useSecurityMonitor();
  const { validateFamilyOperation, validateMessagePermissions, validateProfileAccess } = useSecurityValidation();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Vérification sécurisée...</span>
        </div>
      </Card>
    );
  }

  const currentScore = securityStatus?.verification_score || 0;
  const emailVerified = securityStatus?.email_verified || false;
  const idVerified = securityStatus?.id_verified || false;

  // Check if user meets requirements
  const meetsRequirements = () => {
    if (!emailVerified) return false;
    
    if (requiredOperation === 'family' && requiredScore >= 80 && !idVerified) {
      return false;
    }
    
    return currentScore >= requiredScore;
  };

  const getUpgradeSteps = () => {
    const steps = [];
    
    if (!emailVerified) {
      steps.push('Vérifiez votre adresse email');
    }
    
    if (requiredOperation === 'family' && !idVerified) {
      steps.push('Vérifiez votre identité avec une pièce d\'identité');
    }
    
    if (currentScore < requiredScore) {
      steps.push(`Améliorez votre score de sécurité (${currentScore}/${requiredScore})`);
    }
    
    return steps;
  };

  if (!meetsRequirements()) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Vérification Requise</h3>
            <p className="text-muted-foreground">
              Cette fonctionnalité nécessite un niveau de sécurité plus élevé.
            </p>
          </div>

          <div className="flex justify-center">
            <SecurityStatusBadge variant="full" />
          </div>

          {showUpgrade && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Pour accéder à cette fonctionnalité :</p>
                  <ul className="text-sm space-y-1">
                    {getUpgradeSteps().map((step, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-center">
            {!emailVerified && (
              <Button variant="outline" size="sm">
                Vérifier Email
              </Button>
            )}
            {requiredOperation === 'family' && !idVerified && (
              <Button variant="outline" size="sm">
                Vérifier Identité
              </Button>
            )}
            <Button size="sm">
              Améliorer Sécurité
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
};

export default SecurityGuard;