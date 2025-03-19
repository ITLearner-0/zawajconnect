
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapMarkerProps } from './types';

const ProfileMarker = ({ profileId, position, profile, showCompatibility, onNavigateToProfile }: MapMarkerProps) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    // This component assumes it's being rendered after the map is initialized
    // The actual marker creation happens in the parent component
    
    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, []);

  // This is a utility component that doesn't render anything directly
  // It's used for organization of the marker creation logic
  return null;
};

export default ProfileMarker;

// Helper function to create a Mapbox marker for a profile
export const createProfileMarker = (
  map: mapboxgl.Map,
  profile: any,
  showCompatibility: boolean,
  onNavigateToProfile: (profileId: string) => void
): mapboxgl.Marker | null => {
  if (!profile.latitude || !profile.longitude) {
    console.error("Could not create marker: missing coordinates for profile:", profile.id);
    return null;
  }
  
  const compatibilityScore = showCompatibility ? 
    Math.floor(Math.random() * 100) : null; // Mock compatibility score
  
  const markerEl = document.createElement('div');
  markerEl.className = 'custom-marker';
  markerEl.style.backgroundColor = '#d4af37';
  markerEl.style.width = '20px';
  markerEl.style.height = '20px';
  markerEl.style.borderRadius = '50%';
  markerEl.style.border = '2px solid white';
  
  // Create popup content with a View Profile button
  let popupContent = `
    <div class="map-popup">
      <h3>${profile.first_name} ${profile.last_name}</h3>
      <p>${profile.distance.toFixed(1)} km away</p>
  `;
  
  if (profile.age) {
    popupContent += `<p>Age: ${profile.age}</p>`;
  }
  
  if (profile.practice_level) {
    popupContent += `<p>Practice: ${profile.practice_level}</p>`;
  }
  
  if (compatibilityScore !== null) {
    popupContent += `<p>Compatibility: ${compatibilityScore}%</p>`;
  }
  
  // Add a View Profile button to the popup
  popupContent += `
    <button class="view-profile-btn" data-profile-id="${profile.id}" 
      style="background-color: #28717c; color: white; padding: 5px 10px; 
      border: none; border-radius: 4px; margin-top: 8px; cursor: pointer;">
      View Profile
    </button>
  `;
  
  popupContent += `</div>`;
  
  const popup = new mapboxgl.Popup().setHTML(popupContent);
  
  // Add event listener for the View Profile button
  popup.on('open', () => {
    setTimeout(() => {
      const viewProfileBtn = document.querySelector(`.view-profile-btn[data-profile-id="${profile.id}"]`);
      if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          onNavigateToProfile(profile.id);
        });
      }
    }, 100); // Small delay to ensure DOM is updated
  });
  
  const marker = new mapboxgl.Marker(markerEl)
    .setLngLat([profile.longitude, profile.latitude])
    .setPopup(popup)
    .addTo(map);
    
  return marker;
};
