
import { Card } from "@/components/ui/card";
import CustomButton from "../CustomButton";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Users, Heart } from "lucide-react";

interface ResultsDisplayProps {
  score: number;
  onRetake: () => void;
}

const ResultsDisplay = ({ score, onRetake }: ResultsDisplayProps) => {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Excellent compatibility foundation! You're ready to find meaningful matches.";
    if (score >= 60) return "Good compatibility potential! Your preferences will help find suitable matches.";
    return "Your preferences are recorded. We'll help you find compatible matches.";
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Compatibility Test Complete!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your compatibility profile has been created successfully
        </p>
      </div>

      <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-6 rounded-lg">
        <div className="text-4xl font-bold mb-2">
          <span className={getScoreColor(score)}>{score}%</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          {getScoreMessage(score)}
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-800 dark:text-blue-200">
            Ready to Find Your Match?
          </span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
          Now you can view profiles with compatibility percentages and find meaningful connections based on your Islamic values.
        </p>
        <div className="flex gap-3 justify-center">
          <CustomButton
            onClick={() => navigate("/nearby")}
            variant="default"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Users className="h-4 w-4" />
            Explore Matches
          </CustomButton>
          <CustomButton
            onClick={() => navigate("/profile")}
            variant="outline"
          >
            Back to Profile
          </CustomButton>
        </div>
      </div>

      <div className="border-t pt-4">
        <CustomButton
          onClick={onRetake}
          variant="outline"
          className="text-sm"
        >
          Retake Test
        </CustomButton>
      </div>
    </div>
  );
};

export default ResultsDisplay;
