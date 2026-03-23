import { Sparkles } from 'lucide-react';
import { ZBadge } from '@/components/ui/ZBadge';

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

const ValuesProfileCard = ({
  dimensions = DEFAULT_DIMENSIONS,
  totalResponses = 0,
}: ValuesProfileCardProps) => {
  const hasData = totalResponses > 0;

  return (
    <div
      className="rounded-2xl"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
    >
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <h3
            className="text-base font-semibold flex items-center gap-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Sparkles className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            Profil de valeurs
          </h3>
          {hasData && (
            <ZBadge variant="muted">
              Basé sur {totalResponses} réponses
            </ZBadge>
          )}
        </div>
      </div>
      <div className="px-4 pb-4">
        {hasData ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
            {dimensions.map((dim) => (
              <div key={dim.label} className="space-y-1">
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{dim.label}</p>
                <div
                  className="rounded-full overflow-hidden"
                  style={{ height: 8, borderRadius: 4, background: 'var(--color-border-subtle)' }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${dim.score}%`,
                      borderRadius: 4,
                      background: dim.score >= 60 ? 'var(--color-primary)' : dim.score >= 40 ? 'var(--color-warning)' : 'var(--color-text-disabled)',
                    }}
                  />
                </div>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{dim.score}%</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 space-y-2">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Répondez aux questions quotidiennes pour construire votre profil de valeurs
            </p>
            <p className="text-xs italic" style={{ color: 'var(--color-text-hint)' }}>
              Disponible prochainement
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuesProfileCard;
