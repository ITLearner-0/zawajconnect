
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import { createProfileMarker } from './ProfileMarker';
import { Profile } from './types';
import { initializeMap } from './mapUtils';

interface MapContainerProps {
  profiles: Profile[];
  userCoordinates: [number, number];
  mapboxToken: string;
  showCompatibility: boolean;
  onNavigateToProfile: (profileId: string) => void;
}

export interface MapContainerRef {
  flyToProfile: (profileId: string) => void;
}

const MapContainer = forwardRef<MapContainerRef, MapContainerProps>(({ 
  profiles, 
  userCoordinates, 
  mapboxToken, 
  showCompatibility,
  onNavigateToProfile 
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{[id: string]: mapboxgl.Marker}>({});

  // Expose the flyToProfile method to parent components
  useImperativeHandle(ref, () => ({
    flyToProfile: (profileId: string) => {
      const profile = profiles.find(p => p.id === profileId);
      
      if (profile && profile.latitude && profile.longitude && map.current) {
        console.log(`Flying to: ${profile.longitude}, ${profile.latitude}`);
        
        // Fly to the profile's location
        map.current.flyTo({
          center: [profile.longitude, profile.latitude],
          zoom: 13,
          essential: true
        });
        
        // Open the popup for this marker
        const marker = markersRef.current[profileId];
        if (marker) {
          marker.togglePopup();
        }
      }
    }
  }));

  useEffect(() => {
    if (!mapContainer.current || !userCoordinates) return;

    const initMap = async () => {
      if (!map.current) {
        map.current = await initializeMap({
          mapContainer: mapContainer.current!,
          userCoordinates,
          token: mapboxToken
        });

        // Add user marker after map loads
        map.current.on('load', () => {
          if (!map.current) return;
          
          // Add user marker
          new mapboxgl.Marker({ color: '#28717c' })
            .setLngLat(userCoordinates)
            .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
            .addTo(map.current);
          
          // Add markers for nearby profiles
          profiles.forEach(profile => {
            if (profile.latitude && profile.longitude) {
              const marker = createProfileMarker(
                map.current!, 
                profile, 
                showCompatibility, 
                onNavigateToProfile
              );
              
              if (marker) {
                markersRef.current[profile.id] = marker;
              }
            }
          });
        });
      }
    };

    initMap();
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [profiles, userCoordinates, mapboxToken, showCompatibility, onNavigateToProfile]);

  return (
    <div 
      ref={mapContainer} 
      className="h-[400px] rounded-md overflow-hidden relative"
    />
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
