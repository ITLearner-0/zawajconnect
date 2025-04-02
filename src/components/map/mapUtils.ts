import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN_KEY, MAPBOX_PUBLIC_TOKEN } from './types';

// Initialize the Mapbox map
export const initializeMap = async ({
  mapContainer,
  userCoordinates,
  token
}: {
  mapContainer: HTMLDivElement;
  userCoordinates: [number, number];
  token: string;
}) => {
  // Always use the built-in public token
  mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN;
  
  const map = new mapboxgl.Map({
    container: mapContainer,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: userCoordinates,
    zoom: 11
  });
  
  return map;
};

// Add custom styling for the map
export const addMapCustomStyling = () => {
  // Add custom styling for the map markers and popups
  const style = document.createElement('style');
  style.innerHTML = `
    .map-popup { padding: 8px; max-width: 200px; }
    .map-popup h3 { font-weight: bold; margin: 0 0 5px 0; }
    .map-popup p { margin: 2px 0; font-size: 13px; }
    .view-profile-btn { transition: all 0.2s ease; }
    .view-profile-btn:hover { background-color: #1a5059 !important; }
    .custom-marker { box-shadow: 0 0 0 4px rgba(255,255,255,0.5); }
  `;
  document.head.appendChild(style);
  
  // Return cleanup function
  return () => {
    document.head.removeChild(style);
  };
};

// Get the Mapbox token (now returns the built-in public token)
export const getMapboxToken = (): string => {
  return MAPBOX_PUBLIC_TOKEN;
};
