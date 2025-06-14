
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTestHeader from "./MobileTestHeader";
import CategoryProgress from "../CategoryProgress";
import { Progress } from "@/components/ui/progress";
import { questions } from "@/data/compatibilityQuestions";
import { Answer } from "@/types/compatibility";

interface TestHeaderProps {
  currentQuestion: number;
  answers: Record<number, Answer>;
}

const TestHeader = ({ currentQuestion, answers }: TestHeaderProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileTestHeader currentQuestion={currentQuestion} answers={answers} />;
  }

  return (
    <div className="space-y-4">
      <CategoryProgress currentQuestion={currentQuestion} answers={answers} />
      
      <div className="mt-8">
        <Progress 
          value={(currentQuestion + 1) / questions.length * 100} 
          className="h-3 w-full"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            Question {currentQuestion + 1} sur {questions.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TestHeader;
