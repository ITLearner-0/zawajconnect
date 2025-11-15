import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompatibility, type UseCompatibilityReturn } from '@/hooks/useCompatibility';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';
import CompatibilityQuestionnaire from '@/components/CompatibilityQuestionnaire';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  TrendingUp,
  Users,
  Star,
  Target,
  BarChart3,
  CheckCircle,
  Clock,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

interface CompatibilityMatch {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  compatibilityScore: number;
  matchingAreas: string[];
  differences: string[];
}

interface CompatibilityInsight {
  category: string;
  strength: number;
  description: string;
  recommendations: string[];
}

interface CompatibilityAssessmentProps {
  onComplete?: () => void;
  embedded?: boolean;
}

const CompatibilityAssessment = ({
  onComplete,
  embedded = false,
}: CompatibilityAssessmentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { stats, responses, loading, refreshData }: UseCompatibilityReturn = useCompatibility();
  const [compatibilityInsights, setCompatibilityInsights] = useState<CompatibilityInsight[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<CompatibilityMatch[]>([]);
  const [activeTab, setActiveTab] = useState('questionnaire');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (stats.completionPercentage > 50) {
      generateCompatibilityInsights();
    }
  }, [stats]);

  const generateCompatibilityInsights = async (): Promise<void> => {
    if (!responses.length) return;

    setAnalyzing(true);
    try {
      // Simulate AI analysis of compatibility responses
      const insights: CompatibilityInsight[] = [
        {
          category: 'Valeurs Religieuses',
          strength: 85,
          description:
            'Vous avez des valeurs religieuses bien définies qui correspondent à la plupart des profils islamiques.',
          recommendations: [
            'Recherchez des partenaires avec des pratiques religieuses similaires',
            'Mettez en avant votre engagement religieux dans votre profil',
          ],
        },
        {
          category: 'Style de Vie',
          strength: 70,
          description: 'Votre style de vie est équilibré entre tradition et modernité.',
          recommendations: [
            'Soyez ouvert aux discussions sur les attentes de style de vie',
            'Clarifiez vos priorités entre carrière et famille',
          ],
        },
        {
          category: 'Objectifs Familiaux',
          strength: 90,
          description:
            'Vous avez des objectifs familiaux clairs et bien alignés avec les valeurs islamiques.',
          recommendations: [
            'Discutez ouvertement de vos plans familiaux',
            'Recherchez des partenaires avec des objectifs similaires',
          ],
        },
      ];

      setCompatibilityInsights(insights);
    } catch (error: unknown) {
      console.error('Error generating insights:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getCompatibilityLevel = (score: number) => {
    if (score >= 80)
      return { level: 'Excellente', color: 'text-emerald', bgColor: 'bg-emerald/10' };
    if (score >= 60) return { level: 'Bonne', color: 'text-gold', bgColor: 'bg-gold/10' };
    if (score >= 40)
      return { level: 'Moyenne', color: 'text-orange-500', bgColor: 'bg-orange-100' };
    return { level: 'Faible', color: 'text-red-500', bgColor: 'bg-red-100' };
  };

  const handleQuestionnaireComplete = (): void => {
    refreshData();
    generateCompatibilityInsights();
    toast({
      title: 'Analyse terminée',
      description: 'Votre profil de compatibilité a été mis à jour',
    });

    if (onComplete) {
      onComplete();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de l'évaluation de compatibilité...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={
        embedded
          ? 'space-y-6'
          : 'min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4'
      }
    >
      <div className={`container mx-auto ${embedded ? 'max-w-full' : 'max-w-6xl'}`}>
        {/* Header */}
        <Card className={embedded ? '' : 'shadow-lg mb-6'}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">Évaluation de Compatibilité</CardTitle>
            <p className="text-muted-foreground">
              Découvrez votre profil de compatibilité et améliorez vos chances de trouver le
              partenaire idéal
            </p>

            {/* Overall Progress */}
            <div className="space-y-2 mt-6">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald" />
                  Progression globale
                </span>
                <span>
                  {stats.answeredQuestions}/{stats.totalQuestions} questions
                </span>
              </div>
              <Progress value={stats.completionPercentage} className="w-full" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  {Math.round(stats.completionPercentage)}% complété
                </span>
                {stats.lastUpdated && (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Mis à jour {new Date(stats.lastUpdated).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <ResponsiveTabsList tabCount={4}>
            <TabsTrigger value="questionnaire" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Questionnaire
            </TabsTrigger>
            <TabsTrigger value="insights" disabled={stats.completionPercentage < 50}>
              <Lightbulb className="h-4 w-4" />
              Analyses
            </TabsTrigger>
            <TabsTrigger value="compatibility" disabled={stats.completionPercentage < 70}>
              <TrendingUp className="h-4 w-4" />
              Compatibilité
            </TabsTrigger>
            <TabsTrigger value="recommendations" disabled={stats.completionPercentage < 70}>
              <Target className="h-4 w-4" />
              Recommandations
            </TabsTrigger>
          </ResponsiveTabsList>

          <TabsContent value="questionnaire" className="space-y-0">
            <CompatibilityQuestionnaire onComplete={handleQuestionnaireComplete} embedded={true} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compatibility Score Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald" />
                    Aperçu de Compatibilité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyzing ? (
                    <div className="text-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Analyse en cours...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {compatibilityInsights.map((insight, index) => {
                        const compatibility = getCompatibilityLevel(insight.strength);
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{insight.category}</span>
                              <Badge className={compatibility.bgColor + ' ' + compatibility.color}>
                                {insight.strength}%
                              </Badge>
                            </div>
                            <Progress value={insight.strength} className="h-2" />
                            <p className="text-xs text-muted-foreground">{insight.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Key Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-gold" />
                    Points Forts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {compatibilityInsights
                      .filter((insight) => insight.strength >= 70)
                      .map((insight, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-emerald rounded-full mt-2"></div>
                          <div>
                            <h4 className="font-medium text-sm">{insight.category}</h4>
                            <p className="text-xs text-muted-foreground">{insight.description}</p>
                          </div>
                        </div>
                      ))}
                    {compatibilityInsights.filter((insight) => insight.strength >= 70).length ===
                      0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Complétez plus de questions pour voir vos points forts
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Insights */}
            <div className="grid grid-cols-1 gap-6">
              {compatibilityInsights.map((insight, index) => (
                <Card key={index} className="border-l-4 border-l-emerald/30">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg">{insight.category}</h3>
                      <Badge variant={insight.strength >= 70 ? 'default' : 'secondary'}>
                        {insight.strength}% compatible
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{insight.description}</p>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Recommandations :</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, recIndex) => (
                          <li
                            key={recIndex}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <ArrowRight className="h-3 w-3 mt-0.5 text-emerald shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compatibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald" />
                  Potentiels Partenaires Compatibles
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Basé sur votre profil de compatibilité actuel
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Fonctionnalité de matching en développement
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complétez votre profil pour débloquer cette fonctionnalité
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-gold" />
                  Recommandations Personnalisées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {compatibilityInsights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-emerald/5 to-gold/5 rounded-lg border border-emerald/10"
                    >
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-emerald" />
                        {insight.category}
                      </h3>
                      <div className="space-y-2">
                        {insight.recommendations.map((rec, recIndex) => (
                          <div key={recIndex} className="flex items-start gap-3">
                            <div className="h-1.5 w-1.5 bg-emerald rounded-full mt-2"></div>
                            <p className="text-sm text-muted-foreground">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        {!embedded && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Prêt à continuer ?</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.completionPercentage < 100
                      ? `Complétez les ${stats.totalQuestions - stats.answeredQuestions} questions restantes`
                      : 'Votre profil est complet ! Explorez vos matches.'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {stats.completionPercentage < 100 && (
                    <Button onClick={() => setActiveTab('questionnaire')}>
                      Continuer le Questionnaire
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = '/matches')}
                    disabled={stats.completionPercentage < 70}
                  >
                    Voir les Matches
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompatibilityAssessment;
