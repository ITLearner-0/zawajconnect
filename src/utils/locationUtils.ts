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
    // Using supabase functions instead of RPC due to the error
    const { data, error } = await supabase.functions.invoke('update-coordinates', {
      body: { 
        user_id: userId,
        latitude,
        longitude
      }
    });
    
    if (error) {
      console.error("Error updating coordinates:", error);
      return false;
    }
    
    return Boolean(data) || false;
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

/**
 * Simple geocoding function to convert location string to coordinates
 * In a production app, you would use a real geocoding service like Google Maps or Mapbox
 */
export const geocodeLocation = async (locationString: string): Promise<{latitude: number, longitude: number} | null> => {
  try {
    // This is a simplified mock implementation for demonstration purposes
    // In a real app, you would call an actual geocoding API
    console.log(`Geocoding location: ${locationString}`);
    
    // Mock random coordinates based on the location string
    // This ensures we get different but deterministic coordinates for the same location string
    const stringHash = [...locationString].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomLatitude = (((stringHash % 180) - 90) + (Math.sin(stringHash) * 10));
    const randomLongitude = (((stringHash * 2) % 360) - 180) + (Math.cos(stringHash) * 10);
    
    // Clamp values to valid ranges
    const latitude = Math.max(-90, Math.min(90, randomLatitude));
    const longitude = Math.max(-180, Math.min(180, randomLongitude));
    
    console.log(`Geocoded to: ${latitude}, ${longitude}`);
    return { latitude, longitude };
  } catch (error) {
    console.error("Error geocoding location:", error);
    return null;
  }
};
