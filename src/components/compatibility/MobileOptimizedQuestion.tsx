
import { Question } from "@/data/compatibilityQuestions";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Answer } from "@/types/compatibility";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MobileOptimizedQuestionProps {
  question: Question;
  answer?: Answer;
  isDealbreaker: boolean;
  breakerThreshold: number;
  onAnswerChange: (value: number[]) => void;
  onDealbreakerChange: (value: boolean) => void;
  onThresholdChange: (value: number[]) => void;
  onWeightChange?: (value: number[]) => void;
}

const agreementLevels = [
  { value: 20, label: "PTA", fullLabel: "Pas du tout d'accord", color: "bg-red-500", textColor: "text-white" },
  { value: 40, label: "PA", fullLabel: "Pas d'accord", color: "bg-red-300", textColor: "text-white" },
  { value: 60, label: "N", fullLabel: "Neutre", color: "bg-gray-400", textColor: "text-white" },
  { value: 80, label: "A", fullLabel: "D'accord", color: "bg-green-300", textColor: "text-white" },
  { value: 100, label: "TA", fullLabel: "Tout à fait d'accord", color: "bg-green-500", textColor: "text-white" }
];

const MobileOptimizedQuestion = ({
  question,
  answer,
  isDealbreaker,
  breakerThreshold,
  onAnswerChange,
  onDealbreakerChange,
  onThresholdChange,
  onWeightChange,
}: MobileOptimizedQuestionProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const currentLevel = agreementLevels.find(level => 
    Math.abs(level.value - (answer?.value || 60)) <= 10
  ) || agreementLevels[2];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Category and Info */}
        <div className="flex items-center justify-between">
          <Badge className="bg-rose-100 text-rose-800 border-rose-300">
            {question.category}
          </Badge>
          {question.description && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">
                {question.description}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Question */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
          {question.question}
        </h3>

        {/* Quick Response Buttons */}
        <div className="grid grid-cols-5 gap-2">
          {agreementLevels.map((level) => (
            <Button
              key={level.value}
              variant={Math.abs(level.value - (answer?.value || 60)) <= 10 ? "default" : "outline"}
              size="sm"
              onClick={() => onAnswerChange([level.value])}
              className={`flex flex-col p-3 h-auto min-h-[4rem] ${
                Math.abs(level.value - (answer?.value || 60)) <= 10 
                  ? `${level.color} ${level.textColor}` 
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="font-bold text-sm">{level.label}</span>
              <span className="text-xs text-center leading-tight mt-1">
                {level.fullLabel.split(' ').map((word, i) => (
                  <span key={i} className="block">{word}</span>
                ))}
              </span>
            </Button>
          ))}
        </div>

        {/* Current Selection Display */}
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className={`text-xl font-bold ${currentLevel.color} ${currentLevel.textColor} inline-block px-3 py-1 rounded`}>
            {currentLevel.fullLabel}
          </div>
        </div>

        {/* Fine-tune Slider */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Ajustement précis: {answer?.value || 60}%</Label>
          <Slider
            value={[answer?.value || 60]}
            max={100}
            min={20}
            step={1}
            onValueChange={onAnswerChange}
            className="w-full"
          />
        </div>

        {/* Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres avancés
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            {onWeightChange && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Importance: {((answer?.weight || question.weight) / 2 * 10).toFixed(1)}</Label>
                  <span className="text-xs text-gray-500">Défaut: {(question.weight / 2 * 10).toFixed(1)}</span>
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
              </div>
            )}
            
            {question.isBreaker && (
              <div className="space-y-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="dealbreaker"
                    checked={isDealbreaker}
                    onCheckedChange={onDealbreakerChange}
                  />
                  <Label htmlFor="dealbreaker" className="text-sm text-amber-800 dark:text-amber-200">
                    Critère non négociable
                  </Label>
                </div>
                {isDealbreaker && (
                  <div className="space-y-2">
                    <Label className="text-sm text-amber-800 dark:text-amber-200">
                      Niveau minimum: {breakerThreshold}%
                    </Label>
                    <Slider
                      defaultValue={[70]}
                      max={100}
                      min={20}
                      step={1}
                      value={[breakerThreshold]}
                      onValueChange={onThresholdChange}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
};

export default MobileOptimizedQuestion;
