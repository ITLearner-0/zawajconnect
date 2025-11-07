import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Brain } from 'lucide-react';
import type { MatchProfile } from '@/types/supabase';
import MatchCard from './MatchCard';

interface MatchResultsGridProps {
  matches: MatchProfile[];
  familyApprovalRequired: boolean;
  analyzing: boolean;
}

const MatchResultsGrid = ({ matches, familyApprovalRequired, analyzing }: MatchResultsGridProps) => {
  if (analyzing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Brain className="h-4 w-4 animate-pulse" />
          Analyse des profils avec intelligence artificielle...
        </div>
        <Progress value={66} className="h-2" />
      </div>
    );
  }

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h3 className="text-xl font-semibold">
            Résultats du Matching
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {matches.length} profils compatibles trouvés
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          <Sparkles className="h-3 w-3 mr-1" />
          IA Activée
        </Badge>
      </div>

      <div className="grid gap-5">
        {matches.map((match) => (
          <MatchCard 
            key={match.user_id} 
            match={match} 
            familyApprovalRequired={familyApprovalRequired}
          />
        ))}
      </div>
    </div>
  );
};

export default MatchResultsGrid;