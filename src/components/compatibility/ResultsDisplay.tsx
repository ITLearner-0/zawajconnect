
import { useState } from "react";
import CustomButton from "../CustomButton";
import { useNavigate } from "react-router-dom";
import MatchList from "./MatchList";
import { useCompatibilityMatches } from "@/hooks/useCompatibilityMatches";
import { MessageSquare } from "lucide-react";

interface ResultsDisplayProps {
  score: number;
  onRetake: () => void;
}

const ResultsDisplay = ({ score, onRetake }: ResultsDisplayProps) => {
  const navigate = useNavigate();
  const { matchScores, loading } = useCompatibilityMatches();

  return (
    <div className="text-center space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Your Compatibility Profile</h2>
        <div className="text-6xl font-bold text-primary mt-4">{score}%</div>
        <p className="text-gray-600 mt-2">
          Your compatibility preferences have been saved
        </p>
      </div>

      {matchScores.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Potential Matches</h3>
          {loading ? (
            <p className="text-gray-500">Loading matches...</p>
          ) : (
            <MatchList matches={matchScores} />
          )}
        </div>
      )}

      <div className="mt-6 space-y-3">
        <CustomButton onClick={onRetake} variant="outline">
          Take Test Again
        </CustomButton>
        
        <div className="flex space-x-3 justify-center">
          <CustomButton onClick={() => navigate('/nearby')} variant="default">
            Find Nearby Matches
          </CustomButton>
          
          <CustomButton onClick={() => navigate('/messages')} variant="secondary">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
