
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/components/map/types';
import { applyFilters } from './filterUtils';

export const findNearbyProfiles = async (
  currentUserId: string,
  maxDistance: number = 50,
  filters: any = {}
): Promise<Profile[]> => {
  try {
    console.log('Finding nearby profiles for user:', currentUserId);
    
    // Since we don't have a location-based query function, 
    // we'll fetch all profiles and filter client-side for now
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId)
      .eq('is_visible', true);

    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }

    const profilesData = profiles || [];
    
    // Apply filters to the profiles
    const filteredProfiles = applyFilters(profilesData, filters);
    
    // Convert to Profile format and add mock coordinates
    const nearbyProfiles: Profile[] = filteredProfiles.map((profile: any, index: number) => ({
      id: profile.id,
      name: `${profile.first_name || 'Unknown'} ${profile.last_name || ''}`.trim(),
      age: profile.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : null,
      location: profile.location || 'Unknown',
      education: profile.education_level || 'Not specified',
      occupation: profile.occupation || 'Not specified',
      coordinates: [
        // Mock coordinates - in a real app you'd have actual location data
        -74.006 + (Math.random() - 0.5) * 0.1,
        40.7128 + (Math.random() - 0.5) * 0.1
      ] as [number, number],
      compatibility: Math.floor(Math.random() * 30) + 70, // Mock compatibility
      isVerified: profile.is_verified || false,
      profilePicture: profile.profile_picture || null,
      distance: Math.floor(Math.random() * maxDistance) + 1
    }));

    console.log('Found profiles:', nearbyProfiles.length);
    return nearbyProfiles;
  } catch (error) {
    console.error('Error in findNearbyProfiles:', error);
    return [];
  }
};
