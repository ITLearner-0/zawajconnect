
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import CustomButton from "./CustomButton";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const questions = [
  {
    id: 1,
    question: "How important is regular prayer in your daily life?",
    category: "Religious Practice",
  },
  {
    id: 2,
    question: "How significant is family involvement in your life decisions?",
    category: "Family Values",
  },
  {
    id: 3,
    question: "How important is continuing Islamic education to you?",
    category: "Education",
  },
  {
    id: 4,
    question: "How traditional are your views on marriage roles?",
    category: "Marriage Views",
  },
  {
    id: 5,
    question: "How important is maintaining Islamic dietary restrictions?",
    category: "Lifestyle",
  },
];

const CompatibilityTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
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
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value[0];
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    const totalPossibleScore = questions.length * 100;
    const actualScore = answers.reduce((acc, curr) => acc + curr, 0);
    setScore(Math.round((actualScore / totalPossibleScore) * 100));
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
                value={[answers[currentQuestion] || 50]}
                onValueChange={handleAnswer}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Less Important</span>
                <span>Very Important</span>
              </div>
            </div>
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
            <h2 className="text-2xl font-semibold">Your Compatibility Score</h2>
            <div className="text-6xl font-bold text-primary">{score}%</div>
            <p className="text-gray-600">
              Based on your answers, this is your potential compatibility score.
              Remember that true compatibility goes beyond numbers and should be
              discussed with family and potential partners.
            </p>
            <CustomButton
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers([]);
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
