import { describe, it, expect } from 'vitest';
import { journeySteps } from '@/data/journey_guidance';

describe('Journey Guidance Data', () => {
  it('should have exactly 7 steps', () => {
    expect(journeySteps).toHaveLength(7);
  });

  it('should have all required fields for each step', () => {
    journeySteps.forEach((step) => {
      expect(step.step).toBeDefined();
      expect(step.title).toBeDefined();
      expect(step.description).toBeDefined();
      expect(step.islamicReference).toBeDefined();
      expect(step.questionsToAsk).toBeDefined();
      expect(step.questionsToAsk.length).toBeGreaterThan(0);
      expect(step.commonMistakes).toBeDefined();
      expect(step.commonMistakes.length).toBeGreaterThan(0);
      expect(step.recommendedDuration).toBeDefined();
    });
  });

  it('should have sequential step numbers', () => {
    journeySteps.forEach((step, index) => {
      expect(step.step).toBe(index + 1);
    });
  });

  it('should have action routes for steps that need them', () => {
    // At least some steps should have action routes
    const stepsWithRoutes = journeySteps.filter((s) => s.actionRoute);
    expect(stepsWithRoutes.length).toBeGreaterThan(0);
  });
});
