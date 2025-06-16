
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
    
    // Fetch all visible profiles from database (excluding current user)
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
    console.log('Raw profiles from database:', profilesData.length);
    
    // Apply filters to the profiles
    const filteredProfiles = applyFilters(profilesData, filters);
    console.log('Filtered profiles:', filteredProfiles.length);
    
    // Convert to Profile format and add mock coordinates
    const nearbyProfiles: Profile[] = filteredProfiles.map((profile: any, index: number) => {
      // Calculate age from birth_date if available
      let age = null;
      if (profile.birth_date) {
        const birthDate = new Date(profile.birth_date);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      return {
        id: profile.id,
        first_name: profile.first_name || 'Unknown',
        last_name: profile.last_name || '',
        name: `${profile.first_name || 'Unknown'} ${profile.last_name || ''}`.trim(),
        age: age,
        location: profile.location || 'Unknown',
        education: profile.education_level || 'Not specified',
        occupation: profile.occupation || 'Not specified',
        practice_level: profile.religious_practice_level || 'Not specified',
        coordinates: [
          // Mock coordinates - in a real app you'd have actual location data
          -74.006 + (Math.random() - 0.5) * 0.1,
          40.7128 + (Math.random() - 0.5) * 0.1
        ] as [number, number],
        compatibility: Math.floor(Math.random() * 30) + 70, // Mock compatibility
        isVerified: profile.email_verified || profile.phone_verified || false,
        profilePicture: profile.profile_picture || null,
        distance: Math.floor(Math.random() * maxDistance) + 1
      };
    });

    console.log('Converted nearby profiles:', nearbyProfiles.length);
    return nearbyProfiles;
  } catch (error) {
    console.error('Error in findNearbyProfiles:', error);
    return [];
  }
};
