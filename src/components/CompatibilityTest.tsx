
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import CustomButton from "./CustomButton";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const questions = [
  {
    id: 1,
    question: "How important is regular prayer in your daily life?",
    category: "Religious Practice",
    weight: 2.0,
    isBreaker: true,
  },
  {
    id: 2,
    question: "How significant is family involvement in your life decisions?",
    category: "Family Values",
    weight: 1.5,
    isBreaker: false,
  },
  {
    id: 3,
    question: "How important is continuing Islamic education to you?",
    category: "Education",
    weight: 1.2,
    isBreaker: false,
  },
  {
    id: 4,
    question: "How traditional are your views on marriage roles?",
    category: "Marriage Views",
    weight: 1.8,
    isBreaker: true,
  },
  {
    id: 5,
    question: "How important is maintaining Islamic dietary restrictions?",
    category: "Lifestyle",
    weight: 1.5,
    isBreaker: true,
  },
  {
    id: 6,
    question: "How important is modest dressing to you?",
    category: "Lifestyle",
    weight: 1.5,
    isBreaker: false,
  },
  {
    id: 7,
    question: "How important is it that your spouse has similar cultural background?",
    category: "Cultural Values",
    weight: 1.0,
    isBreaker: false,
  },
  {
    id: 8,
    question: "How important is financial responsibility in marriage?",
    category: "Financial Values",
    weight: 1.3,
    isBreaker: false,
  }
];

interface Answer {
  value: number;
  isBreaker: boolean;
  breakerThreshold?: number;
}

const CompatibilityTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isDealbreaker, setIsDealbreaker] = useState(false);
  const [breakerThreshold, setBreakerthreshold] = useState(50);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to take the compatibility test",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleAnswer = (value: number[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        value: value[0],
        isBreaker: isDealbreaker,
        breakerThreshold: isDealbreaker ? breakerThreshold : undefined
      }
    }));
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsDealbreaker(questions[currentQuestion + 1].isBreaker);
    } else {
      await calculateAndSaveScore();
      setShowResult(true);
    }
  };

  const calculateAndSaveScore = async () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let dealbreakers = [];

    for (const [index, answer] of Object.entries(answers)) {
      const question = questions[Number(index)];
      totalWeightedScore += (answer.value * question.weight);
      totalWeight += question.weight;

      if (answer.isBreaker && answer.breakerThreshold && answer.value < answer.breakerThreshold) {
        dealbreakers.push(question.category);
      }
    }

    const finalScore = Math.round((totalWeightedScore / (totalWeight * 100)) * 100);
    setScore(finalScore);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Convert answers to a plain object that can be serialized
        const serializedAnswers = Object.entries(answers).reduce((acc, [key, value]) => {
          acc[key] = {
            value: value.value,
            isBreaker: value.isBreaker,
            breakerThreshold: value.breakerThreshold
          };
          return acc;
        }, {} as Record<string, Answer>);

        const { error } = await supabase
          .from('compatibility_results')
          .insert({
            answers: serializedAnswers,
            score: finalScore,
            dealbreakers: dealbreakers,
            preferences: questions.map(q => ({
              category: q.category,
              weight: q.weight
            })),
            user_id: session.user.id
          });

        if (error) throw error;

        toast({
          title: "Results Saved",
          description: "Your compatibility preferences have been saved successfully",
        });
      }
    } catch (error) {
      console.error('Error saving results:', error);
      toast({
        title: "Error",
        description: "Failed to save your results. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 animate-fadeIn">
      <Card className="p-6 shadow-lg">
        {!showResult ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-sm text-primary font-medium">
                {questions[currentQuestion].category}
              </span>
              <h3 className="text-xl font-semibold">
                {questions[currentQuestion].question}
              </h3>
            </div>
            <div className="py-4">
              <Slider
                defaultValue={[50]}
                max={100}
                step={1}
                value={[answers[currentQuestion]?.value || 50]}
                onValueChange={handleAnswer}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Less Important</span>
                <span>Very Important</span>
              </div>
            </div>
            {questions[currentQuestion].isBreaker && (
              <div className="space-y-4 p-4 bg-accent/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="dealbreaker"
                    checked={isDealbreaker}
                    onCheckedChange={setIsDealbreaker}
                  />
                  <Label htmlFor="dealbreaker">Mark as dealbreaker</Label>
                </div>
                {isDealbreaker && (
                  <div className="space-y-2">
                    <Label>Minimum acceptable value</Label>
                    <Slider
                      defaultValue={[50]}
                      max={100}
                      step={1}
                      value={[breakerThreshold]}
                      onValueChange={(value) => setBreakerthreshold(value[0])}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <CustomButton onClick={handleNext}>
                {currentQuestion === questions.length - 1 ? "See Results" : "Next"}
              </CustomButton>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Your Compatibility Profile</h2>
            <div className="text-6xl font-bold text-primary">{score}%</div>
            <p className="text-gray-600">
              Based on your weighted answers and preferences, this is your compatibility profile score.
              Your responses have been saved and will be used for future matching.
            </p>
            <CustomButton
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setShowResult(false);
              }}
              variant="outline"
            >
              Take Test Again
            </CustomButton>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CompatibilityTest;
