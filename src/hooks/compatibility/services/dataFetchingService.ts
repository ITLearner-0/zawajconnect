
import { userResultsService } from "./userResultsService";
import { profileService } from "./profileService";

// Re-export types and services for backward compatibility
export type { ValidatedUserResults, ValidatedOtherUser } from "./userResultsService";
export type { ValidatedProfileData } from "./profileService";

// Re-export functions for backward compatibility
export const fetchUserResults = userResultsService.fetchUserResults.bind(userResultsService);
export const fetchOtherUsers = userResultsService.fetchOtherUsers.bind(userResultsService);
export { profileService as fetchProfiles } from "./profileService";
