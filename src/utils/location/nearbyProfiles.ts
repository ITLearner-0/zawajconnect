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
    console.log('Max distance:', maxDistance, 'Filters:', filters);

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

      // Generate more realistic mock coordinates around Paris area
      const parisLat = 48.8566;
      const parisLng = 2.3522;
      const variance = maxDistance / 111; // Convert km to degrees (roughly)

      const mockLat = parisLat + (Math.random() - 0.5) * variance;
      const mockLng = parisLng + (Math.random() - 0.5) * variance;

      return {
        id: profile.id,
        first_name: profile.first_name || 'Utilisateur',
        last_name: profile.last_name || '',
        name: `${profile.first_name || 'Utilisateur'} ${profile.last_name || ''}`.trim(),
        age: age,
        location: profile.location || 'Paris, France',
        education: profile.education_level || 'Non spécifié',
        occupation: profile.occupation || 'Non spécifié',
        practice_level: profile.religious_practice_level || 'Non spécifié',
        coordinates: [mockLng, mockLat] as [number, number],
        compatibility: Math.floor(Math.random() * 30) + 70, // Mock compatibility 70-100%
        isVerified: profile.email_verified || profile.phone_verified || false,
        profilePicture: profile.profile_picture || null,
        distance: Math.floor(Math.random() * maxDistance) + 1,
      };
    });

    console.log('Converted nearby profiles:', nearbyProfiles.length);

    // Sort by distance
    nearbyProfiles.sort((a, b) => a.distance - b.distance);

    // Limit to reasonable number for testing
    const limitedProfiles = nearbyProfiles.slice(0, 10);
    console.log('Limited profiles for display:', limitedProfiles.length);

    return limitedProfiles;
  } catch (error) {
    console.error('Error in findNearbyProfiles:', error);
    return [];
  }
};
