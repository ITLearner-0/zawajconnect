import { ValidatedUserResults } from './dataFetchingService';
import { UserResultWithProfile } from '../types/matchingTypes';

interface PolygamyCompatibilityResult {
  isDealbreaker: boolean;
  isStrength: boolean;
  scoreModifier: number;
  reason: string;
}

export class PolygamyCompatibilityService {
  checkCompatibility(
    myResults: ValidatedUserResults,
    otherUser: UserResultWithProfile
  ): PolygamyCompatibilityResult {
    // Access gender from profiles, not answers
    const myGender =
      myResults.answers?.gender?.value?.toString() || otherUser.profiles?.gender || 'unknown';
    const otherGender = otherUser.profiles?.gender || 'unknown';

    // Try to get polygamy stance from answers as string values
    const myPolygamyStance =
      myResults.answers?.polygamy_stance?.value?.toString() || 'not_specified';
    const otherPolygamyStance =
      otherUser.answers?.polygamy_stance?.value?.toString() || 'not_specified';

    // If either doesn't have a stance, neutral compatibility
    if (myPolygamyStance === 'not_specified' || otherPolygamyStance === 'not_specified') {
      return { isDealbreaker: false, isStrength: false, scoreModifier: 0, reason: '' };
    }

    // Male-Female compatibility check
    if (myGender === 'male' && otherGender === 'female') {
      return this.checkMaleFemaleCompatibility(myPolygamyStance, otherPolygamyStance);
    }

    // Female-Male compatibility check (reverse perspective)
    if (myGender === 'female' && otherGender === 'male') {
      return this.checkFemaleMaleCompatibility(myPolygamyStance, otherPolygamyStance);
    }

    // Default neutral compatibility
    return { isDealbreaker: false, isStrength: false, scoreModifier: 0, reason: '' };
  }

  private checkMaleFemaleCompatibility(
    myPolygamyStance: string,
    otherPolygamyStance: string
  ): PolygamyCompatibilityResult {
    // Man wants polygamy, woman refuses
    if (myPolygamyStance === 'oui' && otherPolygamyStance === 'refuse') {
      return {
        isDealbreaker: true,
        isStrength: false,
        scoreModifier: 0,
        reason: 'Incompatibilité sur la polygamie : homme souhaite, femme refuse',
      };
    }

    // Man doesn't want polygamy, woman only accepts polygamy
    if (myPolygamyStance === 'non' && otherPolygamyStance === 'accepte') {
      return {
        isDealbreaker: false,
        isStrength: false,
        scoreModifier: -10,
        reason: 'Différence sur la polygamie : homme préfère monogamie, femme accepte polygamie',
      };
    }

    // Perfect match: both want monogamy
    if (myPolygamyStance === 'non' && otherPolygamyStance === 'refuse') {
      return {
        isDealbreaker: false,
        isStrength: true,
        scoreModifier: 15,
        reason: 'Excellente compatibilité : tous deux préfèrent la monogamie',
      };
    }

    // Good match: man wants polygamy, woman accepts
    if (
      (myPolygamyStance === 'oui' || myPolygamyStance === 'peut_etre') &&
      (otherPolygamyStance === 'accepte' || otherPolygamyStance === 'conditionnelle')
    ) {
      return {
        isDealbreaker: false,
        isStrength: true,
        scoreModifier: 10,
        reason: 'Bonne compatibilité sur la polygamie',
      };
    }

    return { isDealbreaker: false, isStrength: false, scoreModifier: 0, reason: '' };
  }

  private checkFemaleMaleCompatibility(
    myPolygamyStance: string,
    otherPolygamyStance: string
  ): PolygamyCompatibilityResult {
    // Woman refuses polygamy, man wants it
    if (myPolygamyStance === 'refuse' && otherPolygamyStance === 'oui') {
      return {
        isDealbreaker: true,
        isStrength: false,
        scoreModifier: 0,
        reason: 'Incompatibilité sur la polygamie : femme refuse, homme souhaite',
      };
    }

    // Perfect match: both prefer monogamy
    if (myPolygamyStance === 'refuse' && otherPolygamyStance === 'non') {
      return {
        isDealbreaker: false,
        isStrength: true,
        scoreModifier: 15,
        reason: 'Excellente compatibilité : tous deux préfèrent la monogamie',
      };
    }

    // Good match: woman accepts, man wants polygamy
    if (
      (myPolygamyStance === 'accepte' || myPolygamyStance === 'conditionnelle') &&
      (otherPolygamyStance === 'oui' || otherPolygamyStance === 'peut_etre')
    ) {
      return {
        isDealbreaker: false,
        isStrength: true,
        scoreModifier: 10,
        reason: 'Bonne compatibilité sur la polygamie',
      };
    }

    return { isDealbreaker: false, isStrength: false, scoreModifier: 0, reason: '' };
  }
}

export const polygamyCompatibilityService = new PolygamyCompatibilityService();
