import { Users } from 'lucide-react';
import { ZBadge } from '@/components/ui/ZBadge';

interface FamilyContribution {
  quote: string;
  author: string;
  relationship: string;
}

interface FamilyCardProps {
  contribution?: FamilyContribution;
  familyCriteria?: string[];
  waliActive?: boolean;
}

const FamilyCard = ({ contribution, familyCriteria, waliActive = false }: FamilyCardProps) => {
  const hasData = !!contribution;

  return (
    <div
      className="rounded-2xl md:col-span-2"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
    >
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <h3
            className="text-base font-semibold flex items-center gap-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Users className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            La famille se présente
          </h3>
          {waliActive && (
            <ZBadge variant="info">
              Co-créé en famille
            </ZBadge>
          )}
        </div>
      </div>
      <div className="px-4 pb-4">
        {hasData ? (
          <div className="space-y-4">
            <blockquote
              className="pl-4 italic text-sm"
              style={{
                borderLeft: '4px solid var(--color-primary)',
                color: 'var(--color-text-muted)',
              }}
            >
              "{contribution.quote}"
              <footer className="mt-1 not-italic text-xs">
                — {contribution.author}, {contribution.relationship}
              </footer>
            </blockquote>

            {familyCriteria && familyCriteria.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  Ce que la famille recherche
                </p>
                <div className="flex flex-wrap gap-2">
                  {familyCriteria.map((criteria) => (
                    <ZBadge key={criteria} variant="muted">
                      {criteria}
                    </ZBadge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 space-y-2">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Invitez votre famille à contribuer à votre profil
            </p>
            <p className="text-xs italic" style={{ color: 'var(--color-text-hint)' }}>
              Le Wali ou un membre de la famille peut ajouter une présentation et des critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyCard;
