
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN_KEY } from './types';

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
  mapboxgl.accessToken = token;
  
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

// Check if Mapbox token is available and prompt if not
export const promptForMapboxToken = (): string => {
  // Try to get token from localStorage
  let token = localStorage.getItem(MAPBOX_TOKEN_KEY);
  
  // If no token found, prompt the user
  if (!token) {
    token = window.prompt(
      'Please enter your Mapbox access token to display the map. You can get a free token at mapbox.com.'
    );
    
    // If user provides a token, save it
    if (token) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, token);
    }
  }
  
  return token || '';
};
