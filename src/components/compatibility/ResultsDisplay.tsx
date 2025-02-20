
import CustomButton from "../CustomButton";

interface ResultsDisplayProps {
  score: number;
  onRetake: () => void;
}

const ResultsDisplay = ({ score, onRetake }: ResultsDisplayProps) => {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-semibold">Your Compatibility Profile</h2>
      <div className="text-6xl font-bold text-primary">{score}%</div>
      <p className="text-gray-600">
        Based on your weighted answers and preferences, this is your compatibility profile score.
        Your responses have been saved and will be used for future matching.
      </p>
      <CustomButton onClick={onRetake} variant="outline">
        Take Test Again
      </CustomButton>
    </div>
  );
};

export default ResultsDisplay;
