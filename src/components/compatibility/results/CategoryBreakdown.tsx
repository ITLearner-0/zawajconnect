import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { questions } from '@/data/compatibilityQuestions';

interface CategoryBreakdownProps {
  answers: Record<number, any>;
}

const CategoryBreakdown = ({ answers }: CategoryBreakdownProps) => {
  // Calculate category-wise scores
  const categoryScores = questions.reduce(
    (acc, question, index) => {
      if (!acc[question.category]) {
        acc[question.category] = { total: 0, weight: 0, count: 0 };
      }

      const answer = answers[index];
      if (answer) {
        const effectiveWeight = answer.weight || question.weight;
        acc[question.category]!.total += answer.value * effectiveWeight;
        acc[question.category]!.weight += effectiveWeight;
        acc[question.category]!.count++;
      }

      return acc;
    },
    {} as Record<string, { total: number; weight: number; count: number }>
  );

  // Calculate percentages for each category
  const categoryPercentages = Object.entries(categoryScores)
    .map(([category, data]) => ({
      category,
      percentage: data.weight > 0 ? Math.round((data.total / (data.weight * 100)) * 100) : 0,
      answered: data.count,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
      <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Analyse par Catégorie
      </h4>
      <div className="grid gap-3 md:grid-cols-2">
        {categoryPercentages.slice(0, 6).map(({ category, percentage }) => (
          <div key={category} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {category}
              </span>
              <Badge
                variant={percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'outline'}
              >
                {percentage}%
              </Badge>
            </div>
            <Progress
              value={percentage}
              className="h-2"
              indicatorClassName={
                percentage >= 80
                  ? 'bg-green-500'
                  : percentage >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }
            />
          </div>
        ))}
      </div>

      {categoryPercentages.length > 6 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Voir toutes les catégories...
          </summary>
          <div className="grid gap-3 md:grid-cols-2 mt-3">
            {categoryPercentages.slice(6).map(({ category, percentage }) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {category}
                  </span>
                  <Badge
                    variant={
                      percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'outline'
                    }
                  >
                    {percentage}%
                  </Badge>
                </div>
                <Progress
                  value={percentage}
                  className="h-2"
                  indicatorClassName={
                    percentage >= 80
                      ? 'bg-green-500'
                      : percentage >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }
                />
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default CategoryBreakdown;
