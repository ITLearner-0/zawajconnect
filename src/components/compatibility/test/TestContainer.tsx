
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { questions } from "@/data/compatibilityQuestions";
import { Answer } from "@/types/compatibility";
import { Json } from "@/integrations/supabase/types";
import TestHeader from "./TestHeader";
import TestQuestion from "./TestQuestion";
import TestNavigation from "./TestNavigation";

interface TestContainerProps {
  onComplete: (score: number, answers: Record<number, Answer>) => void;
}

const TestContainer = ({ onComplete }: TestContainerProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
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
    const question = questions[currentQuestion];
    if (!question) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        questionId: question.id,
        value: value[0] ?? 50,
        weight: prev[currentQuestion]?.weight ?? question.weight,
        isBreaker: isDealbreaker,
        breakerThreshold: isDealbreaker ? breakerThreshold : undefined
      }
    }));
  };

  const handleWeightChange = (value: number[]) => {
    const question = questions[currentQuestion];
    if (!question) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        questionId: prev[currentQuestion]?.questionId ?? question.id,
        value: prev[currentQuestion]?.value ?? 50,
        weight: value[0],
        isBreaker: prev[currentQuestion]?.isBreaker ?? false,
        breakerThreshold: prev[currentQuestion]?.breakerThreshold
      }
    }));
  };

  const calculateAndSaveScore = async () => {
    setLoading(true);
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const dealbreakers = [];

    for (const [index, answer] of Object.entries(answers)) {
      const question = questions[Number(index)];
      if (!question) continue;
      
      const effectiveWeight = answer.weight || question.weight;
      
      totalWeightedScore += (answer.value * effectiveWeight);
      totalWeight += effectiveWeight;

      if (answer.isBreaker && answer.breakerThreshold && answer.value < answer.breakerThreshold) {
        dealbreakers.push(question.category);
      }
    }

    const finalScore = Math.round((totalWeightedScore / (totalWeight * 100)) * 100);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const answersMap = Object.fromEntries(
          Object.entries(answers).map(([qIndex, answer]) => {
            const question = questions[Number(qIndex)];
            return question ? [question.id, answer] : null;
          }).filter(Boolean) as Array<[string, Answer]>
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
          .from('compatibility_results' as any)
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

    onComplete(finalScore, answers);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await calculateAndSaveScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="space-y-6">
      <TestHeader currentQuestion={currentQuestion} answers={answers} />
      
      <TestQuestion
        question={questions[currentQuestion]!}
        answer={answers[currentQuestion]}
        isDealbreaker={isDealbreaker}
        breakerThreshold={breakerThreshold}
        onAnswerChange={handleAnswer}
        onDealbreakerChange={setIsDealbreaker}
        onThresholdChange={(value) => setBreakerthreshold(value[0] ?? 50)}
        onWeightChange={handleWeightChange}
      />
      
      <TestNavigation
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        hasAnswer={!!answers[currentQuestion]?.value}
        loading={loading}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
};

export default TestContainer;
