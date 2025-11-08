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
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b pb-3">
        <h3 className="text-lg font-semibold">
          Résultats du Matching
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {matches.length} profils compatibles trouvés
        </p>
      </div>

      {/* List of Matches */}
      <div className="space-y-3">
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