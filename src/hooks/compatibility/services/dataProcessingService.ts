
import { UserResultWithProfile } from "../types/matchingTypes";
import { logWarning, logError, logInfo } from "./loggingService";

export function combineUserDataWithProfiles(
  otherUsers: Array<{ user_id: string; answers: Record<string, any>; preferences: any }>,
  profiles: any[]
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
            answers: user.answers as Record<string, any>,
            preferences: user.preferences as any,
            profiles: {
              first_name: profile.first_name || '',
              last_name: profile.last_name || null,
              gender: profile.gender || '',
              location: profile.location || null,
              birth_date: profile.birth_date || '',
              religious_practice_level: profile.religious_practice_level || null,
              education_level: profile.education_level || null,
              email_verified: profile.email_verified || false,
              phone_verified: profile.phone_verified || false,
              id_verified: profile.id_verified || false,
              is_visible: profile.is_visible || true
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
