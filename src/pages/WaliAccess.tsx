import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Users, Eye, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const WaliAccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Si déjà connecté, rediriger vers l'espace supervision
      navigate('/family-supervision');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="w-full max-w-2xl">
        <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-primary)' }}>
              <Shield className="h-8 w-8" style={{ color: '#fff' }} />
            </div>
            <CardTitle className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>Supervision Familiale</CardTitle>
            <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Accès dédié aux membres de famille et walis pour la supervision islamique
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)' }}>
                <Eye className="h-6 w-6 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                <h3 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>Supervision</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Surveiller les interactions</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)' }}>
                <MessageCircle className="h-6 w-6 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                <h3 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>Modération</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Guidance islamique</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)' }}>
                <Users className="h-6 w-6 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                <h3 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>Approbation</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Valider les matches</p>
              </div>
            </div>

            {/* Information islamique */}
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', borderRadius: 'var(--radius-md)' }}>
              <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-warning)' }}>
                <Shield className="h-4 w-4" />
                Responsabilité du Wali
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Le Wali joue un rôle essentiel dans la guidance islamique des rencontres
                matrimoniales, assurant que les interactions respectent les valeurs de pudeur et de
                respect mutuel.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                asChild
                style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}
              >
                <Link to="/auth?mode=wali" className="flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5" />
                  Se connecter comme Wali
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                asChild
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}
              >
                <Link to="/wali-registration" className="flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5" />
                  Devenir Wali
                </Link>
              </Button>

              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Vous avez reçu une invitation par email ?
                </p>
                <Button
                  variant="outline"
                  asChild
                  style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}
                >
                  <Link to="/invitation/accept">Accepter une invitation</Link>
                </Button>
              </div>
            </div>

            {/* Retour */}
            <div className="text-center pt-4">
              <Link
                to="/"
                className="text-sm transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaliAccess;
