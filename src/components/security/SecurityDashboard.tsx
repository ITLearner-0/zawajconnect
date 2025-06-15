
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Eye, Lock, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityAudit } from '@/hooks/security/useSecurityAudit';
import { toast } from 'sonner';

interface SecurityStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  profileComplete: boolean;
  recentLoginAttempts: number;
  accountVisible: boolean;
}

const SecurityDashboard = () => {
  const { user } = useAuth();
  const { logPrivacyChange } = useSecurityAudit();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    emailVerified: false,
    phoneVerified: false,
    idVerified: false,
    profileComplete: false,
    recentLoginAttempts: 0,
    accountVisible: true
  });

  const [securityScore, setSecurityScore] = useState(0);

  useEffect(() => {
    // Calculate security score based on status
    let score = 0;
    if (securityStatus.emailVerified) score += 25;
    if (securityStatus.phoneVerified) score += 25;
    if (securityStatus.idVerified) score += 25;
    if (securityStatus.profileComplete) score += 25;
    
    setSecurityScore(score);
  }, [securityStatus]);

  const getSecurityLevel = (score: number): { level: string; color: string; icon: React.ReactNode } => {
    if (score >= 75) {
      return { level: 'Élevé', color: 'green', icon: <CheckCircle className="h-4 w-4" /> };
    } else if (score >= 50) {
      return { level: 'Modéré', color: 'yellow', icon: <AlertTriangle className="h-4 w-4" /> };
    } else {
      return { level: 'Faible', color: 'red', icon: <AlertTriangle className="h-4 w-4" /> };
    }
  };

  const handlePrivacyToggle = async (setting: string, newValue: boolean) => {
    try {
      // This would normally make an API call
      setSecurityStatus(prev => ({ ...prev, [setting]: newValue }));
      
      logPrivacyChange(setting, true, { newValue, previousValue: !newValue });
      
      toast.success(`Paramètre de confidentialité mis à jour`);
    } catch (error) {
      logPrivacyChange(setting, false, { error: error instanceof Error ? error.message : 'Unknown error' });
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const securityLevel = getSecurityLevel(securityScore);

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tableau de Bord Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {securityLevel.icon}
              <span className="font-medium">Niveau de sécurité: </span>
              <Badge variant={securityLevel.color === 'green' ? 'default' : 'destructive'}>
                {securityLevel.level}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-rose-600">
              {securityScore}%
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                securityLevel.color === 'green' ? 'bg-green-500' : 
                securityLevel.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${securityScore}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Statut de Vérification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Email vérifié</span>
            <Badge variant={securityStatus.emailVerified ? 'default' : 'secondary'}>
              {securityStatus.emailVerified ? 'Vérifié' : 'Non vérifié'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Téléphone vérifié</span>
            <Badge variant={securityStatus.phoneVerified ? 'default' : 'secondary'}>
              {securityStatus.phoneVerified ? 'Vérifié' : 'Non vérifié'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Identité vérifiée</span>
            <Badge variant={securityStatus.idVerified ? 'default' : 'secondary'}>
              {securityStatus.idVerified ? 'Vérifié' : 'Non vérifié'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Contrôles de Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Compte visible</span>
            <Button 
              variant={securityStatus.accountVisible ? "default" : "outline"}
              size="sm"
              onClick={() => handlePrivacyToggle('accountVisible', !securityStatus.accountVisible)}
            >
              {securityStatus.accountVisible ? 'Visible' : 'Masqué'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activité de Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tentatives de connexion récentes</span>
              <span className="font-medium">{securityStatus.recentLoginAttempts}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Dernière connexion</span>
              <span className="font-medium">Aujourd'hui</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            {!securityStatus.emailVerified && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                Vérifiez votre adresse email
              </div>
            )}
            {!securityStatus.phoneVerified && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                Vérifiez votre numéro de téléphone
              </div>
            )}
            {!securityStatus.idVerified && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                Vérifiez votre identité
              </div>
            )}
            {securityScore === 100 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Votre compte est entièrement sécurisé !
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
