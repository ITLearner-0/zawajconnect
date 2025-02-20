import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import CustomButton from "./CustomButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { questions } from "@/data/compatibilityQuestions";
import { Answer, CompatibilityResultData } from "@/types/compatibility";
import QuestionDisplay from "./compatibility/QuestionDisplay";
import ResultsDisplay from "./compatibility/ResultsDisplay";
import { Json } from "@/integrations/supabase/types";

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
            weight: q.weight
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
    }
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

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 animate-fadeIn">
      <Card className="p-6 shadow-lg">
        {!showResult ? (
          <>
            <QuestionDisplay
              question={questions[currentQuestion]}
              answer={answers[currentQuestion]}
              isDealbreaker={isDealbreaker}
              breakerThreshold={breakerThreshold}
              onAnswerChange={handleAnswer}
              onDealbreakerChange={setIsDealbreaker}
              onThresholdChange={(value) => setBreakerthreshold(value[0])}
            />
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <CustomButton onClick={handleNext}>
                {currentQuestion === questions.length - 1 ? "See Results" : "Next"}
              </CustomButton>
            </div>
          </>
        ) : (
          <ResultsDisplay score={score} onRetake={handleRetake} />
        )}
      </Card>
    </div>
  );
};

export default CompatibilityTest;
