
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Answer } from "@/types/compatibility";
import TestContainer from "./compatibility/test/TestContainer";
import EnhancedResultsDisplay from "./compatibility/EnhancedResultsDisplay";

const CompatibilityTest = () => {
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});

  const handleTestComplete = (finalScore: number, testAnswers: Record<number, Answer>) => {
    setScore(finalScore);
    setAnswers(testAnswers);
    setShowResult(true);
  };

  const handleRetake = () => {
    setShowResult(false);
    setScore(0);
    setAnswers({});
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 animate-fadeIn">
      <Card className="p-4 md:p-6 shadow-lg">
        {!showResult ? (
          <TestContainer onComplete={handleTestComplete} />
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
