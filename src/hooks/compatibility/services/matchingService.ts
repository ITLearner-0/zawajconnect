
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
    // Single optimized query to get current user's compatibility results
    const { data: myResults, error: myResultsError } = await supabase
      .from('compatibility_results')
      .select('answers, preferences')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (myResultsError || !myResults) {
      throw new Error("Vous devez d'abord passer le test de compatibilité");
    }

    // Single optimized query with JOIN to get other users' results with their profiles
    const { data: otherUsersWithProfiles, error } = await supabase
      .from('compatibility_results')
      .select(`
        user_id,
        answers,
        preferences,
        profiles!inner (
          id,
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

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    if (!otherUsersWithProfiles?.length) {
      return [];
    }

    // Transform the joined data to match our expected type structure
    const usersWithProfiles: UserResultWithProfile[] = otherUsersWithProfiles.map(item => ({
      user_id: item.user_id,
      answers: item.answers as Record<string, any>,
      preferences: item.preferences as any,
      profiles: {
        first_name: item.profiles.first_name,
        last_name: item.profiles.last_name || null,
        gender: item.profiles.gender,
        location: item.profiles.location || null,
        birth_date: item.profiles.birth_date,
        religious_practice_level: item.profiles.religious_practice_level || null,
        education_level: item.profiles.education_level || null,
        email_verified: item.profiles.email_verified || null,
        phone_verified: item.profiles.phone_verified || null,
        id_verified: item.profiles.id_verified || null,
        is_visible: item.profiles.is_visible
      }
    }));

    // Apply filters and calculate compatibility scores
    const matches = usersWithProfiles
      .filter((user) => applyFilters(user, filters))
      .map((user) => calculateEnhancedCompatibilityScore(myResults, user))
      .filter(match => match.score >= (filters?.minCompatibilityScore || 50))
      .sort((a, b) => b.score - a.score);

    return matches.slice(0, 20); // Limit to top 20 matches
  } catch (error) {
    console.error('Error finding matches:', error);
    throw error;
  }
}
