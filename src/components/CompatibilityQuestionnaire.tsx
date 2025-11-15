import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuestionnaireState } from '@/hooks/useQuestionnaireState';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { useEmergencyBackup } from '@/hooks/useEmergencyBackup';
import {
  Heart,
  Users,
  Home,
  Activity,
  Baby,
  Handshake,
  User,
  Coins,
  Brain,
  AlertTriangle,
} from 'lucide-react';

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
  domestic_responsibilities: {
    title: 'Responsabilités Domestiques',
    icon: Home,
    color: 'text-orange-500',
  },
  decision_making: { title: 'Prise de Décision', icon: Brain, color: 'text-purple-500' },
  career_family: { title: 'Carrière vs Famille', icon: Activity, color: 'text-blue-500' },
  marriage_vision: { title: 'Vision du Mariage', icon: Heart, color: 'text-pink-500' },
  intimacy_consent: { title: 'Intimité & Consentement', icon: Handshake, color: 'text-red-500' },
};

const CompatibilityQuestionnaire = ({
  onComplete,
  embedded = false,
}: CompatibilityQuestionnaireProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { responses, updateResponse, saveToDatabase, loadFromDatabase, saving, hasUnsavedChanges } =
    useQuestionnaireState({
      storageKey: 'compatibility_responses',
      autoSaveDelay: 2000, // Reduced to 2 seconds for faster saves
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
        e.returnValue =
          'Vous avez des réponses non sauvegardées. Êtes-vous sûr de vouloir quitter?';
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
          title: 'Authentification requise',
          description: 'Vous devez être connecté pour accéder au questionnaire.',
          variant: 'destructive',
        });
        return;
      }

      // Simple auth check without complex validation
      if (!user) {
        toast({
          title: 'Authentification requise',
          description: 'Veuillez vous connecter pour accéder au questionnaire.',
          variant: 'destructive',
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
          title: 'Aucune question trouvée',
          description: 'Le questionnaire ne contient actuellement aucune question active.',
          variant: 'destructive',
        });
        return;
      }

      // Parse options from JSONB
      const parsedQuestions = questionsData.map((q) => {
        let options: string[] = [];

        if (Array.isArray(q.options)) {
          options = q.options.map((opt) => String(opt));
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
            options = optionsObj.map((opt) => String(opt));
          } else {
            options = [];
          }
        }

        return {
          ...q,
          options,
          weight: q.weight ?? 1,
          is_active: q.is_active ?? true,
        };
      });

      setQuestions(parsedQuestions);

      const uniqueCategories = Array.from(new Set(parsedQuestions.map((q) => q.category)));
      setCategories(uniqueCategories);

      if (uniqueCategories.length > 0 && uniqueCategories[0]) {
        setCurrentCategory(uniqueCategories[0] ?? '');
        console.log('🎯 Set current category to:', uniqueCategories[0]);
      }

      // Load existing responses from database
      await loadFromDatabase();
    } catch (error) {
      console.error('❌ Error fetching questions:', error);
      toast({
        title: 'Erreur',
        description:
          'Impossible de charger le questionnaire. Erreur: ' + (error?.message || 'Inconnue'),
        variant: 'destructive',
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
        title: 'Réponses sauvegardées',
        description: 'Vos réponses au questionnaire ont été enregistrées avec succès.',
      });

      if (onComplete) {
        onComplete();
      }
    } else {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos réponses. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  const getCurrentCategoryQuestions = () => {
    return questions.filter((q) => q.category === currentCategory);
  };

  const getAnsweredCount = () => {
    return Object.keys(responses).length;
  };

  const getTotalQuestions = () => {
    return questions.length;
  };

  const getCategoryProgress = () => {
    const categoryQuestions = getCurrentCategoryQuestions();
    const answeredInCategory = categoryQuestions.filter((q) => responses[q.question_key]).length;
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
    <div
      className={
        embedded
          ? ''
          : 'min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8 px-4'
      }
    >
      <div className={`container mx-auto ${embedded ? 'max-w-full' : 'max-w-7xl'}`}>
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg">
              <Icon className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Questionnaire de Compatibilité</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Répondez à ces questions pour améliorer la précision de nos suggestions de partenaires
          </p>
        </div>

        {/* Progress Card */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Progression globale</span>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="text-muted-foreground">
                    {getAnsweredCount()}/{getTotalQuestions()} questions
                  </span>
                  {isSessionNearExpiry && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Session expire bientôt
                    </Badge>
                  )}
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="text-xs">
                      Non sauvegardé
                    </Badge>
                  )}
                  {saving && (
                    <Badge variant="secondary" className="text-xs">
                      Sauvegarde...
                    </Badge>
                  )}
                </div>
              </div>
              <Progress value={getOverallProgress()} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(getOverallProgress())}% complété
                {hasUnsavedChanges && (
                  <span className="ml-2">• Sauvegarde automatique dans 3s</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Category Navigation */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.map((category) => {
                const config = categoryConfig[category as keyof typeof categoryConfig];
                const CategoryIcon = config?.icon || Heart;
                const categoryQuestions = questions.filter((q) => q.category === category);
                const answeredInCategory = categoryQuestions.filter(
                  (q) => responses[q.question_key]
                ).length;
                const isComplete = answeredInCategory === categoryQuestions.length;

                return (
                  <Button
                    key={category}
                    variant={currentCategory === category ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setCurrentCategory(category)}
                    className={`flex flex-col items-center gap-2 h-auto py-4 ${
                      currentCategory === category ? 'shadow-md' : ''
                    }`}
                  >
                    <CategoryIcon className="h-5 w-5" />
                    <span className="text-xs text-center leading-tight">
                      {config?.title || category}
                    </span>
                    <Badge variant={isComplete ? 'default' : 'secondary'} className="text-xs">
                      {answeredInCategory}/{categoryQuestions.length}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Category Section */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {currentCategoryConfig?.title || currentCategory}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getCurrentCategoryQuestions().filter((q) => responses[q.question_key]).length}/
                    {getCurrentCategoryQuestions().length} questions répondues
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(getCategoryProgress())}%
                </div>
              </div>
            </div>
            <Progress value={getCategoryProgress()} className="mt-4 h-2" />
          </CardHeader>
        </Card>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {getCurrentCategoryQuestions().map((question, index) => (
            <Card key={question.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium leading-relaxed">{question.question_text}</p>
                      {question.weight > 3 && (
                        <Badge variant="destructive" className="text-xs mt-2">
                          Question importante
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Select
                    value={responses[question.question_key] || ''}
                    onValueChange={(value) => handleResponseChange(question.question_key, value)}
                  >
                    <SelectTrigger className="w-full">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Footer */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const currentIndex = categories.indexOf(currentCategory);
                  if (currentIndex > 0 && categories[currentIndex - 1]) {
                    setCurrentCategory(categories[currentIndex - 1] ?? '');
                  }
                }}
                disabled={categories.indexOf(currentCategory) === 0}
                className="w-full sm:w-auto"
              >
                Catégorie précédente
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={saveResponses}
                  disabled={saving || Object.keys(responses).length === 0}
                  className="flex-1 sm:flex-none"
                >
                  {saving ? 'Sauvegarde...' : hasUnsavedChanges ? 'Sauvegarder' : 'Sauvegarder'}
                </Button>

                {categories.indexOf(currentCategory) < categories.length - 1 ? (
                  <Button
                    size="lg"
                    onClick={() => {
                      const currentIndex = categories.indexOf(currentCategory);
                      if (categories[currentIndex + 1]) {
                        setCurrentCategory(categories[currentIndex + 1] ?? '');
                      }
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    Catégorie suivante
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={saveResponses}
                    disabled={saving}
                    className="flex-1 sm:flex-none"
                  >
                    {saving ? 'Finalisation...' : 'Terminer'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Status */}
        {getOverallProgress() === 100 && (
          <Card className="mt-6 border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-primary font-medium">
                ✨ Félicitations ! Vous avez terminé le questionnaire de compatibilité.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ces informations nous aideront à vous proposer des partenaires plus compatibles.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompatibilityQuestionnaire;
