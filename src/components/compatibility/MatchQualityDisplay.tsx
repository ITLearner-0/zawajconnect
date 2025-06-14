
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MatchQualityMetrics } from "@/hooks/compatibility/services/matchQualityService";
import { CheckCircle, AlertCircle, TrendingUp, Users, Shield, FileText } from "lucide-react";

interface MatchQualityDisplayProps {
  metrics: MatchQualityMetrics;
  compact?: boolean;
}

const MatchQualityDisplay = ({ metrics, compact = false }: MatchQualityDisplayProps) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-yellow-600";
    return "text-orange-600";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 85) return "Very High";
    if (score >= 70) return "High";
    if (score >= 55) return "Moderate";
    return "Low";
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Match Confidence</span>
          <div className="flex items-center gap-2">
            <Progress value={metrics.confidenceScore} className="w-16 h-2" />
            <span className={`text-sm font-semibold ${getConfidenceColor(metrics.confidenceScore)}`}>
              {getConfidenceLabel(metrics.confidenceScore)}
            </span>
          </div>
        </div>
        
        {metrics.compatibilityReasons.length > 0 && (
          <div className="text-xs text-gray-600">
            <strong>Top reason:</strong> {metrics.compatibilityReasons[0]}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Match Quality Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Confidence Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Match Confidence</span>
            <span className={`font-bold ${getConfidenceColor(metrics.confidenceScore)}`}>
              {metrics.confidenceScore}% - {getConfidenceLabel(metrics.confidenceScore)}
            </span>
          </div>
          <Progress value={metrics.confidenceScore} className="h-3" />
          <p className="text-sm text-gray-600 mt-1">
            Based on profile completeness, verification status, and compatibility factors
          </p>
        </div>

        {/* Data Quality Metrics */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Profile Quality
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(metrics.dataQuality.profileCompleteness * 100)}%
              </div>
              <div className="text-xs text-gray-600">Completeness</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(metrics.dataQuality.answersQuality * 100)}%
              </div>
              <div className="text-xs text-gray-600">Answer Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(metrics.dataQuality.verificationLevel * 100)}%
              </div>
              <div className="text-xs text-gray-600">Verified</div>
            </div>
          </div>
        </div>

        {/* Compatibility Reasons */}
        {metrics.compatibilityReasons.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Why You're Compatible
            </h4>
            <div className="space-y-2">
              {metrics.compatibilityReasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvement Suggestions */}
        {metrics.improvementSuggestions.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              Suggestions for Better Connection
            </h4>
            <div className="space-y-2">
              {metrics.improvementSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchQualityDisplay;
