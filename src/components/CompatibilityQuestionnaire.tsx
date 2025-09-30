import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuestionnaireState } from '@/hooks/useQuestionnaireState';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { useEmergencyBackup } from '@/hooks/useEmergencyBackup';
import { Heart, Users, Home, Activity, Baby, Handshake, User, Coins, Brain, AlertTriangle } from 'lucide-react';

interface Question {
  id: string;
  question_key: string;
  question_text: string;
  category: string;
  options: string[];
  weight: number;
}

interface UserResponse {
  question_key: string;
  response_value: string;
}

interface CompatibilityQuestionnaireProps {
  onComplete?: () => void;
  embedded?: boolean;
}

const categoryConfig = {
  religious: { title: 'Valeurs Religieuses', icon: Heart, color: 'text-emerald' },
  lifestyle: { title: 'Style de Vie', icon: Activity, color: 'text-blue-600' },
  health: { title: 'Santé & Bien-être', icon: Activity, color: 'text-green-600' },
  background: { title: 'Contexte Personnel', icon: User, color: 'text-purple-600' },
  habits: { title: 'Habitudes Quotidiennes', icon: Home, color: 'text-orange-600' },
  physical: { title: 'Aspects Physiques', icon: User, color: 'text-pink-600' },
  preferences: { title: 'Préférences Partenaire', icon: Heart, color: 'text-rose-600' },
  intimacy: { title: 'Intimité & Relations', icon: Heart, color: 'text-red-600' },
  children: { title: 'Enfants & Famille', icon: Baby, color: 'text-cyan-600' },
  relationship: { title: 'Dynamiques Relationnelles', icon: Handshake, color: 'text-indigo-600' },
  family: { title: 'Relations Familiales', icon: Users, color: 'text-teal-600' },
  financial: { title: 'Aspects Financiers', icon: Coins, color: 'text-yellow-600' },
  personality: { title: 'Personnalité', icon: Brain, color: 'text-violet-600' },
  economic_autonomy: { title: 'Autonomie Économique', icon: Coins, color: 'text-amber-600' },
  domestic_responsibilities: { title: 'Responsabilités Domestiques', icon: Home, color: 'text-orange-500' },
  decision_making: { title: 'Prise de Décision', icon: Brain, color: 'text-purple-500' },
  career_family: { title: 'Carrière vs Famille', icon: Activity, color: 'text-blue-500' },
  marriage_vision: { title: 'Vision du Mariage', icon: Heart, color: 'text-pink-500' },
  intimacy_consent: { title: 'Intimité & Consentement', icon: Handshake, color: 'text-red-500' }
};

