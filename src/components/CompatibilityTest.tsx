
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import CustomButton from "./CustomButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { questions, calculateMaxPossibleScore } from "@/data/compatibilityQuestions";
import { Answer, CompatibilityResultData } from "@/types/compatibility";
import { Json } from "@/integrations/supabase/types";
import { Progress } from "@/components/ui/progress";
import CategoryProgress from "./compatibility/CategoryProgress";
import MobileOptimizedQuestion from "./compatibility/MobileOptimizedQuestion";
import EnhancedResultsDisplay from "./compatibility/EnhancedResultsDisplay";

const CompatibilityTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isDealbreaker, setIsDealbreaker] = useState(false);
  const [breakerThreshold, setBreakerthreshold] = useState(50);
  const [loading, setLoading] = useState(false);
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

    // Set initial dealbreaker state based on current question
    setIsDealbreaker(questions[currentQuestion]?.isBreaker || false);

    checkAuth();
  }, [navigate, toast, currentQuestion]);

  const handleAnswer = (value: number[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        value: value[0],
        isBreaker: isDealbreaker,
        breakerThreshold: isDealbreaker ? breakerThreshold : undefined
      }
    }));
  };

  const handleWeightChange = (value: number[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        weight: value[0]
      }
    }));
  };

  const calculateAndSaveScore = async () => {
    setLoading(true);
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let dealbreakers = [];

    for (const [index, answer] of Object.entries(answers)) {
      const question = questions[Number(index)];
      const effectiveWeight = answer.weight || question.weight;
      
      totalWeightedScore += (answer.value * effectiveWeight);
      totalWeight += effectiveWeight;

      if (answer.isBreaker && answer.breakerThreshold && answer.value < answer.breakerThreshold) {
        dealbreakers.push(question.category);
      }
    }

    const finalScore = Math.round((totalWeightedScore / (totalWeight * 100)) * 100);
    setScore(finalScore);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const answersMap = Object.fromEntries(
          Object.entries(answers).map(([qIndex, answer]) => [
            questions[Number(qIndex)].id,
            answer
          ])
        );

        const resultData = {
          answers: answersMap as unknown as Json,
          score: finalScore,
          dealbreakers: dealbreakers as unknown as Json,
          preferences: questions.map(q => ({
            category: q.id.toString(),
            weight: answers[questions.findIndex(quest => quest.id === q.id)]?.weight || q.weight
          })) as unknown as Json,
          user_id: session.user.id
        };

        const { error } = await supabase
          .from('compatibility_results')
          .insert(resultData);

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
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await calculateAndSaveScore();
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 animate-fadeIn">
      <Card className="p-4 md:p-6 shadow-lg">
        {!showResult ? (
          <>
            <CategoryProgress currentQuestion={currentQuestion} answers={answers} />
            
            <MobileOptimizedQuestion
              question={questions[currentQuestion]}
              answer={answers[currentQuestion]}
              isDealbreaker={isDealbreaker}
              breakerThreshold={breakerThreshold}
              onAnswerChange={handleAnswer}
              onDealbreakerChange={setIsDealbreaker}
              onThresholdChange={(value) => setBreakerthreshold(value[0])}
              onWeightChange={handleWeightChange}
            />
            
            <div className="mt-8 space-y-4">
              <Progress 
                value={(currentQuestion + 1) / questions.length * 100} 
                className="h-3 w-full"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Question {currentQuestion + 1} sur {questions.length}
                </span>
                <div className="space-x-3">
                  {currentQuestion > 0 && (
                    <CustomButton variant="outline" onClick={handlePrevious}>
                      Précédent
                    </CustomButton>
                  )}
                  <CustomButton 
                    onClick={handleNext} 
                    disabled={loading || !answers[currentQuestion]?.value}
                  >
                    {currentQuestion === questions.length - 1 ? (loading ? "Calcul..." : "Voir les Résultats") : "Suivant"}
                  </CustomButton>
                </div>
              </div>
            </div>
          </>
        ) : (
          <EnhancedResultsDisplay 
            score={score} 
            answers={answers}
            onRetake={handleRetake} 
          />
        )}
      </Card>
    </div>
  );
};

export default CompatibilityTest;
