import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Shield, Heart, MessageCircle, Crown } from 'lucide-react';

const StatusOverview = () => {
  const completedFeatures = [
    {
      category: "Système d'Authentification",
      icon: <Shield className="h-5 w-5 text-emerald" />,
      features: [
        'Inscription/Connexion avec Supabase Auth',
        'Gestion des rôles utilisateur (User, Wali, Admin)',
        'Protection des routes selon les rôles',
        'Vérification de profil',
      ],
    },
    {
      category: 'Supervision Familiale',
      icon: <Users className="h-5 w-5 text-gold" />,
      features: [
        'Dashboard Wali complet avec métriques',
        "Système d'invitation familiale",
        'Approbation des matches par la famille',
        'Notifications en temps réel pour la famille',
        'Supervision des conversations',
        "Portail d'accès famille dédié",
      ],
    },
    {
      category: 'Système de Matching',
      icon: <Heart className="h-5 w-5 text-destructive" />,
      features: [
        'Algorithme de compatibilité islamique',
        'Test de compatibilité avec questions',
        'Insights et analyses de compatibilité',
        'Score de compatibilité en temps réel',
        'Préférences religieuses détaillées',
      ],
    },
    {
      category: 'Modération Islamique',
      icon: <MessageCircle className="h-5 w-5 text-primary" />,
      features: [
        'Modération AI basée sur les valeurs islamiques',
        "Suggestions d'amélioration des messages",
        'Blocage automatique de contenu inapproprié',
        'Notifications famille pour contenu critique',
        'Règles de modération configurables',
      ],
    },
    {
      category: 'Interface Utilisateur',
      icon: <Crown className="h-5 w-5 text-gold" />,
      features: [
        'Design system cohérent avec couleurs islamiques',
        'Interface mobile responsive',
        'Composants UI réutilisables (shadcn)',
        'Animations et transitions fluides',
        'Mode sombre/clair supporté',
        'Navigation intuitive',
      ],
    },
  ];

  const technicalAchievements = [
    'Architecture React + TypeScript + Vite',
    'Backend Supabase avec RLS policies sécurisées',
    'Edge Functions pour logique métier complexe',
    'Real-time avec Supabase Realtime',
    'Système de design avec Tailwind CSS',
    'Hooks React personnalisés réutilisables',
    "Gestion d'état optimisée",
    'Tests de modération automatisés',
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card className="border-emerald/20 bg-gradient-to-r from-emerald/10 to-gold/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-emerald-dark">
            ZawajConnect - Statut du Projet
          </CardTitle>
          <p className="text-muted-foreground">
            Plateforme de rencontres matrimoniales islamiques avec supervision familiale complète
          </p>
        </CardHeader>
      </Card>

      {/* Feature Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {completedFeatures.map((category, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.icon}
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Technical Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Réalisations Techniques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {technicalAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald flex-shrink-0" />
                <span className="text-sm">{achievement}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="border-gold/20 bg-gradient-to-r from-gold/5 to-emerald/5">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Badge className="bg-emerald text-primary-foreground text-sm px-3 py-1">
                ✅ Système Complet
              </Badge>
              <Badge className="bg-gold text-primary-foreground text-sm px-3 py-1">
                🚀 Prêt pour Production
              </Badge>
            </div>

            <p className="text-muted-foreground max-w-2xl mx-auto">
              Le système ZawajConnect est maintenant entièrement fonctionnel avec toutes les
              fonctionnalités essentielles d'une plateforme matrimoniale islamique moderne, incluant
              la supervision familiale, la modération basée sur les valeurs islamiques, et un
              système de compatibilité avancé.
            </p>

            <div className="text-sm text-muted-foreground">
              <p>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusOverview;
