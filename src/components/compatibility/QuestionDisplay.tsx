
import { Question } from "@/data/compatibilityQuestions";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Answer } from "@/types/compatibility";

interface QuestionDisplayProps {
  question: Question;
  answer?: Answer;
  isDealbreaker: boolean;
  breakerThreshold: number;
  onAnswerChange: (value: number[]) => void;
  onDealbreakerChange: (value: boolean) => void;
  onThresholdChange: (value: number[]) => void;
}

const QuestionDisplay = ({
  question,
  answer,
  isDealbreaker,
  breakerThreshold,
  onAnswerChange,
  onDealbreakerChange,
  onThresholdChange,
}: QuestionDisplayProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-sm text-primary font-medium">
          {question.category}
        </span>
        <h3 className="text-xl font-semibold">
          {question.question}
        </h3>
      </div>
      <div className="py-4">
        <Slider
          defaultValue={[50]}
          max={100}
          step={1}
          value={[answer?.value || 50]}
          onValueChange={onAnswerChange}
          className="w-full"
        />
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Less Important</span>
          <span>Very Important</span>
        </div>
      </div>
      {question.isBreaker && (
        <div className="space-y-4 p-4 bg-accent/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch
              id="dealbreaker"
              checked={isDealbreaker}
              onCheckedChange={onDealbreakerChange}
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
                onValueChange={onThresholdChange}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
