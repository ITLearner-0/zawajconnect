
import { UserResultWithProfile } from "../types/matchingTypes";
import { ValidatedOtherUser } from "./userResultsService";
import { ValidatedProfileData } from "./profileService";
import { logWarning, logError, logInfo } from "./loggingService";

export function combineUserDataWithProfiles(
  otherUsers: ValidatedOtherUser[],
  profiles: ValidatedProfileData[]
): UserResultWithProfile[] {
  let skippedUsers = 0;

  try {
    const usersWithProfiles = otherUsers
      .map(user => {
        try {
          const profile = profiles.find(p => p.id === user.user_id);
          if (!profile) {
            logWarning('combineUserData', `No profile found for user: ${user.user_id}`);
            return null;
          }
          
          return {
            user_id: user.user_id,
            answers: user.answers,
            preferences: user.preferences,
            profiles: {
              first_name: profile.first_name,
              last_name: profile.last_name,
              gender: profile.gender,
              location: profile.location,
              birth_date: profile.birth_date,
              religious_practice_level: profile.religious_practice_level,
              education_level: profile.education_level,
              email_verified: profile.email_verified,
              phone_verified: profile.phone_verified,
              id_verified: profile.id_verified,
              is_visible: profile.is_visible
            }
          };
        } catch (error) {
          logError('combineUserData', error as Error, { userId: user.user_id });
          skippedUsers++;
          return null;
        }
      })
      .filter((user): user is UserResultWithProfile => user !== null);

    if (skippedUsers > 0) {
      logWarning('combineUserData', `Skipped ${skippedUsers} users due to data issues`);
    }

    logInfo('combineUserData', `Successfully combined data for ${usersWithProfiles.length} users`);
    return usersWithProfiles;
  } catch (error) {
    logError('combineUserData', error as Error);
    return [];
  }
}
