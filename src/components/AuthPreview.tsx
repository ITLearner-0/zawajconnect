import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Target, 
  Star, 
  Users, 
  Shield,
  Sparkles,
  Trophy,
  TrendingUp
} from 'lucide-react';

const AuthPreview: React.FC = () => {
  const features = [
    {
      icon: <Heart className="w-5 h-5 text-emerald" />,
      title: "Test de Compatibilité",
      description: "Découvrez votre profil unique",
      highlight: "Personnalisé"
    },
    {
      icon: <Target className="w-5 h-5 text-gold" />,
      title: "Insights Détaillés",
      description: "Analyses approfondies et conseils",
      highlight: "IA Avancée"
    },
    {
      icon: <Users className="w-5 h-5 text-primary" />,
      title: "Matches Compatibles",
      description: "Trouvez votre âme sœur idéale",
      highlight: "Algorithmique"
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-dark" />,
      title: "Sécurité Garantie",
      description: "Environnement sûr et respectueux",
      highlight: "Vérifié"
    }
  ];

  const stats = [
    { label: "Utilisateurs actifs", value: "10,000+", icon: <Users className="w-4 h-4" /> },
    { label: "Mariages réussis", value: "500+", icon: <Heart className="w-4 h-4" /> },
    { label: "Taux de compatibilité", value: "89%", icon: <Star className="w-4 h-4" /> },
    { label: "Satisfaction", value: "4.8/5", icon: <Trophy className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Hero Preview */}
      <Card className="bg-gradient-to-br from-emerald/10 via-gold/5 to-primary/10 border-emerald/20 animate-fade-in">
        <CardHeader className="text-center pb-3 lg:pb-4 space-y-3">
          <div className="animate-float">
            <div className="mx-auto w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center shadow-gold">
              <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-lg lg:text-xl text-foreground leading-tight">
              Découvrez Votre Compatibilité Parfaite
            </CardTitle>
            <p className="text-muted-foreground text-xs lg:text-sm mt-2">
              Plateforme de rencontres islamiques avec IA avancée pour des matches authentiques
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-2 lg:p-3 bg-background/50 rounded-lg animate-scale-in backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-center space-x-1 text-emerald mb-1">
                  {stat.icon}
                  <span className="font-bold text-base lg:text-lg">{stat.value}</span>
                </div>
                <p className="text-[10px] lg:text-xs text-muted-foreground leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base lg:text-lg flex items-center space-x-2">
            <Target className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
            <span>Ce qui vous attend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 lg:space-y-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-2 lg:p-3 rounded-lg hover:bg-muted/50 transition-smooth animate-fade-in"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1 flex-wrap">
                    <h4 className="text-xs lg:text-sm font-medium">{feature.title}</h4>
                    <Badge variant="secondary" className="text-[10px] lg:text-xs">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <p className="text-[10px] lg:text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Stories Preview */}
      <Card className="bg-gradient-to-r from-emerald/5 to-gold/5 animate-slide-up border-emerald/10" style={{ animationDelay: '400ms' }}>
        <CardContent className="p-3 lg:p-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="w-3 h-3 lg:w-4 lg:h-4 text-emerald" />
              <span className="text-xs lg:text-sm font-medium text-emerald">Témoignages</span>
              <Heart className="w-3 h-3 lg:w-4 lg:h-4 text-emerald" />
            </div>
            <blockquote className="text-xs lg:text-sm italic text-muted-foreground mb-2 leading-relaxed">
              "Grâce à ZawajConnect, j'ai trouvé mon âme sœur. Le test de compatibilité était très précis !"
            </blockquote>
            <div className="flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-gold fill-current" />
              ))}
              <span className="text-[10px] lg:text-xs text-muted-foreground ml-2">Sarah & Ahmed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Teaser */}
      <Card className="border-dashed border-2 border-primary/30 animate-pulse-gentle bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-3 lg:p-4 text-center">
          <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 text-primary" />
          <h3 className="text-xs lg:text-sm font-medium mb-1">Votre Parcours Personnel</h3>
          <p className="text-[10px] lg:text-xs text-muted-foreground leading-relaxed">
            Suivez votre progression, débloquez des récompenses et trouvez l'amour
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPreview;