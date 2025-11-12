import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SecurityHeader = () => {
  const { user } = useAuth();

  // Mock security status - in real app this would come from a hook
  const securityIssues = [
    // Add any current security warnings here
  ];

  if (securityIssues.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50 text-green-800 mb-4">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Votre compte est sécurisé. Toutes les vérifications de sécurité sont passées.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {securityIssues.length} problème(s) de sécurité détecté(s). Veuillez vérifier vos paramètres
        de sécurité.
      </AlertDescription>
    </Alert>
  );
};

export default SecurityHeader;
