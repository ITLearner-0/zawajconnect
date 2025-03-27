
import { supabase } from "@/integrations/supabase/client";
import { FilterCriteria } from "./filterUtils";
import { generateMockProfiles } from "./mockData";
import { applyFilters } from "./filterUtils";

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
    
    console.log("Found profiles:", profiles);
    return profiles || [];
  } catch (err) {
    console.error("Error in findNearbyProfiles:", err);
    return generateMockProfiles(5, maxDistance); // Fallback to mock data
  }
};
