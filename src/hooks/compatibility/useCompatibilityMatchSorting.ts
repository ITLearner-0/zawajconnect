
import { CompatibilityMatch } from "@/types/compatibility";

export function sortCompatibilityMatches(matches: CompatibilityMatch[]): CompatibilityMatch[] {
  return matches
    .filter(match => (match.score ?? match.compatibilityScore ?? 0) > 0) // Filter out completely incompatible matches
    .sort((a, b) => {
      // Primary sort by score
      const aScore = a.score ?? a.compatibilityScore ?? 0;
      const bScore = b.score ?? b.compatibilityScore ?? 0;
      if (bScore !== aScore) return bScore - aScore;
      
      // Secondary sort by verification status (if available)
      if (a.profileData && b.profileData) {
        const aVerified = (a.profileData.email_verified ? 1 : 0) + 
                         (a.profileData.phone_verified ? 1 : 0) + 
                         (a.profileData.id_verified ? 1 : 0);
        const bVerified = (b.profileData.email_verified ? 1 : 0) + 
                         (b.profileData.phone_verified ? 1 : 0) + 
                         (b.profileData.id_verified ? 1 : 0);
        
        return bVerified - aVerified;
      }
      
      return 0;
    });
}
