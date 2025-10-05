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
  currency: string;
  interval: string;
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
}

interface UserSubscription {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

// Map product IDs to plan info
const PRODUCT_MAPPING = {
  'prod_TB8Q6AILWjCstr': { id: 'premium', name: 'Premium', price: 19.99 },
  'prod_TB8QPhRHOsYWAo': { id: 'family_plus', name: 'Famille+', price: 39.99 },
};

const PRICE_IDS = {
  premium: 'price_1SEm9G4GoRjf8T3b9ZUoLuop',
  family_plus: 'price_1SEm9v4GoRjf8T3bXqwW1dg2',
};

const PremiumSubscription = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Gratuit',
      price: 0,
      currency: 'EUR',
      interval: 'mois',
      features: [
        'Profil de base',
        '5 likes par jour',
        'Messages limités',
        'Recherche basique',
        'Support communautaire'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      currency: 'EUR',
      interval: 'mois',
      popular: true,
      features: [
        'Profil vérifié prioritaire',
        'Likes illimités',
        'Messages illimités',
        'Recherche avancée',
        'Voir qui vous a liké',
        'Boost de visibilité',
        'Support prioritaire',
        'Calendrier islamique avancé'
      ]
    },
    {
      id: 'family_plus',
      name: 'Famille+',
      price: 39.99,
      currency: 'EUR',
      interval: 'mois',
      highlighted: true,
      features: [
        'Toutes les fonctionnalités Premium',
        'Supervision familiale complète',
        'Tableaux de bord famille',
        'Coordination multi-comptes',
        'Consultations matrimoniales',
        'Événements exclusifs',
        'Concierge personnel',
        'Garantie de matches'
      ]
    }
  ];

  useEffect(() => {
    if (user) {
      setPlans(subscriptionPlans);
    }
  }, [user]);

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

    if (planId === 'basic') {
      toast({
        title: "Plan gratuit",
        description: "Vous utilisez déjà le plan gratuit",
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

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'premium':
        return <Star className="h-6 w-6 text-gold" />;
      case 'family_plus':
        return <Crown className="h-6 w-6 text-purple-600" />;
      default:
        return <Heart className="h-6 w-6 text-emerald" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'premium':
        return 'border-gold/20 bg-gradient-to-br from-gold/5 to-emerald/5';
      case 'family_plus':
        return 'border-purple-200 bg-gradient-to-br from-purple-50 to-gold-50';
      default:
        return 'border-emerald/20 bg-gradient-to-br from-emerald/5 to-sage/5';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-gold/20 bg-gradient-to-r from-gold/10 to-emerald/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-gold to-gold-light rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gold-dark">
            Trouvez Votre Partenaire Idéal Plus Rapidement
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Débloquez des fonctionnalités premium pour maximiser vos chances de trouver l'amour selon les valeurs islamiques
          </p>
        </CardHeader>
      </Card>

      {/* Current Subscription Status */}
      {subscription?.subscribed && subscription.product_id && (
        <Card className="border-emerald/20 bg-emerald/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-emerald" />
                <div>
                  <h3 className="font-semibold">Abonnement Actuel</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan {PRODUCT_MAPPING[subscription.product_id as keyof typeof PRODUCT_MAPPING]?.name || 'Premium'}
                    {subscription.subscription_end && (
                      <> - Renouvelé le {new Date(subscription.subscription_end).toLocaleDateString('fr-FR')}</>
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
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-300 hover:shadow-xl ${getPlanColor(plan.id)} ${
              plan.highlighted ? 'ring-2 ring-purple-200 transform scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gold text-primary-foreground px-3 py-1">
                  ⭐ Plus Populaire
                </Badge>
              </div>
            )}
            
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white px-3 py-1">
                  👑 Recommandé
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {getPlanIcon(plan.id)}
              </div>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <div className="text-4xl font-bold text-foreground">
                {plan.price === 0 ? (
                  'Gratuit'
                ) : (
                  <>
                    {plan.price}€
                    <span className="text-lg font-normal text-muted-foreground">/{plan.interval}</span>
                  </>
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
                disabled={processingPayment === plan.id}
                className={`w-full ${
                  plan.id === 'basic'
                    ? 'bg-emerald hover:bg-emerald-dark'
                    : plan.id === 'premium'
                    ? 'bg-gradient-to-r from-gold to-gold-light hover:from-gold-dark hover:to-gold text-primary-foreground'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                }`}
              >
                {processingPayment === plan.id ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Traitement...
                  </div>
                ) : plan.id === 'basic' ? (
                  'Plan Actuel'
                ) : (
                  `Choisir ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium Features Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-gold" />
            Pourquoi Passer Premium ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-emerald/10 rounded-full flex items-center justify-center mx-auto">
                <Infinity className="h-6 w-6 text-emerald" />
              </div>
              <h3 className="font-semibold">Likes Illimités</h3>
              <p className="text-sm text-muted-foreground">
                Exprimez votre intérêt sans limite pour trouver votre partenaire idéal
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto">
                <Eye className="h-6 w-6 text-gold" />
              </div>
              <h3 className="font-semibold">Qui Vous a Liké</h3>
              <p className="text-sm text-muted-foreground">
                Découvrez instantanément qui s'intéresse à vous
              </p>
            </div>
            
            <div className="text-center space-y-3">
             <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
               <MessageCircle className="h-6 w-6 text-secondary" />
             </div>
              <h3 className="font-semibold">Messages Prioritaires</h3>
              <p className="text-sm text-muted-foreground">
                Vos messages arrivent en premier dans la boîte de réception
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-emerald/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-emerald" />
              </div>
              <h3 className="font-semibold">Supervision Familiale</h3>
              <p className="text-sm text-muted-foreground">
                Outils avancés pour impliquer votre famille dans le processus
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonial */}
      <Card className="border-emerald/20 bg-gradient-to-r from-emerald/5 to-gold/5">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
          </div>
          <blockquote className="text-lg italic text-foreground mb-4">
            "Grâce au plan Premium, j'ai pu trouver mon époux en seulement 2 mois. 
            La supervision familiale et les fonctionnalités avancées ont vraiment fait la différence."
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
            <h4 className="font-semibold mb-2">Puis-je annuler mon abonnement à tout moment ?</h4>
            <p className="text-sm text-muted-foreground">
              Oui, vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès aux fonctionnalités premium jusqu'à la fin de votre période de facturation.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Les paiements sont-ils sécurisés ?</h4>
            <p className="text-sm text-muted-foreground">
              Absolument. Tous les paiements sont traités de manière sécurisée via Stripe, leader mondial du paiement en ligne.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Que se passe-t-il si je ne trouve pas de partenaire ?</h4>
            <p className="text-sm text-muted-foreground">
              Avec le plan Famille+, nous offrons une garantie de matches qualifiés. Si vous ne trouvez pas de partenaire compatible en 6 mois, nous vous remboursons.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumSubscription;