import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

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
    <Card className="dark:bg-gray-900 dark:border-gray-800 md:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            La famille se présente
          </CardTitle>
          {waliActive && (
            <Badge
              className="text-xs border-0"
              style={{ background: '#0C447C', color: '#B5D4F4' }}
            >
              Co-créé en famille
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-4">
            <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-sm text-muted-foreground">
              "{contribution.quote}"
              <footer className="mt-1 not-italic text-xs">
                — {contribution.author}, {contribution.relationship}
              </footer>
            </blockquote>

            {familyCriteria && familyCriteria.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Ce que la famille recherche
                </p>
                <div className="flex flex-wrap gap-2">
                  {familyCriteria.map((criteria) => (
                    <Badge key={criteria} variant="secondary" className="text-xs">
                      {criteria}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Invitez votre famille à contribuer à votre profil
            </p>
            <p className="text-xs text-muted-foreground italic">
              Le Wali ou un membre de la famille peut ajouter une présentation et des critères de recherche
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyCard;
