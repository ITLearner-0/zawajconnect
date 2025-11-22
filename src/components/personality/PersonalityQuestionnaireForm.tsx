import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { CheckCircle2, Circle } from 'lucide-react';
import {
  PERSONALITY_QUESTIONS,
  CATEGORY_LABELS,
  type PersonalityQuestionnaire,
  type QuestionnaireQuestion,
} from '@/types/personality';

const PersonalityQuestionnaireForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<PersonalityQuestionnaire>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingData, setExistingData] = useState<PersonalityQuestionnaire | null>(null);

  useEffect(() => {
    loadExistingQuestionnaire();
  }, [user]);

  const loadExistingQuestionnaire = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('personality_questionnaire')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingData(data);
        // Pre-fill answers with existing data
        setAnswers(data);
      }
    } catch (error) {
      console.error('Error loading questionnaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (field: string, value: number[]) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value[0],
    }));
  };

  const handleNext = () => {
    const currentQuestion = PERSONALITY_QUESTIONS[currentStep];
    const currentAnswer = answers[currentQuestion.field];

    if (currentAnswer === undefined) {
      toast({
        title: 'Réponse requise',
        description: 'Veuillez répondre à la question avant de continuer',
        variant: 'destructive',
      });
      return;
    }

    if (currentStep < PERSONALITY_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate all questions are answered
    const allAnswered = PERSONALITY_QUESTIONS.every((q) => answers[q.field] !== undefined);

    if (!allAnswered) {
      toast({
        title: 'Questionnaire incomplet',
        description: 'Veuillez répondre à toutes les questions',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const questionnaireData = {
        user_id: user.id,
        career_ambition: answers.career_ambition!,
        family_priority: answers.family_priority!,
        religious_growth: answers.religious_growth!,
        community_involvement: answers.community_involvement!,
        communication_style: answers.communication_style!,
        conflict_resolution: answers.conflict_resolution!,
        emotional_expression: answers.emotional_expression!,
        spending_habits: answers.spending_habits!,
        financial_planning: answers.financial_planning!,
        social_energy: answers.social_energy!,
        adventure_level: answers.adventure_level!,
        organization_level: answers.organization_level!,
        household_roles: answers.household_roles!,
        decision_making: answers.decision_making!,
        parenting_style: answers.parenting_style!,
      };

      if (existingData) {
        // Update existing questionnaire
        const { error } = await supabase
          .from('personality_questionnaire')
          .update(questionnaireData)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: 'Questionnaire mis à jour',
          description: 'Vos réponses ont été enregistrées avec succès',
        });
      } else {
        // Insert new questionnaire
        const { error } = await supabase.from('personality_questionnaire').insert(questionnaireData);

        if (error) throw error;

        toast({
          title: 'Questionnaire complété',
          description: 'Vos réponses ont été enregistrées avec succès',
        });
      }

      // Reload to get updated data
      await loadExistingQuestionnaire();
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le questionnaire',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = PERSONALITY_QUESTIONS[currentStep];
  const currentAnswer = answers[currentQuestion.field];
  const progress = ((currentStep + 1) / PERSONALITY_QUESTIONS.length) * 100;

  // Group questions by category for progress indicators
  const categoryProgress = Object.entries(CATEGORY_LABELS).map(([categoryKey, categoryInfo]) => {
    const categoryQuestions = PERSONALITY_QUESTIONS.filter((q) => q.category === categoryKey);
    const answeredCount = categoryQuestions.filter((q) => answers[q.field] !== undefined).length;
    return {
      category: categoryKey,
      ...categoryInfo,
      total: categoryQuestions.length,
      answered: answeredCount,
      completed: answeredCount === categoryQuestions.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Questionnaire de Personnalité</span>
            <Badge variant="outline">
              {currentStep + 1} / {PERSONALITY_QUESTIONS.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Aidez-nous à trouver des partenaires compatibles en répondant à ces questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Category Progress Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {categoryProgress.map((cat) => (
          <Card key={cat.category} className="relative">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{cat.icon}</span>
                {cat.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="text-xs font-medium mb-1">{cat.title}</div>
              <div className="text-xs text-muted-foreground">
                {cat.answered}/{cat.total}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="text-3xl">{CATEGORY_LABELS[currentQuestion.category].icon}</div>
            <div className="flex-1">
              <Badge variant="outline" className="mb-2">
                {CATEGORY_LABELS[currentQuestion.category].title}
              </Badge>
              <CardTitle className="text-xl mb-2">{currentQuestion.question}</CardTitle>
              {currentQuestion.description && (
                <CardDescription>{currentQuestion.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Slider */}
          <div className="space-y-4 pt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{currentQuestion.leftLabel}</span>
              <span>{currentQuestion.rightLabel}</span>
            </div>

            <Slider
              value={[currentAnswer || 3]}
              onValueChange={(value) => handleSliderChange(currentQuestion.field, value)}
              min={1}
              max={5}
              step={1}
              className="py-4"
            />

            {/* Value indicator */}
            <div className="flex justify-between text-xs text-muted-foreground">
              {[1, 2, 3, 4, 5].map((val) => (
                <div
                  key={val}
                  className={`flex flex-col items-center ${
                    currentAnswer === val ? 'text-primary font-bold' : ''
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentAnswer === val ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                  <span className="mt-1">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || saving}
            >
              Précédent
            </Button>

            <Button onClick={handleNext} disabled={saving} className="bg-emerald hover:bg-emerald-dark">
              {currentStep === PERSONALITY_QUESTIONS.length - 1
                ? saving
                  ? 'Enregistrement...'
                  : existingData
                    ? 'Mettre à jour'
                    : 'Terminer'
                : 'Suivant'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Navigation rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PERSONALITY_QUESTIONS.map((q, index) => (
              <Button
                key={q.id}
                variant={currentStep === index ? 'default' : 'outline'}
                size="sm"
                className="w-10 h-10 p-0"
                onClick={() => setCurrentStep(index)}
                disabled={saving}
              >
                {answers[q.field] !== undefined ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalityQuestionnaireForm;
