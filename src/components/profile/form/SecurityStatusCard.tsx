
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from 'lucide-react';

interface SecurityStatusCardProps {
  securityStatus: {
    loading: boolean;
    isSecure: boolean;
    emailVerified: boolean;
  };
}

const SecurityStatusCard: React.FC<SecurityStatusCardProps> = ({ securityStatus }) => {
  if (securityStatus.loading) return null;

  return (
    <Card className={`border-2 ${securityStatus.isSecure ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2">
          <Shield className={`h-4 w-4 ${securityStatus.isSecure ? 'text-green-600' : 'text-yellow-600'}`} />
          <span className={`text-sm font-medium ${securityStatus.isSecure ? 'text-green-800' : 'text-yellow-800'}`}>
            {securityStatus.isSecure ? 'Compte sécurisé' : 'Sécurité à améliorer'}
          </span>
        </div>
        {!securityStatus.emailVerified && (
          <p className="text-xs text-yellow-700 mt-1">
            Vérifiez votre email pour accéder à toutes les fonctionnalités
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityStatusCard;
