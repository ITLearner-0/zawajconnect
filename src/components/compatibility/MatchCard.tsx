
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CompatibilityMatch } from "@/types/compatibility";

interface MatchCardProps {
  match: CompatibilityMatch;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card key={match.userId} className="overflow-hidden">
      <div 
        className="p-4 bg-white rounded-lg flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-left">
          <span className="font-medium">
            {match.profileData ? 
              `${match.profileData.first_name} ${match.profileData.last_name?.charAt(0) || ""}` : 
              `Match #${match.userId.slice(0, 4)}`}
          </span>
          {match.profileData && (
            <p className="text-sm text-gray-500">
              {[
                match.profileData.age ? `${match.profileData.age} years` : null,
                match.profileData.location,
                match.profileData.religious_practice_level
              ].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center">
            <Progress 
              value={match.score} 
              className="w-24 h-2 mr-2" 
              indicatorClassName={
                match.score >= 80 ? "bg-green-500" : 
                match.score >= 60 ? "bg-blue-500" :
                match.score >= 40 ? "bg-yellow-500" : "bg-red-500"
              }
            />
            <span className={`font-semibold ${
              match.score >= 80 ? "text-green-600" : 
              match.score >= 60 ? "text-blue-600" :
              match.score >= 40 ? "text-yellow-600" : "text-red-600"
            }`}>
              {match.score}%
            </span>
          </div>
        </div>
      </div>
      
      {expanded && match.matchDetails && (
        <CardContent className="pt-4 pb-4 bg-gray-50">
          <MatchDetails details={match.matchDetails} />
        </CardContent>
      )}
    </Card>
  );
};

interface MatchDetailsProps {
  details: {
    strengths: string[];
    differences: string[];
    dealbreakers?: string[];
  };
}

const MatchDetails = ({ details }: MatchDetailsProps) => {
  return (
    <div className="space-y-3 text-left">
      {details.dealbreakers && details.dealbreakers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-600">Dealbreakers</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {details.dealbreakers.map(item => (
              <Badge key={item} variant="destructive">{item}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {details.strengths.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-600">Strengths</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {details.strengths.map(item => (
              <Badge key={item} variant="outline" className="bg-green-50 text-green-700 border-green-200">{item}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {details.differences.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-amber-600">Differences</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {details.differences.map(item => (
              <Badge key={item} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{item}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCard;
