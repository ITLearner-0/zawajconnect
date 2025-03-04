
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the user's coordinates in the database
 */
export const updateUserCoordinates = async (
  userId: string,
  latitude: number,
  longitude: number
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc(
      'update_user_coordinates',
      { 
        user_id: userId,
        lat: latitude,
        lng: longitude
      }
    );
    
    if (error) {
      console.error("Error updating coordinates:", error);
      return false;
    }
    
    return data || false;
  } catch (err) {
    console.error("Error in updateUserCoordinates:", err);
    return false;
  }
};

/**
 * Gets nearby profiles within a certain distance
 */
export const findNearbyProfiles = async (
  userId: string,
  maxDistance: number = 50,
  filters?: FilterCriteria
): Promise<any[]> => {
  try {
    // Get the user's current coordinates
    let { data: profiles, error } = await supabase.rpc(
      'find_nearby_profiles',
      { 
        user_id: userId,
        max_distance_km: maxDistance
      }
    );
    
    if (error) {
      console.error("Error finding nearby profiles:", error);
      return [];
    }
    
    // If filters are provided, apply them on the client side
    // In a production app, this filtering would ideally be done in the database query
    if (filters && profiles) {
      profiles = applyFilters(profiles, filters);
    }
    
    return profiles || [];
  } catch (err) {
    console.error("Error in findNearbyProfiles:", err);
    return [];
  }
};

// Define filter criteria type
export interface FilterCriteria {
  ageRange?: [number, number];
  practiceLevel?: string[];
  education?: string[];
}

// Apply filters to the profiles
const applyFilters = (profiles: any[], filters: FilterCriteria): any[] => {
  return profiles.filter(profile => {
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
    console.error("Error saving filter:", error);
  }
};

// Get all saved filters
export const getSavedFilters = (): Record<string, FilterCriteria> => {
  try {
    const savedFilters = localStorage.getItem('savedFilters');
    return savedFilters ? JSON.parse(savedFilters) : {};
  } catch (error) {
    console.error("Error getting saved filters:", error);
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
    console.error("Error deleting saved filter:", error);
  }
};
