
import { Question } from "@/data/compatibilityQuestions";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Answer } from "@/types/compatibility";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuestionDisplayProps {
  question: Question;
  answer?: Answer;
  isDealbreaker: boolean;
  breakerThreshold: number;
  onAnswerChange: (value: number[]) => void;
  onDealbreakerChange: (value: boolean) => void;
  onThresholdChange: (value: number[]) => void;
  onWeightChange?: (value: number[]) => void;
}

const QuestionDisplay = ({
  question,
  answer,
  isDealbreaker,
  breakerThreshold,
  onAnswerChange,
  onDealbreakerChange,
  onThresholdChange,
  onWeightChange,
}: QuestionDisplayProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-primary font-medium">
            {question.category}
          </span>
          {question.description && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                {question.description}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <h3 className="text-xl font-semibold">
          {question.question}
        </h3>
      </div>
      
      <Tabs defaultValue="importance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="importance">Importance</TabsTrigger>
          <TabsTrigger value="preferences">Weight & Dealbreakers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="importance" className="py-4 space-y-4">
          <div>
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
          
          <div className="bg-blue-50 p-3 rounded text-blue-800 text-sm">
            <p>This measures how important this aspect is to you personally. 
            Higher values will make this a stronger factor in your matches.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6 py-4">
          {onWeightChange && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Question Weight: {((answer?.weight || question.weight) / 2 * 10).toFixed(1)}</Label>
                <span className="text-xs text-gray-500">Default: {(question.weight / 2 * 10).toFixed(1)}</span>
              </div>
              <Slider
                defaultValue={[question.weight * 10]}
                min={5}
                max={20}
                step={1}
                value={[(answer?.weight || question.weight) * 10]}
                onValueChange={(values) => onWeightChange(values.map(v => v / 10))}
                className="w-full"
              />
              <p className="text-xs text-gray-600">
                Increase the weight to make this question more influential in your compatibility scoring
              </p>
            </div>
          )}
          
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
                  <Label>Minimum acceptable value: {breakerThreshold}</Label>
                  <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    value={[breakerThreshold]}
                    onValueChange={onThresholdChange}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    Matches with values below this threshold will be excluded
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionDisplay;
