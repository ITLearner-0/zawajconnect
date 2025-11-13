import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWaliRegistration } from '@/hooks/wali';
import { WaliRegistrationForm } from '@/components/wali/registration/WaliRegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle2, Clock, XCircle } from 'lucide-react';

const WaliRegistrationPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { registration, loading: registrationLoading } = useWaliRegistration(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || registrationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si l'utilisateur a déjà une inscription
  if (registration) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Statut de votre inscription Wali</CardTitle>
            </div>
            <CardDescription>
              Voici l'état actuel de votre demande d'inscription en tant que Wali
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {registration.status === 'pending' && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Votre demande est en attente d'examen. Notre équipe vérifie vos documents et vous contactera sous 48-72h.
                </AlertDescription>
              </Alert>
            )}

            {registration.status === 'verified' && (
              <Alert className="border-blue-500 bg-blue-50">
                <Clock className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  Votre demande a été vérifiée avec succès et est maintenant active.
                </AlertDescription>
              </Alert>
            )}

            {registration.status === 'approved' && (
              <Alert className="border-success bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success-foreground">
                  Félicitations! Votre inscription a été approuvée. Vous pouvez maintenant accéder au tableau de bord Wali.
                </AlertDescription>
              </Alert>
            )}

            {registration.status === 'rejected' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Votre demande a été rejetée. {registration.rejection_reason && (
                    <>Raison: {registration.rejection_reason}</>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="border rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                  <p className="text-sm">{registration.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{registration.email}</p>
                </div>
                {registration.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                    <p className="text-sm">{registration.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de soumission</p>
                  <p className="text-sm">
                    {new Date(registration.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            {registration.status === 'approved' && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => navigate('/wali-dashboard')}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Accéder au tableau de bord
                </button>
              </div>
            )}

            {registration.status === 'rejected' && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => navigate('/wali-access')}
                  className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Retour à l'accueil
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulaire d'inscription pour les nouveaux utilisateurs
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Devenir Wali</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          En tant que Wali, vous aurez la responsabilité de superviser et guider les membres de votre famille 
          dans leur recherche de mariage, conformément aux valeurs islamiques.
        </p>
      </div>

      <WaliRegistrationForm />

      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-3">Conditions requises pour devenir Wali:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            Être un membre masculin de la famille (père, frère, oncle, etc.)
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            Avoir une pièce d'identité valide
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            Fournir une preuve de relation avec les membres que vous souhaitez superviser
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            Comprendre et accepter les responsabilités d'un Wali selon l'Islam
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WaliRegistrationPage;
