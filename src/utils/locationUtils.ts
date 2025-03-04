
import { supabase } from "@/integrations/supabase/client";

// Interface for location data
export interface LocationData {
  latitude: number;
  longitude: number;
  display_name?: string;
}

/**
 * Geocode a location string to coordinates using OpenStreetMap Nominatim API
 * Note: For production use, consider using a commercial geocoding service with appropriate rate limits
 */
export const geocodeLocation = async (locationString: string): Promise<LocationData | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
};

/**
 * Update user's profile with coordinates
 */
export const updateUserCoordinates = async (userId: string, latitude: number, longitude: number) => {
  try {
    // Create a PostGIS point from the coordinates
    const { data, error } = await supabase.rpc('update_user_coordinates', {
      user_id: userId,
      lat: latitude,
      lng: longitude
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user coordinates:', error);
    return false;
  }
};

/**
 * Find nearby profiles within a certain distance
 */
export const findNearbyProfiles = async (userId: string, maxDistanceKm: number = 50) => {
  try {
    const { data, error } = await supabase
      .rpc('find_nearby_profiles', {
        user_id: userId,
        max_distance_km: maxDistanceKm
      });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error finding nearby profiles:', error);
    return [];
  }
};
