
import { UserResultWithProfile } from "../types/matchingTypes";

export class ProfileDataBuilder {
  buildProfileData(otherUser: UserResultWithProfile) {
    return {
      first_name: otherUser.profiles.first_name,
      last_name: otherUser.profiles.last_name,
      location: otherUser.profiles.location,
      religious_practice_level: otherUser.profiles.religious_practice_level,
      education_level: otherUser.profiles.education_level,
      email_verified: otherUser.profiles.email_verified,
      phone_verified: otherUser.profiles.phone_verified,
      id_verified: otherUser.profiles.id_verified,
      age: otherUser.profiles.birth_date ? this.calculateAge(otherUser.profiles.birth_date) : undefined
    };
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}

export const profileDataBuilder = new ProfileDataBuilder();
