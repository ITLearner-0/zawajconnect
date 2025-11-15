import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Star, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SubscriptionStatus = () => {
  const { subscribed, subscription_tier, isPremium, isVip, openCustomerPortal } = useSubscription();
  const location = useLocation();
  const isOnSubscriptionPage = location.pathname === '/subscription';

  if (!subscribed) {
    return (
      <Card className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900 dark:to-pink-900 border-rose-200 dark:border-rose-700">
        <CardHeader>
          <CardTitle className="text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Débloquez Toutes les Fonctionnalités
          </CardTitle>
          <CardDescription className="text-rose-600 dark:text-rose-300">
            Accédez à des fonctionnalités premium pour trouver votre moitié plus facilement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOnSubscriptionPage ? (
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white"
            >
              Voir les Plans Premium
            </Button>
          ) : (
            <Button asChild className="w-full bg-rose-600 hover:bg-rose-700 text-white">
              <Link to="/subscription">Voir les Plans Premium</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`${isPremium ? 'bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900 dark:to-pink-900' : 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900'} border-2 ${isPremium ? 'border-rose-300' : 'border-purple-300'}`}
    >
      <CardHeader>
        <CardTitle
          className={`${isPremium ? 'text-rose-800 dark:text-rose-200' : 'text-purple-800 dark:text-purple-200'} flex items-center gap-2`}
        >
          {isPremium ? <Star className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
          Membre {subscription_tier}
          <Badge className={`${isPremium ? 'bg-rose-500' : 'bg-purple-500'} text-white`}>
            Actif
          </Badge>
        </CardTitle>
        <CardDescription
          className={`${isPremium ? 'text-rose-600 dark:text-rose-300' : 'text-purple-600 dark:text-purple-300'}`}
        >
          {isPremium
            ? 'Profitez de vos fonctionnalités Premium'
            : 'Profitez de votre accès VIP complet'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {isOnSubscriptionPage ? (
            <Button onClick={openCustomerPortal} variant="outline" className="flex-1">
              Gérer l'Abonnement
            </Button>
          ) : (
            <Button asChild variant="outline" className="flex-1">
              <Link to="/subscription">Gérer l'Abonnement</Link>
            </Button>
          )}
          {isPremium && !isOnSubscriptionPage && (
            <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/subscription">Passer au VIP</Link>
            </Button>
          )}
          {isPremium && isOnSubscriptionPage && (
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Passer au VIP
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
