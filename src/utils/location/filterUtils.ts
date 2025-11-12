import { AdvancedFilters } from '@/hooks/compatibility/types/advancedFilterTypes';
import { EnhancedAdvancedFilters } from '@/types/filters';

// Define extended filter criteria type
export interface FilterCriteria {
  ageRange?: [number, number];
  practiceLevel?: string[];
  education?: string[];
  advanced?: AdvancedFilters;
  enhanced?: EnhancedAdvancedFilters;
}

// Apply filters to the profiles
export const applyFilters = (profiles: any[], filters: FilterCriteria): any[] => {
  return profiles.filter((profile) => {
    // Filter by age if specified
    if (filters.ageRange && profile.age) {
      const [minAge, maxAge] = filters.ageRange;
      if (profile.age < minAge || profile.age > maxAge) {
        return false;
      }
    }

    // Filter by practice level if specified
    if (filters.practiceLevel?.length && profile.practice_level) {
      if (!filters.practiceLevel.includes(profile.practice_level)) {
        return false;
      }
    }

    // Filter by education if specified
    if (filters.education?.length && profile.education) {
      if (!filters.education.includes(profile.education)) {
        return false;
      }
    }

    // Note: Advanced and enhanced filters are handled separately in the compatibility matching service

    return true;
  });
};

// Save filter to localStorage
export const saveFilter = (name: string, filters: FilterCriteria): void => {
  try {
    // Get existing saved filters
    const savedFilters = getSavedFilters();

    // Add or update the filter
    savedFilters[name] = filters;

    // Save back to localStorage
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
  } catch (error) {
    console.error('Error saving filter:', error);
  }
};

// Get all saved filters
export const getSavedFilters = (): Record<string, FilterCriteria> => {
  try {
    const savedFilters = localStorage.getItem('savedFilters');
    return savedFilters ? JSON.parse(savedFilters) : {};
  } catch (error) {
    console.error('Error getting saved filters:', error);
    return {};
  }
};

// Delete a saved filter
export const deleteSavedFilter = (name: string): void => {
  try {
    const savedFilters = getSavedFilters();
    delete savedFilters[name];
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
  } catch (error) {
    console.error('Error deleting saved filter:', error);
  }
};
