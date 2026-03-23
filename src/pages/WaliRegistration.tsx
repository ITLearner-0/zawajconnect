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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  // Si l'utilisateur a déjà une inscription
  if (registration) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
              <CardTitle style={{ color: 'var(--color-text-primary)' }}>Statut de votre inscription Wali</CardTitle>
            </div>
            <CardDescription style={{ color: 'var(--color-text-secondary)' }}>
              Voici l'état actuel de votre demande d'inscription en tant que Wali
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {registration.status === 'pending' && (
              <Alert style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', borderRadius: 'var(--radius-md)' }}>
                <Clock className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
                <AlertDescription style={{ color: 'var(--color-text-secondary)' }}>
                  Votre demande est en attente d'examen. Notre équipe vérifie vos documents et vous
                  contactera sous 48-72h.
                </AlertDescription>
              </Alert>
            )}

            {registration.status === 'verified' && (
              <Alert style={{ backgroundColor: 'var(--color-info-bg)', border: '1px solid var(--color-info-border)', borderRadius: 'var(--radius-md)' }}>
                <Clock className="h-4 w-4" style={{ color: 'var(--color-info)' }} />
                <AlertDescription style={{ color: 'var(--color-text-secondary)' }}>
                  Votre demande a été vérifiée avec succès et est maintenant active.
                </AlertDescription>
              </Alert>
            )}

            {registration.status === 'approved' && (
              <Alert style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                <AlertDescription style={{ color: 'var(--color-text-primary)' }}>
                  Félicitations! Votre inscription a été approuvée. Vous pouvez maintenant accéder
                  au tableau de bord Wali.
                </AlertDescription>
              </Alert>
            )}

            {registration.status === 'rejected' && (
              <Alert style={{ backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-md)' }}>
                <XCircle className="h-4 w-4" style={{ color: 'var(--color-danger)' }} />
                <AlertDescription style={{ color: 'var(--color-text-primary)' }}>
                  Votre demande a été rejetée.{' '}
                  {registration.rejection_reason && <>Raison: {registration.rejection_reason}</>}
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4 space-y-2" style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Nom complet</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{registration.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Email</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{registration.email}</p>
                </div>
                {registration.phone && (
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Téléphone</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{registration.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Date de soumission</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {new Date(registration.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            {registration.status === 'approved' && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => navigate('/wali-dashboard')}
                  className="px-6 py-2 transition-colors"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}
                >
                  Accéder au tableau de bord
                </button>
              </div>
            )}

            {registration.status === 'rejected' && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => navigate('/wali-access')}
                  className="px-6 py-2 transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}
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
    <div className="container max-w-4xl mx-auto py-8 px-4" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12" style={{ color: 'var(--color-primary)' }} />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Devenir Wali</h1>
        <p className="max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          En tant que Wali, vous aurez la responsabilité de superviser et guider les membres de
          votre famille dans leur recherche de mariage, conformément aux valeurs islamiques.
        </p>
      </div>

      <WaliRegistrationForm />

      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Conditions requises pour devenir Wali:</h3>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
            Être un membre masculin de la famille (père, frère, oncle, etc.)
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
            Avoir une pièce d'identité valide
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
            Fournir une preuve de relation avec les membres que vous souhaitez superviser
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
            Comprendre et accepter les responsabilités d'un Wali selon l'Islam
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WaliRegistrationPage;
