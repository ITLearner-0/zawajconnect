
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  distance: number;
  age?: number;
  practice_level?: string;
  education?: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationMapProps {
  maxDistance?: number;
  filters?: FilterCriteria;
  showCompatibility?: boolean;
}

export interface FilterCriteria {
  ageRange?: [number, number];
  practiceLevel?: string[];
  education?: string[];
}

export interface MapMarkerProps {
  profileId: string;
  position: [number, number];
  profile: Profile;
  showCompatibility: boolean;
  onNavigateToProfile: (profileId: string) => void;
}

export interface ProfileListItemProps {
  profile: Profile;
  onNavigateToProfile: (profileId: string) => void;
}

export interface ProfileListProps {
  profiles: Profile[];
  onNavigateToProfile: (profileId: string) => void;
}

// For the token management
export const MAPBOX_TOKEN_KEY = 'mapbox_token';
