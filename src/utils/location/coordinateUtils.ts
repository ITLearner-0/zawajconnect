
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
