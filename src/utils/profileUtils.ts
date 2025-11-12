import { supabase } from '@/integrations/supabase/client';

/**
 * Updates a user's location coordinates via Supabase Edge Function
 */
export async function updateUserCoordinates(userId: string, latitude: number, longitude: number) {
  try {
    const { data, error } = await supabase.functions.invoke('update-coordinates', {
      body: { userId, latitude, longitude },
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating coordinates:', error);
    return false;
  }
}
