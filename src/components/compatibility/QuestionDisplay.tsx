
import { Question } from "@/data/compatibilityQuestions";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Answer } from "@/types/compatibility";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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

const agreementLevels = [
  { value: 20, label: "PTA", fullLabel: "Pas du tout d'accord", color: "text-red-600" },
  { value: 40, label: "PA", fullLabel: "Pas d'accord", color: "text-red-400" },
  { value: 60, label: "N", fullLabel: "Neutre/Indécis", color: "text-gray-500" },
  { value: 80, label: "A", fullLabel: "D'accord", color: "text-green-400" },
  { value: 100, label: "TA", fullLabel: "Tout à fait d'accord", color: "text-green-600" }
];

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
  const currentLevel = agreementLevels.find(level => 
    Math.abs(level.value - (answer?.value || 60)) <= 10
  ) || agreementLevels[2];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded">
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
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {question.question}
        </h3>
      </div>
      
      <Tabs defaultValue="response" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="response">Ma Réponse</TabsTrigger>
          <TabsTrigger value="preferences">Paramètres Avancés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="response" className="py-6 space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${currentLevel.color} mb-2`}>
                {currentLevel.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentLevel.fullLabel}
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              {agreementLevels.map((level) => (
                <Button
                  key={level.value}
                  variant={Math.abs(level.value - (answer?.value || 60)) <= 10 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onAnswerChange([level.value])}
                  className={`flex flex-col p-3 h-auto ${level.color}`}
                >
                  <span className="font-bold text-lg">{level.label}</span>
                  <span className="text-xs text-center leading-tight">{level.fullLabel}</span>
                </Button>
              ))}
            </div>
            
            <div>
              <Slider
                value={[answer?.value || 60]}
                max={100}
                min={20}
                step={1}
                onValueChange={onAnswerChange}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Pas du tout d'accord</span>
                <span>Tout à fait d'accord</span>
              </div>
            </div>
          </div>
          
          <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg border border-rose-200 dark:border-rose-700">
            <p className="text-rose-800 dark:text-rose-200 text-sm">
              <strong>Échelle :</strong> Indiquez votre niveau d'accord avec cette affirmation. 
              Cette réponse sera utilisée pour calculer votre compatibilité avec de futurs partenaires.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6 py-4">
          {onWeightChange && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Importance de cette question: {((answer?.weight || question.weight) / 2 * 10).toFixed(1)}</Label>
                <span className="text-xs text-gray-500">Par défaut: {(question.weight / 2 * 10).toFixed(1)}</span>
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
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Augmentez l'importance pour que cette question ait plus d'influence sur votre score de compatibilité
              </p>
            </div>
          )}
          
          {question.isBreaker && (
            <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
              <div className="flex items-center space-x-2">
                <Switch
                  id="dealbreaker"
                  checked={isDealbreaker}
                  onCheckedChange={onDealbreakerChange}
                />
                <Label htmlFor="dealbreaker" className="text-amber-800 dark:text-amber-200">
                  Marquer comme critère non négociable
                </Label>
              </div>
              {isDealbreaker && (
                <div className="space-y-2">
                  <Label className="text-amber-800 dark:text-amber-200">
                    Niveau minimum acceptable: {breakerThreshold}%
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
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Les partenaires avec des réponses en dessous de ce seuil seront exclus de vos résultats
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
