
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Subscription = () => {
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end,
    loading, 
    createCheckoutSession, 
    openCustomerPortal,
    isPremium,
    isVip
  } = useSubscription();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-rose-800 dark:text-rose-200 mb-4">
            Choisissez Votre Plan
          </h1>
          <p className="text-lg text-rose-600 dark:text-rose-300 max-w-2xl mx-auto">
            Trouvez votre moitié selon les principes islamiques avec nos plans adaptés à vos besoins
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscribed && (
          <div className="mb-8 text-center">
            <Card className="max-w-md mx-auto bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900 dark:to-pink-900 border-rose-200 dark:border-rose-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-rose-800 dark:text-rose-200">
                  <Crown className="h-5 w-5" />
                  Abonnement Actuel: {subscription_tier}
                </CardTitle>
                {subscription_end && (
                  <CardDescription className="text-rose-600 dark:text-rose-300">
                    Expire le {formatDate(subscription_end)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={openCustomerPortal}
                  disabled={loading}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Gérer Mon Abonnement
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plan Gratuit */}
          <Card className="relative border-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Gratuit
              </CardTitle>
              <CardDescription>
                Commencez votre recherche
              </CardDescription>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                0€<span className="text-sm font-normal">/mois</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Profil de base</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>5 correspondances par jour</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Messages limités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Recherche de base</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth">
                  Commencer Gratuitement
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Plan Premium */}
          <Card className={`relative border-2 ${isPremium ? 'border-rose-500 bg-rose-50 dark:bg-rose-950' : 'border-rose-300'}`}>
            {isPremium && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-rose-500 text-white">
                Plan Actuel
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <Star className="h-6 w-6" />
                Premium
              </CardTitle>
              <CardDescription>
                Recherche avancée et messages illimités
              </CardDescription>
              <div className="text-3xl font-bold text-rose-800 dark:text-rose-200">
                9,99€<span className="text-sm font-normal">/mois</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Tout du plan gratuit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Correspondances illimitées</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Messages illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Filtres de recherche avancés</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Voir qui a visité votre profil</span>
                </li>
              </ul>
              <Button 
                onClick={() => createCheckoutSession('premium')}
                disabled={loading || isPremium}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isPremium ? 'Plan Actuel' : 'Choisir Premium'}
              </Button>
            </CardContent>
          </Card>

          {/* Plan VIP */}
          <Card className={`relative border-2 ${isVip ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border-purple-300'}`}>
            {isVip && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white">
                Plan Actuel
              </Badge>
            )}
            <Badge className="absolute -top-2 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              Recommandé
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                <Crown className="h-6 w-6" />
                VIP
              </CardTitle>
              <CardDescription>
                Accès complet + conseiller matrimonial
              </CardDescription>
              <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">
                19,99€<span className="text-sm font-normal">/mois</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Tout du plan Premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Profil vérifié prioritaire</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Conseiller matrimonial dédié</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Visibilité maximale du profil</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Support prioritaire</span>
                </li>
              </ul>
              <Button 
                onClick={() => createCheckoutSession('vip')}
                disabled={loading || isVip}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isVip ? 'Plan Actuel' : 'Choisir VIP'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-rose-800 dark:text-rose-200 mb-8">
            Comparaison des Fonctionnalités
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-rose-50 dark:bg-rose-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-rose-800 dark:text-rose-200 font-semibold">
                      Fonctionnalités
                    </th>
                    <th className="px-6 py-4 text-center text-gray-600 dark:text-gray-300 font-semibold">
                      Gratuit
                    </th>
                    <th className="px-6 py-4 text-center text-rose-600 dark:text-rose-300 font-semibold">
                      Premium
                    </th>
                    <th className="px-6 py-4 text-center text-purple-600 dark:text-purple-300 font-semibold">
                      VIP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">Correspondances par jour</td>
                    <td className="px-6 py-4 text-center">5</td>
                    <td className="px-6 py-4 text-center">Illimitées</td>
                    <td className="px-6 py-4 text-center">Illimitées</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">Messages</td>
                    <td className="px-6 py-4 text-center">Limités</td>
                    <td className="px-6 py-4 text-center">Illimités</td>
                    <td className="px-6 py-4 text-center">Illimités</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">Filtres avancés</td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">Profil vérifié</td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">Conseiller matrimonial</td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
