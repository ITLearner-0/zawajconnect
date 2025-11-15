import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Brain } from 'lucide-react';
import type { MatchProfile } from '@/types/supabase';
import MatchCard from './MatchCard';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface MatchResultsGridProps {
  matches: MatchProfile[];
  familyApprovalRequired: boolean;
  analyzing: boolean;
}

const MatchResultsGrid = ({
  matches,
  familyApprovalRequired,
  analyzing,
}: MatchResultsGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 10;

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

  const totalPages = Math.ceil(matches.length / matchesPerPage);
  const startIndex = (currentPage - 1) * matchesPerPage;
  const endIndex = startIndex + matchesPerPage;
  const currentMatches = matches.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b pb-3">
        <h3 className="text-lg font-semibold">Résultats du Matching</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {matches.length} profils compatibles trouvés
        </p>
      </div>

      {/* List of Matches */}
      <div className="space-y-3">
        {currentMatches.map((match) => (
          <MatchCard
            key={match.user_id}
            match={match}
            familyApprovalRequired={familyApprovalRequired}
          />
        ))}
      </div>

      {/* Traditional Pagination */}
      {matches.length > matchesPerPage && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => {
              const pageNumber = i + 1;

              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                return <PaginationEllipsis key={i} />;
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={
                  currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default MatchResultsGrid;
