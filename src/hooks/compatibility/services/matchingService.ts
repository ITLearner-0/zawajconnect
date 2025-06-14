
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

    // Get other users' compatibility results
    const { data: otherUsers, error: otherUsersError } = await supabase
      .from('compatibility_results')
      .select('user_id, answers, preferences')
      .neq('user_id', userId);

    if (otherUsersError) {
      console.error('Error fetching other users results:', otherUsersError);
      throw otherUsersError;
    }

    if (!otherUsers?.length) {
      return [];
    }

    // Get profiles for these users in a single optimized query
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

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles?.length) {
      return [];
    }

    // Combine the data efficiently
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
            last_name: profile.last_name || null,
            gender: profile.gender,
            location: profile.location || null,
            birth_date: profile.birth_date,
            religious_practice_level: profile.religious_practice_level || null,
            education_level: profile.education_level || null,
            email_verified: profile.email_verified || null,
            phone_verified: profile.phone_verified || null,
            id_verified: profile.id_verified || null,
            is_visible: profile.is_visible
          }
        };
      })
      .filter((user): user is UserResultWithProfile => user !== null);

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
