import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  Check, 
  Star, 
  Infinity, 
  MessageCircle, 
  Eye, 
  Heart,
  Shield,
  Users,
  Zap
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  pricePerMonth: number;
  duration: number;
  currency: string;
  features: string[];
  popular?: boolean;
  badge?: string;
  discount?: string;
}

const PRICE_IDS = {
  premium_3: 'price_1SEwZ94GoRjf8T3bVP5cNIhS',
  premium_6: 'price_1SEwZA4GoRjf8T3b9SY6tArJ',
  premium_12: 'price_1SEwZA4GoRjf8T3bxXtkY8b5',
};

const PremiumSubscription = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'premium_3',
      name: 'Premium - Engagement 3 mois',
      price: 9.99,
      pricePerMonth: 9.99,
      duration: 3,
      currency: 'EUR',
      badge: 'Essai',
      features: [
        'Profils détaillés illimités',
        'Likes illimités',
        'Messages illimités',
        'Recherche avancée',
        'Supervision familiale incluse',
        'Matching avancé',
        'Support prioritaire'
      ]
    },
    {
      id: 'premium_6',
      name: 'Premium - Engagement 6 mois',
      price: 8.33,
      pricePerMonth: 8.33,
      duration: 6,
      currency: 'EUR',
      popular: true,
      badge: '⭐ Populaire',
      discount: '-17%',
      features: [
        'Profils détaillés illimités',
        'Likes illimités',
        'Messages illimités',
        'Recherche avancée',
        'Supervision familiale incluse',
        'Matching avancé',
        'Support prioritaire',
        'Boost de visibilité'
      ]
    },
    {
      id: 'premium_12',
      name: 'Premium - Engagement 12 mois',
      price: 6.66,
      pricePerMonth: 6.66,
      duration: 12,
      currency: 'EUR',
      badge: '💎 Best Value',
      discount: '-33%',
      features: [
        'Profils détaillés illimités',
        'Likes illimités',
        'Messages illimités',
        'Recherche avancée',
        'Supervision familiale incluse',
        'Matching avancé',
        'Support prioritaire',
        'Boost de visibilité',
        'Consultations matrimoniales'
      ]
    }
  ];

  useEffect(() => {
    // Refresh subscription when returning from Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({
        title: "Paiement réussi !",
        description: "Votre abonnement est maintenant actif",
      });
      setTimeout(() => checkSubscription(), 2000);
    } else if (params.get('canceled') === 'true') {
      toast({
        title: "Paiement annulé",
        description: "Votre abonnement n'a pas été activé",
        variant: "destructive",
      });
    }
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour souscrire",
        variant: "destructive"
      });
      return;
    }

    setProcessingPayment(planId);

    try {
      const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS];
      
      if (!priceId) {
        throw new Error('Invalid plan ID');
      }

      toast({
        title: "Redirection vers le paiement",
        description: "Vous allez être redirigé vers la page de paiement sécurisée",
      });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        
        // Refresh subscription after a delay
        setTimeout(() => checkSubscription(), 3000);
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Erreur de paiement",
        description: "Impossible de traiter votre demande d'abonnement",
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      toast({
        title: "Chargement...",
        description: "Redirection vers le portail de gestion",
      });

      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au portail de gestion",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-emerald/20 bg-gradient-to-r from-emerald/10 to-emerald-light/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Trouvez Votre Partenaire Idéal Plus Rapidement
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Débloquez des fonctionnalités premium pour maximiser vos chances de trouver l'amour selon les valeurs islamiques
          </p>
        </CardHeader>
      </Card>

      {/* Current Subscription Status */}
      {subscription?.subscribed && (
        <Card className="border-emerald/20 bg-emerald/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-emerald" />
                <div>
                  <h3 className="font-semibold">Abonnement Actuel</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan Premium actif
                    {subscription.plan_duration && subscription.months_remaining && (
                      <> - {subscription.months_remaining} mois restants</>
                    )}
                    {subscription.subscription_end && (
                      <> - Expire le {new Date(subscription.subscription_end).toLocaleDateString('fr-FR')}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald text-primary-foreground">
                  Actif
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageSubscription}
                >
                  Gérer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-300 hover:shadow-xl ${
              plan.popular ? 'ring-2 ring-emerald transform scale-105 border-emerald' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-emerald text-primary-foreground px-3 py-1">
                  {plan.badge}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Star className="h-6 w-6 text-emerald" />
              </div>
              <div className="text-xs font-medium text-emerald mb-2">{plan.badge}</div>
              <CardTitle className="text-2xl font-bold">Engagement {plan.duration} mois</CardTitle>
              <div className="mt-4">
                <div className="text-4xl font-bold text-emerald">
                  {plan.pricePerMonth.toFixed(2)}€
                </div>
                <div className="text-sm text-muted-foreground">par mois</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Abonnement mensuel récurrent
                </div>
                {plan.discount && (
                  <div className="text-sm text-emerald font-medium mt-2">{plan.discount}</div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={processingPayment === plan.id || subscription.subscribed}
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-emerald to-emerald-light hover:opacity-90'
                    : 'bg-gradient-to-r from-emerald/80 to-emerald-light/80 hover:opacity-90'
                }`}
              >
                {processingPayment === plan.id ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Traitement...
                  </div>
                ) : subscription.subscribed ? (
                  'Déjà abonné'
                ) : (
                  `Choisir ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison Gratuit vs Premium</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Fonctionnalité</th>
                  <th className="text-center p-4">Gratuit</th>
                  <th className="text-center p-4 bg-emerald/5">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">Profils détaillés</td>
                  <td className="text-center p-4">5/jour</td>
                  <td className="text-center p-4 bg-emerald/5 font-medium">Illimités ✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Likes & Mises en relation</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4 bg-emerald/5 font-medium">Illimités ✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Messagerie</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4 bg-emerald/5 font-medium">Complète ✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Supervision familiale</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4 bg-emerald/5 font-medium">Incluse ✓</td>
                </tr>
                <tr>
                  <td className="p-4">Matching avancé</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4 bg-emerald/5 font-medium">Inclus ✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Premium Features Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald" />
            Pourquoi Passer Premium ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-emerald/10 rounded-full flex items-center justify-center mx-auto">
                <Infinity className="h-6 w-6 text-emerald" />
              </div>
              <h3 className="font-semibold">Accès Illimité</h3>
              <p className="text-sm text-muted-foreground">
                Consultez autant de profils que vous le souhaitez
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-emerald/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 text-emerald" />
              </div>
              <h3 className="font-semibold">Likes Illimités</h3>
              <p className="text-sm text-muted-foreground">
                Exprimez votre intérêt sans limite
              </p>
            </div>
            
            <div className="text-center space-y-3">
             <div className="h-12 w-12 bg-emerald/10 rounded-full flex items-center justify-center mx-auto">
               <MessageCircle className="h-6 w-6 text-emerald" />
             </div>
              <h3 className="font-semibold">Messagerie Complète</h3>
              <p className="text-sm text-muted-foreground">
                Discutez avec tous vos matches
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-emerald/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-emerald" />
              </div>
              <h3 className="font-semibold">Supervision Familiale</h3>
              <p className="text-sm text-muted-foreground">
                Impliquez votre famille dans le processus
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonial */}
      <Card className="border-emerald/20 bg-gradient-to-r from-emerald/5 to-emerald-light/5">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex text-emerald">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
          </div>
          <blockquote className="text-lg italic text-foreground mb-4">
            "Grâce au plan Premium, j'ai pu trouver mon époux en seulement 2 mois. 
            Les fonctionnalités illimitées et la supervision familiale ont vraiment fait la différence."
          </blockquote>
          <cite className="text-muted-foreground">- Fatima, utilisatrice Premium</cite>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Questions Fréquentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Comment fonctionnent les paiements mensuels ?</h4>
            <p className="text-sm text-muted-foreground">
              Vous choisissez un engagement de 3, 6 ou 12 mois et payez mensuellement. L'abonnement se renouvelle automatiquement chaque mois jusqu'à la fin de votre engagement, puis s'arrête.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Puis-je annuler mon abonnement ?</h4>
            <p className="text-sm text-muted-foreground">
              Oui, vous pouvez annuler à tout moment via le portail de gestion. L'abonnement restera actif jusqu'à la fin de votre mois en cours.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Les paiements sont-ils sécurisés ?</h4>
            <p className="text-sm text-muted-foreground">
              Absolument. Tous les paiements sont traités de manière sécurisée via Stripe, leader mondial du paiement en ligne.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumSubscription;
