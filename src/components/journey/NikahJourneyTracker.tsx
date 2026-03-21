import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  User, ClipboardCheck, Heart, MessageCircle, Moon, Users, Sparkles,
  CheckCircle2, Clock, ChevronRight, ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { journeySteps, type JourneyStep } from '@/data/journey_guidance';

const iconMap: Record<string, React.ElementType> = {
  User, ClipboardCheck, Heart, MessageCircle, Moon, Users, Sparkles,
};

interface JourneyData {
  step_profile_complete: boolean;
  step_test_complete: boolean;
  step_first_match: boolean;
  step_first_supervised_exchange: boolean;
  step_istikhara_completed: boolean;
  step_family_meeting: boolean;
  step_nikah: boolean;
  current_step: number;
  overall_progress_pct: number;
}

const defaultJourney: JourneyData = {
  step_profile_complete: false,
  step_test_complete: false,
  step_first_match: false,
  step_first_supervised_exchange: false,
  step_istikhara_completed: false,
  step_family_meeting: false,
  step_nikah: false,
  current_step: 1,
  overall_progress_pct: 0,
};

const stepKeys: (keyof JourneyData)[] = [
  'step_profile_complete',
  'step_test_complete',
  'step_first_match',
  'step_first_supervised_exchange',
  'step_istikhara_completed',
  'step_family_meeting',
  'step_nikah',
];

const NikahJourneyTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [journey, setJourney] = useState<JourneyData>(defaultJourney);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchJourney();
  }, [user]);

  const fetchJourney = async () => {
    try {
      const { data } = await supabase
        .from('journey_progress')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (data) {
        setJourney(data as unknown as JourneyData);
      } else {
        // Create initial journey record
        await supabase.from('journey_progress').insert({ user_id: user!.id });
      }
    } catch {
      // Table might not exist yet, use defaults
    } finally {
      setLoading(false);
    }
  };

  const isStepComplete = (stepIndex: number): boolean => {
    const key = stepKeys[stepIndex];
    return key ? (journey[key] as boolean) : false;
  };

  const currentStepIndex = stepKeys.findIndex((key) => !(journey[key] as boolean));
  const completedSteps = stepKeys.filter((key) => journey[key] as boolean).length;
  const progress = Math.round((completedSteps / 7) * 100);

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Parcours vers le Nikah
          </CardTitle>
          <Badge className="bg-emerald-100 text-emerald-700">
            {completedSteps}/7 étapes
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progression globale</span>
            <span className="font-medium text-emerald-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {journeySteps.map((step, index) => {
            const Icon = iconMap[step.icon] || Heart;
            const completed = isStepComplete(index);
            const isCurrent = index === currentStepIndex;
            const isExpanded = expandedStep === index;
            const isLocked = index > currentStepIndex && !completed;

            return (
              <div key={step.step}>
                {/* Step Row */}
                <div
                  className={`flex items-center gap-3 py-3 px-2 rounded-lg cursor-pointer transition-all ${
                    isCurrent ? 'bg-emerald-100/70' : isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
                  } ${isLocked ? 'opacity-50' : ''}`}
                  onClick={() => setExpandedStep(isExpanded ? null : index)}
                >
                  {/* Step indicator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      completed ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' :
                      isCurrent ? 'bg-emerald-500 text-white animate-pulse' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {completed ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    {index < 6 && (
                      <div className={`w-0.5 h-4 ${completed ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium text-sm ${
                        completed ? 'text-emerald-700' : isCurrent ? 'text-emerald-800' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      {completed && (
                        <Badge className="bg-emerald-100 text-emerald-600 text-xs py-0">✓</Badge>
                      )}
                      {isCurrent && (
                        <Badge className="bg-emerald-500 text-white text-xs py-0 animate-pulse">En cours</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                  </div>

                  {/* Toggle */}
                  {!isLocked && (
                    isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Expanded Detail */}
                {isExpanded && !isLocked && (
                  <div className="ml-14 mb-4 p-4 rounded-lg bg-white border border-gray-100 space-y-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{step.description}</p>

                    {/* Islamic Reference */}
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex gap-2">
                        <BookOpen className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-amber-800 italic">{step.islamicReference}</p>
                          <p className="text-xs text-amber-600 mt-1">— {step.islamicSource}</p>
                        </div>
                      </div>
                    </div>

                    {/* Questions */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Questions à se poser :</p>
                      <ul className="space-y-1">
                        {step.questionsToAsk.map((q, i) => (
                          <li key={i} className="text-xs text-gray-600 flex gap-2">
                            <span className="text-emerald-500">•</span> {q}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Common Mistakes */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Erreurs à éviter :</p>
                      <ul className="space-y-1">
                        {step.commonMistakes.map((m, i) => (
                          <li key={i} className="text-xs text-red-600 flex gap-2">
                            <span>⚠</span> {m}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Durée recommandée : {step.recommendedDuration}
                      </span>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(step.actionRoute);
                        }}
                      >
                        {step.actionLabel} <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default NikahJourneyTracker;
