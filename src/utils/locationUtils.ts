
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
    console.log(`Updating coordinates for user ${userId}: ${latitude}, ${longitude}`);
    
    // Using supabase functions instead of RPC due to the error
    const { data, error } = await supabase.functions.invoke('update-coordinates', {
      body: { 
        userId,
        latitude,
        longitude
      }
    });
    
    if (error) {
      console.error("Error updating coordinates:", error);
      return false;
    }
    
    console.log("Coordinates updated successfully:", data);
    return Boolean(data?.success) || false;
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
    console.log(`Finding profiles near user ${userId} within ${maxDistance}km`);
    
    // Try to get the user's current coordinates
    let { data: profiles, error } = await supabase.rpc(
      'find_nearby_profiles',
      { 
        user_id: userId,
        max_distance_km: maxDistance
      }
    );
    
    if (error) {
      console.error("Error finding nearby profiles:", error);
      console.log("Using mock data instead");
      
      // If the RPC fails, use mock data for demonstration
      profiles = await generateMockProfiles(10, maxDistance);
    }
    
    // If filters are provided, apply them on the client side
    if (filters && profiles) {
      profiles = applyFilters(profiles, filters);
    }
    
    return profiles || [];
  } catch (err) {
    console.error("Error in findNearbyProfiles:", err);
    return generateMockProfiles(5, maxDistance); // Fallback to mock data
  }
};

// Generate mock profiles for demonstration
const generateMockProfiles = async (count: number, maxDistance: number): Promise<any[]> => {
  const profiles = [];
  
  // Get user's location or use a default
  let userLat = 51.505; // Default to London
  let userLng = -0.09;
  
  // Try to get the user's location from browser
  if (navigator.geolocation) {
    try {
      // Use promise-based approach to get location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }).catch(() => {
        console.log("Using default location");
        return null;
      });
      
      if (position) {
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
      }
    } catch (e) {
      console.error("Error getting user location:", e);
    }
  }
  
  // Generate random profiles around the user location
  for (let i = 0; i < count; i++) {
    // Generate random coordinates within maxDistance km
    const distance = Math.random() * maxDistance;
    const angle = Math.random() * Math.PI * 2;
    
    // Convert distance to lat/lng offset (approximate)
    const latOffset = distance * 0.009 * Math.cos(angle);
    const lngOffset = distance * 0.009 * Math.sin(angle);
    
    const latitude = userLat + latOffset;
    const longitude = userLng + lngOffset;
    
    // Generate random profile data
    profiles.push({
      id: `mock-${i}`,
      first_name: ['Sarah', 'Ahmad', 'Fatima', 'Mohamed', 'Aisha', 'Omar', 'Zainab', 'Ali'][i % 8],
      last_name: ['Khan', 'Ahmed', 'Abdullah', 'Rahman', 'Hassan', 'Farooq', 'Malik', 'Shah'][i % 8],
      age: 25 + Math.floor(Math.random() * 15),
      practice_level: ['Practicing', 'Moderately practicing', 'Very practicing'][Math.floor(Math.random() * 3)],
      education: ['Bachelor\'s', 'Master\'s', 'PhD', 'High School'][Math.floor(Math.random() * 4)],
      distance: distance,
      latitude: latitude,
      longitude: longitude
    });
  }
  
  return profiles;
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
