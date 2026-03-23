import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { Check, Crown, Star, Zap, Loader2 } from 'lucide-react';
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
    isVip,
  } = useSubscription();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePremiumClick = () => {
    console.log('Premium button clicked');
    createCheckoutSession('premium');
  };

  const handleVipClick = () => {
    console.log('VIP button clicked');
    createCheckoutSession('vip');
  };

  const handleManageSubscription = () => {
    console.log('Manage subscription clicked');
    openCustomerPortal();
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            Choisissez Votre Plan
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Trouvez votre moitié selon les principes islamiques avec nos plans adaptés à vos besoins
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscribed && (
          <div className="mb-8 text-center">
            <Card className="max-w-md mx-auto" style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)' }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2" style={{ color: 'var(--color-primary)' }}>
                  <Crown className="h-5 w-5" />
                  Abonnement Actuel: {subscription_tier}
                </CardTitle>
                {subscription_end && (
                  <CardDescription style={{ color: 'var(--color-text-secondary)' }}>
                    Expire le {formatDate(subscription_end)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="w-full"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Chargement...
                    </>
                  ) : (
                    'Gérer Mon Abonnement'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plan Gratuit */}
          <Card className="relative" style={{ backgroundColor: 'var(--color-bg-card)', border: '2px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Gratuit
              </CardTitle>
              <CardDescription style={{ color: 'var(--color-text-secondary)' }}>Commencez votre recherche</CardDescription>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                0€<span className="text-sm font-normal">/mois</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Profil de base</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Navigation illimitée des profils</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Messages limités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Recherche de base</span>
                </li>
                <li className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="text-xs">Likes/matches Premium uniquement</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)', borderRadius: 'var(--radius-md)' }}>
                <Link to="/auth">Commencer Gratuitement</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Plan Premium */}
          <Card
            className="relative"
            style={{
              backgroundColor: isPremium ? 'var(--color-primary-light)' : 'var(--color-bg-card)',
              border: isPremium ? '2px solid var(--color-primary)' : '2px solid var(--color-primary-border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            {isPremium && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
                Plan Actuel
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <Star className="h-6 w-6" />
                Premium
              </CardTitle>
              <CardDescription style={{ color: 'var(--color-text-secondary)' }}>Recherche avancée et messages illimités</CardDescription>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                9,99€<span className="text-sm font-normal">/mois</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Tout du plan gratuit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Likes et matches illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Messages illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Filtres de recherche avancés</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Voir qui a visité votre profil</span>
                </li>
              </ul>
              <Button
                onClick={handlePremiumClick}
                disabled={loading || isPremium}
                className="w-full"
                style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Chargement...
                  </>
                ) : isPremium ? (
                  'Plan Actuel'
                ) : (
                  'Choisir Premium'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Plan VIP */}
          <Card
            className="relative"
            style={{
              backgroundColor: isVip ? 'var(--color-accent-light)' : 'var(--color-bg-card)',
              border: isVip ? '2px solid var(--color-accent)' : '2px solid var(--color-accent-border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            {isVip && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2" style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}>
                Plan Actuel
              </Badge>
            )}
            <Badge className="absolute -top-2 right-4" style={{ backgroundColor: 'var(--color-warning)', color: '#fff' }}>
              Recommandé
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
                <Crown className="h-6 w-6" />
                VIP
              </CardTitle>
              <CardDescription style={{ color: 'var(--color-text-secondary)' }}>Accès complet + conseiller matrimonial</CardDescription>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                19,99€<span className="text-sm font-normal">/mois</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Tout du plan Premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Profil vérifié prioritaire</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Conseiller matrimonial dédié</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Visibilité maximale du profil</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>Support prioritaire</span>
                </li>
              </ul>
              <Button
                onClick={handleVipClick}
                disabled={loading || isVip}
                className="w-full"
                style={{ backgroundColor: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Chargement...
                  </>
                ) : isVip ? (
                  'Plan Actuel'
                ) : (
                  'Choisir VIP'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-primary)' }}>
            Comparaison des Fonctionnalités
          </h2>
          <div className="overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Fonctionnalités
                    </th>
                    <th className="px-6 py-4 text-center font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                      Gratuit
                    </th>
                    <th className="px-6 py-4 text-center font-semibold" style={{ color: 'var(--color-primary)' }}>
                      Premium
                    </th>
                    <th className="px-6 py-4 text-center font-semibold" style={{ color: 'var(--color-accent)' }}>
                      VIP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="px-6 py-4" style={{ color: 'var(--color-text-primary)' }}>
                      Correspondances par jour
                    </td>
                    <td className="px-6 py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>5</td>
                    <td className="px-6 py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>Illimitées</td>
                    <td className="px-6 py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>Illimitées</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="px-6 py-4" style={{ color: 'var(--color-text-primary)' }}>Messages</td>
                    <td className="px-6 py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>Limités</td>
                    <td className="px-6 py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>Illimités</td>
                    <td className="px-6 py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>Illimités</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="px-6 py-4" style={{ color: 'var(--color-text-primary)' }}>Filtres avancés</td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="px-6 py-4" style={{ color: 'var(--color-text-primary)' }}>Profil vérifié</td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">❌</td>
                    <td className="px-6 py-4 text-center">✅</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="px-6 py-4" style={{ color: 'var(--color-text-primary)' }}>
                      Conseiller matrimonial
                    </td>
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
