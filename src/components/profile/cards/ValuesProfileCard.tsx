import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface ValueDimension {
  label: string;
  score: number;
}

interface ValuesProfileCardProps {
  dimensions?: ValueDimension[];
  totalResponses?: number;
}

const DEFAULT_DIMENSIONS: ValueDimension[] = [
  { label: 'Pratique religieuse', score: 0 },
  { label: 'Importance famille', score: 0 },
  { label: 'Ambition éducation', score: 0 },
  { label: 'Style de vie social', score: 0 },
  { label: 'Approche parentale', score: 0 },
  { label: 'Vision financière', score: 0 },
];

const getBarColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-green-400';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-gray-400';
};

const ValuesProfileCard = ({
  dimensions = DEFAULT_DIMENSIONS,
  totalResponses = 0,
}: ValuesProfileCardProps) => {
  const hasData = totalResponses > 0;

  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Profil de valeurs
          </CardTitle>
          {hasData && (
            <Badge variant="secondary" className="text-xs">
              Basé sur {totalResponses} réponses
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
            {dimensions.map((dim) => (
              <div key={dim.label} className="space-y-1">
                <p className="text-xs text-muted-foreground">{dim.label}</p>
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden" style={{ height: 8, borderRadius: 4 }}>
                  <div
                    className={`h-full transition-all duration-500 ${getBarColor(dim.score)}`}
                    style={{ width: `${dim.score}%`, borderRadius: 4 }}
                  />
                </div>
                <p className="text-xs font-medium">{dim.score}%</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Répondez aux questions quotidiennes pour construire votre profil de valeurs
            </p>
            <p className="text-xs text-muted-foreground italic">
              Disponible prochainement
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValuesProfileCard;
