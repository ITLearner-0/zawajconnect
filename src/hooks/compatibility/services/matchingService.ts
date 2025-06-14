
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

    // Get other users' results without the inner join
    const { data: otherUsers, error } = await supabase
      .from('compatibility_results')
      .select('user_id, answers, preferences')
      .neq('user_id', userId);

    if (error) throw error;

    if (!otherUsers?.length) {
      return [];
    }

    // Get profile data separately
    const userIds = otherUsers.map(user => user.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
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
      `)
      .in('id', userIds)
      .eq('is_visible', true);

    if (profilesError) throw profilesError;

    if (!profiles?.length) {
      return [];
    }

    // Combine the data and cast types properly
    const usersWithProfiles: UserResultWithProfile[] = otherUsers
      .map(user => {
        const profile = profiles.find(p => p.id === user.user_id);
        if (!profile) return null;

        return {
          user_id: user.user_id,
          answers: user.answers as Record<string, any>,
          preferences: user.preferences as any,
          profiles: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            gender: profile.gender,
            location: profile.location,
            birth_date: profile.birth_date,
            religious_practice_level: profile.religious_practice_level,
            education_level: profile.education_level,
            email_verified: profile.email_verified,
            phone_verified: profile.phone_verified,
            id_verified: profile.id_verified,
            is_visible: profile.is_visible
          }
        };
      })
      .filter((user): user is UserResultWithProfile => user !== null);

    // Apply filters and calculate compatibility scores
    const matches = usersWithProfiles
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
