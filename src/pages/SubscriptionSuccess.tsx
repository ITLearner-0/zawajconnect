import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { checkSubscription } = useAuth();

  useEffect(() => {
    // Refresh subscription status after successful payment
    const timer = setTimeout(() => {
      checkSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-emerald/20 bg-gradient-to-br from-emerald/5 to-gold/5">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-emerald-dark">
            Paiement Réussi !
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg text-muted-foreground">
            Votre abonnement premium est maintenant actif. Profitez de toutes les fonctionnalités exclusives !
          </p>

          <div className="bg-gold/10 rounded-lg p-4 border border-gold/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-gold" />
              <h3 className="font-semibold text-gold-dark">Accès Premium Débloqué</h3>
            </div>
            <ul className="text-sm text-left space-y-2 text-muted-foreground">
              <li>✓ Likes illimités</li>
              <li>✓ Messages illimités</li>
              <li>✓ Recherche avancée</li>
              <li>✓ Voir qui vous a liké</li>
              <li>✓ Support prioritaire</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/enhanced-profile')}
              className="flex-1 bg-gradient-to-r from-gold to-gold-light hover:from-gold-dark hover:to-gold text-primary-foreground"
            >
              <Crown className="h-4 w-4 mr-2" />
              Voir Mon Profil
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/browse')}
              className="flex-1"
            >
              Commencer à Explorer
            </Button>
          </div>

          <Button
            variant="link"
            onClick={() => navigate('/settings?tab=subscription')}
            className="text-sm text-muted-foreground"
          >
            Gérer mon abonnement
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
