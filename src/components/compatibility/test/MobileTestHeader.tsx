import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ChevronLeft } from 'lucide-react';
import { questions } from '@/data/compatibilityQuestions';
import CategoryGroup from './CategoryGroup';
import { Answer } from '@/types/compatibility';

interface MobileTestHeaderProps {
  currentQuestion: number;
  answers: Record<number, Answer>;
  onQuestionSelect?: (index: number) => void;
}

const MobileTestHeader = ({
  currentQuestion,
  answers,
  onQuestionSelect,
}: MobileTestHeaderProps) => {
  // Group questions by category
  const questionsByCategory = questions.reduce(
    (acc, question, index) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push({ ...question, originalIndex: index });
      return acc;
    },
    {} as Record<string, any[]>
  );

  const currentQuestionData = questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 md:p-6">
      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <div className="space-y-4 mt-6">
              <h2 className="text-lg font-semibold mb-4">Progression par catégorie</h2>
              {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
                <CategoryGroup
                  key={category}
                  category={category}
                  questions={categoryQuestions}
                  currentQuestionIndex={currentQuestion}
                  answers={answers}
                  totalQuestions={questions.length}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <div className="text-center flex-1 px-4">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Question {currentQuestion + 1}/{questions.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {currentQuestionData?.category}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progressPercentage} className="h-2 md:h-3" />
        <div className="flex justify-between items-center text-xs md:text-sm text-gray-600 dark:text-gray-400">
          <span className="hidden md:inline">
            Question {currentQuestion + 1} sur {questions.length}
          </span>
          <span className="md:hidden">{Math.round(progressPercentage)}% terminé</span>
          <span className="hidden md:inline">{Math.round(progressPercentage)}% terminé</span>
        </div>
      </div>

      {/* Desktop Category Navigation */}
      <div className="hidden md:block mt-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => {
            const categoryIndices = categoryQuestions.map((q) => q.originalIndex);
            const answeredInCategory = categoryIndices.filter((idx) => answers[idx]).length;
            const isCurrentCategory = categoryIndices.includes(currentQuestion);
            const progress = (answeredInCategory / categoryQuestions.length) * 100;

            return (
              <Button
                key={category}
                variant={isCurrentCategory ? 'default' : 'outline'}
                size="sm"
                className={`text-xs transition-all ${
                  progress === 100 ? 'bg-green-100 border-green-300 text-green-800' : ''
                } ${isCurrentCategory ? 'ring-2 ring-blue-300' : ''}`}
              >
                <span className="truncate max-w-[120px]">{category}</span>
                <span className="ml-1 text-xs opacity-75">
                  ({answeredInCategory}/{categoryQuestions.length})
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileTestHeader;
