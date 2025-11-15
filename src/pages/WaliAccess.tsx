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
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg border-emerald/20">
          <CardHeader className="text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold text-emerald">Supervision Familiale</CardTitle>
            <p className="text-muted-foreground mt-2">
              Accès dédié aux membres de famille et walis pour la supervision islamique
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald/5 rounded-lg border border-emerald/10">
                <Eye className="h-6 w-6 text-emerald mx-auto mb-2" />
                <h3 className="font-medium text-sm">Supervision</h3>
                <p className="text-xs text-muted-foreground">Surveiller les interactions</p>
              </div>
              <div className="text-center p-4 bg-emerald/5 rounded-lg border border-emerald/10">
                <MessageCircle className="h-6 w-6 text-emerald mx-auto mb-2" />
                <h3 className="font-medium text-sm">Modération</h3>
                <p className="text-xs text-muted-foreground">Guidance islamique</p>
              </div>
              <div className="text-center p-4 bg-emerald/5 rounded-lg border border-emerald/10">
                <Users className="h-6 w-6 text-emerald mx-auto mb-2" />
                <h3 className="font-medium text-sm">Approbation</h3>
                <p className="text-xs text-muted-foreground">Valider les matches</p>
              </div>
            </div>

            {/* Information islamique */}
            <div className="bg-gold/5 border border-gold/20 rounded-lg p-4">
              <h4 className="font-medium text-gold-dark mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Responsabilité du Wali
              </h4>
              <p className="text-sm text-gold-dark">
                Le Wali joue un rôle essentiel dans la guidance islamique des rencontres
                matrimoniales, assurant que les interactions respectent les valeurs de pudeur et de
                respect mutuel.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <Button
                className="w-full bg-emerald hover:bg-emerald-dark text-primary-foreground"
                size="lg"
                asChild
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
                className="w-full border-emerald text-emerald hover:bg-emerald/5"
                asChild
              >
                <Link to="/wali-registration" className="flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5" />
                  Devenir Wali
                </Link>
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Vous avez reçu une invitation par email ?
                </p>
                <Button
                  variant="outline"
                  className="border-emerald text-emerald hover:bg-emerald hover:text-white"
                  asChild
                >
                  <Link to="/invitation/accept">Accepter une invitation</Link>
                </Button>
              </div>
            </div>

            {/* Retour */}
            <div className="text-center pt-4">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-emerald transition-colors"
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
