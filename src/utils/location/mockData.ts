
// Generate mock profiles for demonstration
export const generateMockProfiles = async (count: number, maxDistance: number): Promise<any[]> => {
  const profiles = [];
  
  // Get user's location or use a default
  let userLat = 51.505; // Default to London
  let userLng = -0.09;
  
  // Try to get the user's location from browser
  if (navigator.geolocation) {
    try {
      // Use promise-based approach to get location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 0
        });
      }).catch(() => {
        console.log("Using default location for mock data");
        return null;
      });
      
      if (position) {
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
      }
    } catch (e) {
      console.error("Error getting user location for mock data:", e);
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
