
import { MatchingFilters, UserResultWithProfile } from "../types/matchingTypes";

export function applyFilters(user: UserResultWithProfile, filters?: MatchingFilters): boolean {
  if (!filters) return true;

  const profile = user.profiles;
  
  // Age filter
  if (filters.ageRange && profile.birth_date) {
    const age = new Date().getFullYear() - new Date(profile.birth_date).getFullYear();
    if (age < filters.ageRange[0] || age > filters.ageRange[1]) {
      return false;
    }
  }

  // Gender filter
  if (filters.gender && profile.gender !== filters.gender) {
    return false;
  }

  // Location filter
  if (filters.location && !profile.location?.includes(filters.location)) {
    return false;
  }

  // Religious level filter
  if (filters.religiousLevel?.length && 
      !filters.religiousLevel.includes(profile.religious_practice_level)) {
    return false;
  }

  // Verification filter
  if (filters.verifiedOnly && 
      !(profile.email_verified && profile.phone_verified)) {
    return false;
  }

  return true;
}
