import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, AlertTriangle, Clock, UserCheck } from 'lucide-react';
import { useFamilySupervision } from '@/hooks/useFamilySupervision';
import { supabase } from '@/integrations/supabase/client';

interface FamilySupervisionGuardProps {
  matchId: string;
  children: React.ReactNode;
}

const FamilySupervisionGuard: React.FC<FamilySupervisionGuardProps> = ({
  matchId,
  children
}) => {
  console.log('🛡️ FamilySupervisionGuard mounting for matchId:', matchId);
  
  // Hooks must always be called in the same order - move useState to the top
  const [userProfile, setUserProfile] = React.useState<any>(null);
  
  const { 
    supervisionStatus, 
    loading, 
    requestFamilyApproval,
    getCriticalNotifications 
  } = useFamilySupervision();
  
  console.log('🛡️ FamilySupervisionGuard - loading:', loading, 'supervisionStatus:', supervisionStatus);

  const criticalNotifications = getCriticalNotifications();
  console.log('🚨 Critical notifications:', criticalNotifications.length);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Vérification de la supervision familiale...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show critical alerts first
  if (criticalNotifications.length > 0) {
    return (
      <div className="space-y-4">
        {criticalNotifications.map((notification) => (
          <Alert key={notification.id} className="border-red-500 bg-red-50 dark:bg-red-900/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              <strong>🚨 ALERTE CRITIQUE :</strong> {notification.content}
              {notification.original_message && (
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-800/20 rounded text-sm">
                  Message concerné : "{notification.original_message}"
                </div>
              )}
            </AlertDescription>
          </Alert>
        ))}
        
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Shield className="h-5 w-5" />
              Communication Temporairement Suspendue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              Suite aux alertes ci-dessus, cette conversation nécessite une révision par votre famille 
              selon les principes islamiques de supervision.
            </p>
            <p className="text-sm text-muted-foreground">
              Veuillez contacter votre Wali ou un membre de famille responsable pour résoudre ces questions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check supervision requirements based on Islamic principles (women need supervision)
  React.useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('gender')
          .eq('user_id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    getUserProfile();
  }, []);

  // Only women need mandatory family supervision in Islam
  const needsSupervision = userProfile?.gender === 'female' || userProfile?.gender === 'femme';
  
  if (needsSupervision && !supervisionStatus.hasWali) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertTriangle className="h-5 w-5" />
            Supervision Familiale Requise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Principe islamique :</strong> Selon la Sharia, les femmes musulmanes doivent 
              avoir un tuteur (Wali) pour superviser les communications dans le cadre du mariage.
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-4">
            <Users className="h-16 w-16 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Configuration du Wali Requise
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">
                Vous devez ajouter un membre de famille comme Wali pour pouvoir communiquer 
                en respectant les valeurs islamiques.
              </p>
              <Button 
                onClick={() => window.location.href = '/family'}
                className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
              >
                <Users className="h-4 w-4 mr-2" />
                Configurer ma Famille
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if family approval is pending (only for women)
  if (needsSupervision && !supervisionStatus.familyApproved) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Clock className="h-5 w-5" />
            En Attente d'Approbation Familiale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Selon les principes islamiques, votre famille doit approuver cette communication 
              avant qu'elle puisse commencer.
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-4">
            <UserCheck className="h-16 w-16 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Approbation Familiale Nécessaire
              </h3>
              <p className="text-amber-600 dark:text-amber-300 mb-4">
                Votre Wali doit approuver cette communication pour qu'elle puisse commencer 
                conformément aux traditions islamiques.
              </p>
              <Button 
                onClick={() => requestFamilyApproval(matchId)}
                className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
              >
                <Shield className="h-4 w-4 mr-2" />
                Demander l'Approbation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If supervision is not required (for men) or all checks pass, show the chat
  if (!needsSupervision || supervisionStatus.canCommunicate) {
    return <>{children}</>;
  }

  // Default fallback
  return (
    <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/10">
      <CardContent className="p-8">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Communication Non Autorisée
          </h3>
          <p className="text-red-600 dark:text-red-300">
            Cette communication ne respecte pas les principes islamiques de supervision familiale.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilySupervisionGuard;