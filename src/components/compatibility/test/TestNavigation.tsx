
import CustomButton from "../../CustomButton";

interface TestNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  hasAnswer: boolean;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const TestNavigation = ({ 
  currentQuestion, 
  totalQuestions, 
  hasAnswer, 
  loading, 
  onPrevious, 
  onNext 
}: TestNavigationProps) => {
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <div className="flex justify-between items-center mt-6">
      <div>
        {currentQuestion > 0 && (
          <CustomButton variant="outline" onClick={onPrevious}>
            Précédent
          </CustomButton>
        )}
      </div>
      <CustomButton 
        onClick={onNext} 
        disabled={loading || !hasAnswer}
      >
        {isLastQuestion ? (loading ? "Calcul..." : "Voir les Résultats") : "Suivant"}
      </CustomButton>
    </div>
  );
};

export default TestNavigation;
