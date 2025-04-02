
import { FilterCriteria } from '@/utils/location/filterUtils';

export const MAPBOX_TOKEN_KEY = 'mapbox_access_token';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  age?: number;
  practice_level?: string;
  education?: string;
  distance: number;
  latitude?: number;
  longitude?: number;
}

export interface ProfileListProps {
  profiles: Profile[];
  onNavigateToProfile: (profileId: string) => void;
}

export interface ProfileListItemProps {
  profile: Profile;
  onNavigateToProfile: (profileId: string) => void;
}

export interface LocationMapProps {
  maxDistance?: number;
  filters?: FilterCriteria;
  showCompatibility?: boolean;
}

export interface MapMarkerProps {
  profileId: string;
  position: [number, number];
  profile: Profile;
  showCompatibility: boolean;
  onNavigateToProfile: (profileId: string) => void;
}
