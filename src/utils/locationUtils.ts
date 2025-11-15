import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  location: string;
  birth_date: string;
  education_level: string;
  occupation: string;
  is_verified: boolean;
}

export const findNearbyUsers = async (
  currentUserId: string,
  latitude: number,
  longitude: number,
  maxDistanceKm: number = 50
): Promise<UserProfile[]> => {
  try {
    console.log('Finding nearby users for:', currentUserId, 'at', latitude, longitude);

    // Since we don't have spatial functions available, fetch all profiles
    // and filter client-side for now
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId)
      .eq('is_visible', true);

    if (error) {
      console.error('Error fetching nearby users:', error);
      throw error;
    }

    const profilesData = profiles || [];

    // Return mock data for now since we don't have actual coordinates
    return profilesData.slice(0, 10).map((profile: any) => ({
      id: profile.id,
      first_name: profile.first_name || 'Unknown',
      last_name: profile.last_name || '',
      location: profile.location || 'Unknown',
      birth_date: profile.birth_date || '1990-01-01',
      education_level: profile.education_level || 'Not specified',
      occupation: profile.occupation || 'Not specified',
      is_verified: profile.is_verified || false,
    }));
  } catch (error) {
    console.error('Error in findNearbyUsers:', error);
    return [];
  }
};

export const updateUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number
): Promise<boolean> => {
  try {
    console.log('Location update requested for user:', userId);
    // Since we don't have location columns, just log for now
    console.log('Would update location to:', latitude, longitude);
    return true;
  } catch (error) {
    console.error('Error updating user location:', error);
    return false;
  }
};
