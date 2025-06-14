
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface CompatibilityScoreProps {
  score: number;
}

const CompatibilityScore = ({ score }: CompatibilityScoreProps) => {
  return (
    <div className="text-right ml-4" role="group" aria-label="Compatibility score">
      <div className="flex items-center">
        <Progress 
          value={score} 
          className="w-24 h-2 mr-2" 
          indicatorClassName={
            score >= 80 ? "bg-green-500" : 
            score >= 60 ? "bg-blue-500" :
            score >= 40 ? "bg-yellow-500" : "bg-red-500"
          }
          aria-label={`Compatibility score: ${score} percent`}
        />
        <span className={`font-semibold ${
          score >= 80 ? "text-green-600" : 
          score >= 60 ? "text-blue-600" :
          score >= 40 ? "text-yellow-600" : "text-red-600"
        }`}>
          {score}%
        </span>
      </div>
    </div>
  );
};

export default CompatibilityScore;
