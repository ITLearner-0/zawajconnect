import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CategoryGroupProps {
  category: string;
  questions: any[];
  currentQuestionIndex: number;
  answers: Record<number, any>;
  totalQuestions: number;
}

const CategoryGroup = ({
  category,
  questions,
  currentQuestionIndex,
  answers,
  totalQuestions,
}: CategoryGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const categoryQuestionIndices = questions.map((_, idx) => idx);
  const answeredInCategory = categoryQuestionIndices.filter((idx) => answers[idx]).length;
  const isCurrentCategory = categoryQuestionIndices.includes(currentQuestionIndex);
  const progress = (answeredInCategory / questions.length) * 100;

  const getStatusColor = () => {
    if (progress === 100) return 'bg-green-500';
    if (isCurrentCategory) return 'bg-blue-500';
    if (progress > 0) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getStatusText = () => {
    if (progress === 100) return 'Terminé';
    if (isCurrentCategory) return 'En cours';
    if (progress > 0) return 'Commencé';
    return 'À faire';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <div className="text-left">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{category}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {answeredInCategory} sur {questions.length} questions répondues
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isCurrentCategory ? 'default' : 'outline'}
            className={`${getStatusColor()} text-white text-xs`}
          >
            {getStatusText()}
          </Badge>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="grid gap-2">
            {questions.map((question, localIdx) => {
              const globalIdx = categoryQuestionIndices[localIdx];
              const isAnswered = !!answers[globalIdx];
              const isCurrent = globalIdx === currentQuestionIndex;

              return (
                <div
                  key={question.id}
                  className={`p-2 rounded text-sm border ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : isAnswered
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isCurrent ? 'bg-blue-500' : isAnswered ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Q{globalIdx + 1}
                    </span>
                    <span
                      className={`flex-1 ${
                        isCurrent ? 'font-medium text-blue-900 dark:text-blue-100' : ''
                      }`}
                    >
                      {question.question}
                    </span>
                  </div>
                  {isAnswered && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Réponse: {answers[globalIdx].value}%
                      {answers[globalIdx].isBreaker && ' (Critère non négociable)'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CategoryGroup;
