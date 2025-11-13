
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Play, 
  Users, 
  MessageSquare, 
  Heart, 
  BookOpen,
  Star
} from "lucide-react";
import { demoTutorialSteps } from '@/data/demoPersonas';

interface InteractiveTutorialProps {
  onStepComplete?: (stepId: string) => void;
  onTutorialComplete?: () => void;
  autoStart?: boolean;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  onStepComplete,
  onTutorialComplete,
  autoStart = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(autoStart);
  const [showTutorial, setShowTutorial] = useState(true);

  const steps = demoTutorialSteps;
  const progress = (completedSteps.length / steps.length) * 100;

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'welcome': return Play;
      case 'profiles': return Users;
      case 'messaging': return MessageSquare;
      case 'compatibility': return Heart;
      case 'resources': return BookOpen;
      default: return Star;
    }
  };

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompleted = [...completedSteps, stepId];
      setCompletedSteps(newCompleted);
      onStepComplete?.(stepId);
      
      if (newCompleted.length === steps.length) {
        onTutorialComplete?.();
      }
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (steps[currentStep]) handleStepComplete(steps[currentStep].id);
      setCurrentStep(currentStep + 1);
    } else {
      if (steps[currentStep]) handleStepComplete(steps[currentStep].id);
      setIsActive(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  if (!showTutorial) return null;

  if (!isActive) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 shadow-2xl border-rose-200 dark:border-rose-700 z-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-rose-800 dark:text-rose-200">
              Tutoriel Interactif
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTutorial(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </Button>
          </div>
          <CardDescription>
            Découvrez toutes les fonctionnalités de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-rose-600 dark:text-rose-300">Progression</span>
              <span className="text-rose-500 dark:text-rose-400">{completedSteps.length}/{steps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <Button 
              onClick={startTutorial}
              className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              {completedSteps.length > 0 ? 'Continuer le tutoriel' : 'Commencer le tutoriel'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData ? getStepIcon(currentStepData.id) : Play;
  
  if (!currentStepData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-rose-200 dark:border-rose-700">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-rose-200">
              Étape {currentStep + 1} sur {steps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsActive(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 p-3 rounded-full">
              <StepIcon className="h-8 w-8 text-rose-600 dark:text-rose-300" />
            </div>
            <div>
              <CardTitle className="text-2xl text-rose-800 dark:text-rose-200">
                {currentStepData.title}
              </CardTitle>
              <Progress value={((currentStep + 1) / steps.length) * 100} className="h-1 mt-2" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <CardDescription className="text-lg text-rose-600 dark:text-rose-300">
            {currentStepData.content}
          </CardDescription>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-rose-500 scale-125'
                    : completedSteps.includes(step.id)
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            <div className="flex items-center gap-2">
              {completedSteps.includes(currentStepData.id) && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Terminé
                </Badge>
              )}
            </div>

            <Button
              onClick={nextStep}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white"
            >
              {currentStep === steps.length - 1 ? 'Terminer' : currentStepData.action}
              {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveTutorial;
