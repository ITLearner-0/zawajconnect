import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  CheckCircle2, 
  Circle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lightbulb,
  Target,
  Clock,
  Sparkles,
  X,
  Play
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetTab: string;
  objective: string;
  tips: string[];
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface InteractiveTutorialProps {
  profile?: any;
  islamicPrefs?: any;
  completionStats: any;
  onNavigateToTab: (tab: string) => void;
}

const InteractiveTutorial = ({ 
  profile, 
  islamicPrefs, 
  completionStats,
  onNavigateToTab 
}: InteractiveTutorialProps) => {
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const { toast } = useToast();

  const currentStep = steps[currentStepIndex];
  const progress = steps.length > 0 
    ? Math.round((steps.filter(s => s.completed).length / steps.length) * 100)
    : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-gold';
      case 'low':
        return 'text-emerald';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Priorité haute</Badge>;
      case 'medium':
        return <Badge className="text-xs bg-gold/20 text-gold border-gold/30">Priorité moyenne</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Priorité basse</Badge>;
      default:
        return null;
    }
  };

  const generateTutorial = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-tutorial', {
        body: {
          profile,
          islamicPrefs,
          completionStats
        }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast({
            title: "Limite atteinte",
            description: "Trop de requêtes. Réessayez dans quelques instants.",
            variant: "destructive"
          });
        } else if (error.message.includes('402')) {
          toast({
            title: "Crédits épuisés",
            description: "Les crédits AI sont épuisés.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      if (data?.steps) {
        setSteps(data.steps);
        setCurrentStepIndex(0);
        setIsActive(true);
        setShowSpotlight(true);
        toast({
          title: "Tutoriel généré !",
          description: `${data.steps.length} étapes personnalisées créées pour vous.`,
        });
      }
    } catch (error) {
      console.error('Error generating tutorial:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le tutoriel.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const completeStep = () => {
    const currentStepData = steps[currentStepIndex];
    if (!currentStepData) return;
    
    const newSteps = [...steps];
    const stepToComplete = newSteps[currentStepIndex];
    if (stepToComplete) {
      stepToComplete.completed = true;
      setSteps(newSteps);
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      toast({
        title: "Étape complétée ! 🎉",
        description: "Passons à la suivante.",
      });
    } else {
      toast({
        title: "Tutoriel terminé ! 🎊",
        description: "Félicitations ! Vous avez complété toutes les étapes.",
      });
      setIsActive(false);
    }
  };

  const goToStepAndNavigate = () => {
    if (currentStep?.targetTab) {
      onNavigateToTab(currentStep.targetTab);
      setShowSpotlight(true);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (!isActive && steps.length === 0) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Tutoriel Interactif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            <h3 className="font-semibold mb-2">Commencez votre parcours guidé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              L'IA va analyser votre profil et créer un tutoriel personnalisé étape par étape pour maximiser vos chances de match.
            </p>
            <Button
              onClick={generateTutorial}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Démarrer le tutoriel
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      {isActive && currentStep && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed bottom-6 left-6 z-50 w-96"
        >
          <Card className="shadow-2xl border-primary/30">
            <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pb-3">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-5 w-5" />
                  Tutoriel Interactif
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsActive(false)}
                  className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Étape {currentStepIndex + 1} sur {steps.length}</span>
                  <span>{progress}% complété</span>
                </div>
                <Progress value={progress} className="h-2 bg-primary-foreground/20" />
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Step Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{currentStep.title}</h3>
                  {getPriorityBadge(currentStep.priority)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentStep.description}
                </p>
              </div>

              {/* Objective */}
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Objectif</h4>
                    <p className="text-sm text-muted-foreground">{currentStep.objective}</p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="h-4 w-4 text-gold" />
                  Conseils pratiques
                </div>
                <ul className="space-y-2">
                  {currentStep.tips.map((tip, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Sparkles className="h-3 w-3 text-gold mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Temps estimé : {currentStep.estimatedTime}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                  disabled={currentStepIndex === 0}
                  className="flex-1"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Précédent
                </Button>
                
                {currentStep.completed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextStep}
                    disabled={currentStepIndex === steps.length - 1}
                    className="flex-1"
                  >
                    Suivant
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={goToStepAndNavigate}
                    className="flex-1 gap-1"
                  >
                    <Play className="h-3 w-3" />
                    Commencer
                  </Button>
                )}
              </div>

              {/* Complete button */}
              {!currentStep.completed && (
                <Button
                  onClick={completeStep}
                  className="w-full gap-2"
                  variant="default"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Marquer comme complétée
                </Button>
              )}

              {/* Steps overview */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStepIndex(index)}
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all ${
                        index === currentStepIndex
                          ? 'bg-primary text-primary-foreground'
                          : step.completed
                          ? 'bg-emerald text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InteractiveTutorial;
