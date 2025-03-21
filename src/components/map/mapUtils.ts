
import mapboxgl from 'mapbox-gl';
import { toast } from '@/components/ui/use-toast';

// Prompts for Mapbox token if not already stored
export const promptForMapboxToken = (): string | null => {
  const storedToken = localStorage.getItem('mapbox_token');
  if (storedToken) {
    return storedToken;
  }
  
  const token = prompt(
    "Please enter your Mapbox public token. You can get one at https://mapbox.com/account/access-tokens",
    ""
  );
  
  if (token) {
    localStorage.setItem('mapbox_token', token);
    return token;
  }
  
  return null;
};

// Add custom map styling
export const addMapCustomStyling = (): (() => void) => {
  const style = document.createElement('style');
  style.textContent = `
    .mapboxgl-popup-content {
      background-color: #fff;
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-left: 4px solid #28717c;
    }
    .mapboxgl-popup-content h3 {
      margin: 0 0 5px 0;
      color: #28717c;
      font-weight: 600;
    }
    .mapboxgl-popup-content p {
      margin: 5px 0;
      color: #6b2025;
    }
    .custom-marker {
      cursor: pointer;
      transition: transform 0.2s;
    }
    .custom-marker:hover {
      transform: scale(1.2);
    }
    .map-popup {
      min-width: 150px;
    }
    .view-profile-btn:hover {
      background-color: #1e5762 !important;
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
};

// Function to initialize the map
export const initializeMap = async ({
  mapContainer,
  userCoordinates,
  token,
}: {
  mapContainer: HTMLDivElement;
  userCoordinates: [number, number];
  token: string;
}): Promise<mapboxgl.Map> => {
  mapboxgl.accessToken = token;
  
  // Create the map
  const map = new mapboxgl.Map({
    container: mapContainer,
    style: 'mapbox://styles/mapbox/light-v11',
    center: userCoordinates,
    zoom: 9,
    pitchWithRotate: false,
  });
  
  // Add navigation controls
  map.addControl(
    new mapboxgl.NavigationControl(),
    'top-right'
  );
  
  return map;
};
