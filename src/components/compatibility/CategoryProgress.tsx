
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { questions } from "@/data/compatibilityQuestions";

interface CategoryProgressProps {
  currentQuestion: number;
  answers: Record<number, any>;
}

const CategoryProgress = ({ currentQuestion, answers }: CategoryProgressProps) => {
  const currentQuestionData = questions[currentQuestion];
  const currentCategory = currentQuestionData?.category;
  
  // Calculate progress by category
  const categoryProgress = questions.reduce((acc, question, index) => {
    if (!acc[question.category]) {
      acc[question.category] = { total: 0, answered: 0 };
    }
    acc[question.category].total++;
    if (answers[index]) {
      acc[question.category].answered++;
    }
    return acc;
  }, {} as Record<string, { total: number; answered: number }>);

  const categories = Object.keys(categoryProgress);
  const currentCategoryIndex = categories.indexOf(currentCategory);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        {categories.map((category, index) => {
          const progress = categoryProgress[category];
          const isCompleted = progress.answered === progress.total;
          const isCurrent = category === currentCategory;
          
          return (
            <Badge
              key={category}
              variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"}
              className={`text-xs px-2 py-1 ${
                isCurrent ? "bg-rose-100 text-rose-800 border-rose-300" : ""
              }`}
            >
              {category} ({progress.answered}/{progress.total})
            </Badge>
          );
        })}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Catégorie actuelle: {currentCategory}</span>
          <span>{categoryProgress[currentCategory]?.answered || 0}/{categoryProgress[currentCategory]?.total || 0}</span>
        </div>
        <Progress 
          value={(categoryProgress[currentCategory]?.answered || 0) / (categoryProgress[currentCategory]?.total || 1) * 100}
          className="h-2"
        />
      </div>
    </div>
  );
};

export default CategoryProgress;
