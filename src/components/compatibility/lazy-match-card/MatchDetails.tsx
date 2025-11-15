import React from 'react';
import { Badge } from '@/components/ui/badge';

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
            {details.dealbreakers.map((item) => (
              <Badge key={item} variant="destructive">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {details.strengths.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-600">Strengths</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {details.strengths.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {details.differences.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-amber-600">Differences</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {details.differences.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;
