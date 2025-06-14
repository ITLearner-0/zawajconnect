
import CustomButton from "../CustomButton";
import ScoreDisplay from "./results/ScoreDisplay";
import CategoryBreakdown from "./results/CategoryBreakdown";
import ActionButtons from "./results/ActionButtons";
import IslamicReminder from "./results/IslamicReminder";

interface EnhancedResultsDisplayProps {
  score: number;
  answers: Record<number, any>;
  onRetake: () => void;
}

const EnhancedResultsDisplay = ({ score, answers, onRetake }: EnhancedResultsDisplayProps) => {
  return (
    <div className="text-center space-y-6">
      <ScoreDisplay score={score} />
      <CategoryBreakdown answers={answers} />
      <ActionButtons />
      <IslamicReminder />

      <div className="border-t pt-4">
        <CustomButton
          onClick={onRetake}
          variant="outline"
          className="text-sm"
        >
          Refaire le Test
        </CustomButton>
      </div>
    </div>
  );
};

export default EnhancedResultsDisplay;
