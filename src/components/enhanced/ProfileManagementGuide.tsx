// @ts-nocheck
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Heart,
  Shield,
  Camera,
  Brain,
  CheckCircle,
  ArrowRight,
  Star,
  Lightbulb,
  Users,
  Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: unknown;
  route: string;
  completed: boolean;
  importance: 'high' | 'medium' | 'low';
  benefits: string[];
}

interface ProfileManagementGuideProps {
  completionStats?: {
    overall: number;
    basicInfo: number;
    islamicPrefs: number;
    photos: number;
    compatibility: number;
    privacy: number;
  };
}

const ProfileManagementGuide = ({ completionStats }: ProfileManagementGuideProps) => {
  const navigate = useNavigate();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const steps: GuideStep[] = [
    {
      id: 'wizard',
      title: 'Assistant de Profil Intelligent',
      description:
        'Créez votre profil étape par étape avec notre assistant IA qui respecte les valeurs islamiques.',
      icon: User,
      route: '/profile?tab=wizard',
      completed: (completionStats?.basicInfo || 0) >= 80,
      importance: 'high',
      benefits: [
        'Profil optimisé automatiquement',
        'Suggestions personnalisées',
        'Respect des valeurs islamiques',
        'Amélioration des matches',
      ],
    },
    {
      id: 'photos',
      title: 'Vérification Photos Avancée',
      description:
        'Système de vérification intelligent avec approbation familiale et conformité islamique.',
      icon: Camera,
      route: '/profile?tab=photos',
      completed: (completionStats?.photos || 0) >= 100,
      importance: 'high',
      benefits: [
        'Confiance augmentée de 300%',
        'Approbation familiale automatique',
        'Conformité aux valeurs islamiques',
        'Protection contre les faux profils',
      ],
    },
    {
      id: 'islamic',
      title: 'Préférences Islamiques Détaillées',
      description:
        'Configuration complète de vos valeurs et pratiques islamiques pour des matches parfaits.',
      icon: Heart,
      route: '/profile?tab=islamic',
      completed: (completionStats?.islamicPrefs || 0) >= 80,
      importance: 'high',
      benefits: [
        'Matches plus compatibles religieusement',
        'Préférences détaillées par catégorie',
        'Respect des différentes écoles',
        'Guidance islamique intégrée',
      ],
    },
    {
      id: 'compatibility',
      title: 'Test de Compatibilité IA',
      description:
        'Intelligence artificielle avancée pour analyser votre compatibilité avec des partenaires potentiels.',
      icon: Brain,
      route: '/profile?tab=compatibility',
      completed: (completionStats?.compatibility || 0) >= 70,
      importance: 'medium',
      benefits: [
        'Algorithme IA de matching avancé',
        'Analyse de compatibilité personnalisée',
        "Recommandations d'amélioration",
        'Scores de compatibilité précis',
      ],
    },
    {
      id: 'privacy',
      title: 'Contrôles de Confidentialité Avancés',
      description:
        'Protection complète de vos données avec paramètres islamiques et supervision familiale.',
      icon: Shield,
      route: '/profile?tab=privacy',
      completed: (completionStats?.privacy || 0) >= 70,
      importance: 'medium',
      benefits: [
        'Protection maximale des données',
        'Supervision familiale intégrée',
        'Contrôles de visibilité granulaires',
        'Score de confidentialité en temps réel',
      ],
    },
  ];

  const overallProgress = completionStats?.overall || 0;
  const completedSteps = steps.filter((step) => step.completed).length;

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getImportanceLabel = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'Essentiel';
      case 'medium':
        return 'Important';
      case 'low':
        return 'Recommandé';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Overall Progress */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">Guide du Profil Enhanced</CardTitle>
                <p className="text-muted-foreground">
                  Optimisez votre profil avec notre système avancé
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-emerald to-gold text-primary-foreground">
              {completedSteps}/{steps.length} Complété
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progression Globale</span>
              <span className="text-sm text-muted-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {overallProgress >= 80
                  ? '🎉 Excellent ! Votre profil est optimisé.'
                  : overallProgress >= 60
                    ? '👍 Bon progrès ! Continuez.'
                    : '🚀 Commencez votre transformation !'}
              </span>
              <Button
                onClick={() => navigate('/profile')}
                size="sm"
                className="bg-gradient-to-r from-emerald to-gold text-primary-foreground"
              >
                Accéder au Profil Enhanced
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps Guide */}
      <div className="grid gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isExpanded = expandedStep === step.id;

          return (
            <Card
              key={step.id}
              className={`transition-all duration-300 ${
                step.completed ? 'border-emerald/30 bg-emerald/5' : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-0">
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          step.completed
                            ? 'bg-emerald text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getImportanceColor(step.importance)}`}
                      >
                        {getImportanceLabel(step.importance)}
                      </Badge>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold flex items-center gap-2">
                          <span className="text-muted-foreground">{index + 1}.</span>
                          {step.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {step.completed && (
                            <Badge variant="outline" className="text-emerald border-emerald/30">
                              Terminé
                            </Badge>
                          )}
                          <ArrowRight
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm mb-3">{step.description}</p>

                      {isExpanded && (
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <Star className="h-4 w-4 text-gold" />
                              Bénéfices
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {step.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <div className="h-1.5 w-1.5 bg-emerald rounded-full mt-2 shrink-0" />
                                  <span className="text-muted-foreground">{benefit}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(step.route);
                            }}
                            className="w-full bg-gradient-to-r from-emerald to-emerald-light text-primary-foreground"
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {step.completed ? 'Revoir & Améliorer' : 'Commencer Maintenant'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Next Steps Recommendation */}
      {overallProgress < 100 && (
        <Card className="border-gold/30 bg-gradient-to-r from-gold/5 to-emerald/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-gold" />
              Prochaines Étapes Recommandées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps
                .filter((step) => !step.completed && step.importance === 'high')
                .slice(0, 2)
                .map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <step.icon className="h-5 w-5 text-emerald" />
                      <div>
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(step.route)}
                      className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
                    >
                      Commencer
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {overallProgress >= 80 && (
        <Card className="border-emerald/30 bg-gradient-to-r from-emerald/5 to-gold/5">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-8 w-8 text-gold" />
              <Users className="h-8 w-8 text-emerald" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Félicitations ! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              Votre profil est maintenant optimisé pour des matches de haute qualité. Les
              utilisateurs avec des profils complets reçoivent 5x plus de matches compatibles.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => navigate('/matches')}
                className="bg-gradient-to-r from-emerald to-gold text-primary-foreground"
              >
                <Users className="h-4 w-4 mr-2" />
                Voir Mes Matches
              </Button>
              <Button variant="outline" onClick={() => navigate('/browse')}>
                Découvrir des Profils
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileManagementGuide;
