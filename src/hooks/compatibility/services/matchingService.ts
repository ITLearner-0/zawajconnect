
import { supabase } from "@/integrations/supabase/client";
import { CompatibilityMatch } from "@/types/compatibility";
import { MatchingFilters, UserResultWithProfile } from "../types/matchingTypes";
import { applyFilters } from "../utils/matchingFilters";
import { calculateEnhancedCompatibilityScore } from "../utils/enhancedCompatibilityScoring";

export async function findCompatibilityMatches(
  userId: string,
  filters?: MatchingFilters
): Promise<CompatibilityMatch[]> {
  try {
    // Get current user's compatibility results
    const { data: myResults } = await supabase
      .from('compatibility_results')
      .select('answers, preferences')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!myResults) {
      throw new Error("Vous devez d'abord passer le test de compatibilité");
    }

    // Get other users' results with profile data
    const { data: otherUsers, error } = await supabase
      .from('compatibility_results')
      .select(`
        user_id,
        answers,
        preferences,
        profiles!inner(
          first_name,
          last_name,
          gender,
          location,
          birth_date,
          religious_practice_level,
          education_level,
          email_verified,
          phone_verified,
          id_verified,
          is_visible
        )
      `)
      .neq('user_id', userId)
      .eq('profiles.is_visible', true);

    if (error) throw error;

    if (!otherUsers?.length) {
      return [];
    }

    // Apply filters and calculate compatibility scores
    const matches = otherUsers
      .filter((user: UserResultWithProfile) => applyFilters(user, filters))
      .map((user: UserResultWithProfile) => calculateEnhancedCompatibilityScore(myResults, user))
      .filter(match => match.score >= (filters?.minCompatibilityScore || 50))
      .sort((a, b) => b.score - a.score);

    return matches.slice(0, 20); // Limit to top 20 matches
  } catch (error) {
    console.error('Error finding matches:', error);
    throw error;
  }
}