const CompatibilityQuestionnaire = ({ onComplete, embedded = false }: CompatibilityQuestionnaireProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const {
    responses,
    updateResponse,
    saveToDatabase,
    loadFromDatabase,
    saving,
    hasUnsavedChanges
  } = useQuestionnaireState({
    storageKey: 'compatibility_responses',
    autoSaveDelay: 2000 // Reduced to 2 seconds for faster saves
  });

  const { isSessionNearExpiry } = useSessionMonitor();
  
  // Emergency backup system
  const { saveEmergencyBackup, restoreEmergencyBackup } = useEmergencyBackup();

  // Auto-save emergency backup every time responses change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      saveEmergencyBackup('compatibility', responses);
    }
  }, [responses, saveEmergencyBackup]);

  useEffect(() => {
    if (user) {
      fetchQuestionsAndResponses();
    }
  }, [user]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Vous avez des réponses non sauvegardées. Êtes-vous sûr de vouloir quitter?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchQuestionsAndResponses = async () => {
    try {
      // Check if user is authenticated first
      if (!user) {
        toast({
          title: "Authentification requise",
          description: "Vous devez être connecté pour accéder au questionnaire.",
          variant: "destructive"
        });
        return;
      }

      // Simple auth check without complex validation
      if (!user) {
        toast({
          title: "Authentification requise",
          description: "Veuillez vous connecter pour accéder au questionnaire.",
          variant: "destructive"
        });
        window.location.href = '/auth?redirect=/compatibility-test';
        return;
      }
      
      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('compatibility_questions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('weight', { ascending: false });

      if (questionsError) {
        throw questionsError;
      }

      if (!questionsData || questionsData.length === 0) {
        toast({
          title: "Aucune question trouvée",
          description: "Le questionnaire ne contient actuellement aucune question active.",
          variant: "destructive"
        });
        return;
      }

      // Parse options from JSONB
      const parsedQuestions = questionsData.map(q => {
        let options: string[] = [];
        
        if (Array.isArray(q.options)) {
          options = q.options.map(opt => String(opt));
        } else if (typeof q.options === 'string') {
          try {
            const parsed = JSON.parse(q.options);
            options = Array.isArray(parsed) ? parsed.map((opt: any) => String(opt)) : [];
          } catch (e) {
            console.error('Error parsing options for question:', q.question_key, q.options);
            options = [];
          }
        } else if (q.options && typeof q.options === 'object') {
          // Handle case where options might be stored as an object
          const optionsObj = q.options as any;
          if (Array.isArray(optionsObj)) {
            options = optionsObj.map(opt => String(opt));
          } else {
            options = [];
          }
        }

        return {
          ...q,
          options
        };
      });

      setQuestions(parsedQuestions);
      
      const uniqueCategories = Array.from(new Set(parsedQuestions.map(q => q.category)));
      setCategories(uniqueCategories);
      
      if (uniqueCategories.length > 0) {
        setCurrentCategory(uniqueCategories[0]);
        console.log('🎯 Set current category to:', uniqueCategories[0]);
      }

      // Load existing responses from database
      await loadFromDatabase();

    } catch (error) {
      console.error('❌ Error fetching questions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le questionnaire. Erreur: " + (error?.message || 'Inconnue'),
        variant: "destructive"
      });
    } finally {
      
      setLoading(false);
    }
  };

  const handleResponseChange = (questionKey: string, value: string) => {
    updateResponse(questionKey, value);
  };

  const saveResponses = async () => {
    if (!user) return;

    const success = await saveToDatabase();
    
    if (success) {
      toast({
        title: "Réponses sauvegardées",
        description: "Vos réponses au questionnaire ont été enregistrées avec succès."
      });

      if (onComplete) {
        onComplete();
      }
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos réponses. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const getCurrentCategoryQuestions = () => {
    return questions.filter(q => q.category === currentCategory);
  };

  const getAnsweredCount = () => {
    return Object.keys(responses).length;
  };

  const getTotalQuestions = () => {
    
    return questions.length;
  };

  const getCategoryProgress = () => {
    const categoryQuestions = getCurrentCategoryQuestions();
    const answeredInCategory = categoryQuestions.filter(q => responses[q.question_key]).length;
    return categoryQuestions.length > 0 ? (answeredInCategory / categoryQuestions.length) * 100 : 0;
  };

  const getOverallProgress = () => {
    return getTotalQuestions() > 0 ? (getAnsweredCount() / getTotalQuestions()) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald"></div>
        <p className="ml-4 text-muted-foreground">Chargement des questions...</p>
      </div>
    );
  }

  // Debug information

  const currentCategoryConfig = categoryConfig[currentCategory as keyof typeof categoryConfig];
  const Icon = currentCategoryConfig?.icon || Heart;

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4'}>
      <div className={`container mx-auto ${embedded ? 'max-w-full' : 'max-w-4xl'}`}>
        <Card className={embedded ? '' : 'shadow-lg'}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">Questionnaire de Compatibilité</CardTitle>
            <p className="text-muted-foreground mb-4">
              Répondez à ces questions pour améliorer la précision de nos suggestions de partenaires
            </p>
            
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression globale</span>
                <div className="flex items-center gap-2">
                  <span>{getAnsweredCount()}/{getTotalQuestions()} questions</span>
                  {isSessionNearExpiry && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Session expire bientôt
                    </Badge>
                  )}
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-800">
                      Non sauvegardé
                    </Badge>
                  )}
                  {saving && (
                    <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-800">
                      Sauvegarde...
                    </Badge>
                  )}
                </div>
              </div>
              <Progress value={getOverallProgress()} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {Math.round(getOverallProgress())}% complété
                {hasUnsavedChanges && (
                  <span className="ml-2 text-yellow-600">• Sauvegarde automatique dans 3s</span>
                )}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            {/* Category Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => {
                const config = categoryConfig[category as keyof typeof categoryConfig];
                const CategoryIcon = config?.icon || Heart;
                const categoryQuestions = questions.filter(q => q.category === category);
                const answeredInCategory = categoryQuestions.filter(q => responses[q.question_key]).length;
                
                return (
                  <Button
                    key={category}
                    variant={currentCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentCategory(category)}
                    className="flex items-center gap-2"
                  >
                    <CategoryIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{config?.title || category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {answeredInCategory}/{categoryQuestions.length}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* Current Category Progress */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-5 w-5 ${currentCategoryConfig?.color || 'text-emerald'}`} />
                <h3 className="text-lg font-semibold">{currentCategoryConfig?.title || currentCategory}</h3>
              </div>
              <Progress value={getCategoryProgress()} className="w-full" />
              <p className="text-sm text-muted-foreground mt-1">
                {getCurrentCategoryQuestions().filter(q => responses[q.question_key]).length}/{getCurrentCategoryQuestions().length} questions répondues
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {getCurrentCategoryQuestions().map((question, index) => (
                <Card key={question.id} className="border-l-4 border-l-emerald/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <div className="flex-1 space-y-3">
                        <p className="font-medium">{question.question_text}</p>
                        <Select
                          value={responses[question.question_key] || ''}
                          onValueChange={(value) => handleResponseChange(question.question_key, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une réponse..." />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {question.weight > 3 && (
                          <Badge variant="destructive" className="text-xs">
                            Question importante
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  const currentIndex = categories.indexOf(currentCategory);
                  if (currentIndex > 0) {
                    setCurrentCategory(categories[currentIndex - 1]);
                  }
                }}
                disabled={categories.indexOf(currentCategory) === 0}
              >
                Catégorie précédente
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={saveResponses}
                  disabled={saving || Object.keys(responses).length === 0}
                >
                  {saving ? 'Sauvegarde...' : hasUnsavedChanges ? 'Sauvegarder les changements' : 'Sauvegarder'}
                </Button>
                
                {categories.indexOf(currentCategory) < categories.length - 1 ? (
                  <Button
                    onClick={() => {
                      const currentIndex = categories.indexOf(currentCategory);
                      setCurrentCategory(categories[currentIndex + 1]);
                    }}
                  >
                    Catégorie suivante
                  </Button>
                ) : (
                  <Button
                    onClick={saveResponses}
                    disabled={saving}
                    className="bg-emerald hover:bg-emerald-dark"
                  >
                    {saving ? 'Finalisation...' : 'Terminer'}
                  </Button>
                )}
              </div>
            </div>

            {/* Completion Status */}
            {getOverallProgress() === 100 && (
              <div className="mt-6 p-4 bg-emerald/10 border border-emerald/20 rounded-lg text-center">
                <p className="text-emerald-dark font-medium">
                  ✨ Félicitations ! Vous avez terminé le questionnaire de compatibilité.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ces informations nous aideront à vous proposer des partenaires plus compatibles.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompatibilityQuestionnaire;