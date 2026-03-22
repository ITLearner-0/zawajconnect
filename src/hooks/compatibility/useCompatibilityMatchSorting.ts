import { CompatibilityMatch } from '@/types/compatibility';

export function sortCompatibilityMatches(matches: CompatibilityMatch[]): CompatibilityMatch[] {
  return matches
    .filter((match) => (match.score ?? match.compatibilityScore ?? 0) > 0) // Filter out completely incompatible matches
    .sort((a, b) => {
      // Primary sort by score
      const aScore = a.score ?? a.compatibilityScore ?? 0;
      const bScore = b.score ?? b.compatibilityScore ?? 0;
      if (bScore !== aScore) return bScore - aScore;

      return 0;
    });
}
