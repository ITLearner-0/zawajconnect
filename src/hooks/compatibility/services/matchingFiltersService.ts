import { MatchingFilters, UserResultWithProfile } from '../types/matchingTypes';
import { logInfo } from './loggingService';

export class MatchingFiltersService {
  applyFilters(user: UserResultWithProfile, filters?: MatchingFilters): boolean {
    if (!filters) return true;

    const profile = user.profiles;

    // Age filter
    if (filters.ageRange && profile.birth_date) {
      const age = this.calculateAge(profile.birth_date);
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
    if (
      filters.religiousLevel?.length &&
      !filters.religiousLevel.includes(profile.religious_practice_level || '')
    ) {
      return false;
    }

    // Verification filter
    if (filters.verifiedOnly && !(profile.email_verified && profile.phone_verified)) {
      return false;
    }

    return true;
  }

  filterUsers(users: UserResultWithProfile[], filters?: MatchingFilters): UserResultWithProfile[] {
    if (!filters) return users;

    const filteredUsers = users.filter((user) => this.applyFilters(user, filters));

    logInfo('filterUsers', `${filteredUsers.length} users passed filters out of ${users.length}`);

    return filteredUsers;
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }
}

export const matchingFiltersService = new MatchingFiltersService();
