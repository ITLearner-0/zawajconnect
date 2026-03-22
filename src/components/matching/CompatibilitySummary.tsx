/**
 * CompatibilitySummary - Shows WHY two profiles matched
 *
 * Displays compatibility breakdown with labeled dimensions,
 * strengths, and areas of difference. Used on profile view
 * when the viewer has a match with the profile.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  BookOpen,
  Globe,
  Users,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export interface CompatibilityDimension {
  key: string;
  label: string;
  score: number;
  icon: React.ReactNode;
  detail?: string;
}

interface CompatibilitySummaryProps {
  overallScore: number;
  dimensions: CompatibilityDimension[];
  strengths?: string[];
  differences?: string[];
}

function scoreColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-gray-400';
}

function scoreTextColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-gray-500';
}

function scoreLabel(score: number) {
  if (score >= 90) return 'Excellente';
  if (score >= 75) return 'Très bonne';
  if (score >= 60) return 'Bonne';
  if (score >= 40) return 'Moyenne';
  return 'Faible';
}

export const CompatibilitySummary = ({
  overallScore,
  dimensions,
  strengths = [],
  differences = [],
}: CompatibilitySummaryProps) => {
  return (
    <Card className="border-emerald-200/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          Compatibilité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Overall Score Circle */}
        <div className="flex items-center gap-4">
          <div
            className={`h-16 w-16 rounded-full flex items-center justify-center border-4 ${
              overallScore >= 80
                ? 'border-emerald-400 bg-emerald-50'
                : overallScore >= 60
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-gray-300 bg-gray-50'
            }`}
          >
            <span className={`text-xl font-bold ${scoreTextColor(overallScore)}`}>
              {overallScore}%
            </span>
          </div>
          <div>
            <p className={`font-semibold ${scoreTextColor(overallScore)}`}>
              {scoreLabel(overallScore)} compatibilité
            </p>
            <p className="text-sm text-muted-foreground">
              Basé sur {dimensions.length} dimensions
            </p>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="space-y-3">
          {dimensions.map((dim) => (
            <div key={dim.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {dim.icon}
                  <span className="font-medium">{dim.label}</span>
                </div>
                <span className={`text-sm font-semibold ${scoreTextColor(dim.score)}`}>
                  {dim.score}%
                </span>
              </div>
              <Progress
                value={dim.score}
                className="h-1.5"
              />
              {dim.detail && (
                <p className="text-xs text-muted-foreground pl-6">{dim.detail}</p>
              )}
            </div>
          ))}
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Points forts
            </h4>
            <ul className="space-y-1">
              {strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <TrendingUp className="h-3 w-3 text-emerald-500 mt-1 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Differences */}
        {differences.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-1.5 text-amber-700">
              <AlertCircle className="h-4 w-4" />
              Points de discussion
            </h4>
            <ul className="space-y-1">
              {differences.map((d, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <AlertCircle className="h-3 w-3 text-amber-500 mt-1 flex-shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Helper: Build default dimensions from basic profile comparison data.
 * Use this when you don't have detailed compatibility scores.
 */
export function buildDefaultDimensions(scores: {
  islamic?: number;
  cultural?: number;
  personality?: number;
  family?: number;
  lifestyle?: number;
}): CompatibilityDimension[] {
  const dims: CompatibilityDimension[] = [];

  if (scores.islamic !== undefined) {
    dims.push({
      key: 'islamic',
      label: 'Pratique religieuse',
      score: scores.islamic,
      icon: <BookOpen className="h-4 w-4 text-emerald-500" />,
    });
  }
  if (scores.cultural !== undefined) {
    dims.push({
      key: 'cultural',
      label: 'Affinités culturelles',
      score: scores.cultural,
      icon: <Globe className="h-4 w-4 text-blue-500" />,
    });
  }
  if (scores.personality !== undefined) {
    dims.push({
      key: 'personality',
      label: 'Personnalité',
      score: scores.personality,
      icon: <Heart className="h-4 w-4 text-rose-500" />,
    });
  }
  if (scores.family !== undefined) {
    dims.push({
      key: 'family',
      label: 'Vision familiale',
      score: scores.family,
      icon: <Users className="h-4 w-4 text-purple-500" />,
    });
  }
  if (scores.lifestyle !== undefined) {
    dims.push({
      key: 'lifestyle',
      label: 'Mode de vie',
      score: scores.lifestyle,
      icon: <Sparkles className="h-4 w-4 text-amber-500" />,
    });
  }

  return dims;
}

export default CompatibilitySummary;
