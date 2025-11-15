import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Target, Star, Users, Shield, Sparkles, Trophy, TrendingUp } from 'lucide-react';

const AuthPreview: React.FC = () => {
  const features = [
    {
      icon: <Heart className="w-5 h-5 text-emerald" />,
      title: 'Test de Compatibilité',
      description: 'Découvrez votre profil unique',
      highlight: 'Personnalisé',
    },
    {
      icon: <Target className="w-5 h-5 text-gold" />,
      title: 'Insights Détaillés',
      description: 'Analyses approfondies et conseils',
      highlight: 'IA Avancée',
    },
    {
      icon: <Users className="w-5 h-5 text-primary" />,
      title: 'Matches Compatibles',
      description: 'Trouvez votre âme sœur idéale',
      highlight: 'Algorithmique',
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-dark" />,
      title: 'Sécurité Garantie',
      description: 'Environnement sûr et respectueux',
      highlight: 'Vérifié',
    },
  ];

  const stats = [
    { label: 'Utilisateurs actifs', value: '10,000+', icon: <Users className="w-4 h-4" /> },
    { label: 'Mariages réussis', value: '500+', icon: <Heart className="w-4 h-4" /> },
    { label: 'Taux de compatibilité', value: '89%', icon: <Star className="w-4 h-4" /> },
    { label: 'Satisfaction', value: '4.8/5', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Preview */}
      <Card className="bg-gradient-to-br from-emerald/10 via-gold/5 to-primary/10 border-emerald/20 animate-fade-in">
        <CardHeader className="text-center pb-4">
          <div className="animate-float mb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl text-foreground mb-2">
            Découvrez Votre Compatibilité Parfaite
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Plateforme de rencontres islamiques avec IA avancée pour des matches authentiques
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-3 bg-background/50 rounded-lg animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-center space-x-1 text-emerald mb-1">
                  {stat.icon}
                  <span className="font-bold text-lg">{stat.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Ce qui vous attend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="p-2 bg-primary/10 rounded-lg">{feature.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium">{feature.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Stories Preview */}
      <Card
        className="bg-gradient-to-r from-emerald/5 to-gold/5 animate-slide-up"
        style={{ animationDelay: '400ms' }}
      >
        <CardContent className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-emerald" />
              <span className="text-sm font-medium text-emerald">Témoignages</span>
              <Heart className="w-4 h-4 text-emerald" />
            </div>
            <blockquote className="text-sm italic text-muted-foreground mb-2">
              "Grâce à ZawajConnect, j'ai trouvé mon âme sœur. Le test de compatibilité était très
              précis !"
            </blockquote>
            <div className="flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-gold fill-current" />
              ))}
              <span className="text-xs text-muted-foreground ml-2">Sarah & Ahmed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Teaser */}
      <Card className="border-dashed border-2 border-primary/30 animate-pulse-gentle">
        <CardContent className="p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
          <h3 className="text-sm font-medium mb-1">Votre Parcours Personnel</h3>
          <p className="text-xs text-muted-foreground">
            Suivez votre progression, débloquez des récompenses et trouvez l'amour
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPreview;
