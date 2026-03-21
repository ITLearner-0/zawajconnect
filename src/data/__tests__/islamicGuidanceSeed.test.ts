import { describe, it, expect } from 'vitest';
import { guidanceSeedData, GuidanceEntry } from '@/data/islamicGuidanceSeed';

describe('Islamic Guidance Seed Data', () => {
  it('should have at least 30 guidance entries', () => {
    expect(guidanceSeedData.length).toBeGreaterThanOrEqual(30);
  });

  it('should have valid categories for each entry', () => {
    const validCategories = [
      'criteria', 'rights_duties', 'communication', 'family_relations',
      'conflict_resolution', 'spiritual', 'practical', 'children',
    ];
    guidanceSeedData.forEach((entry) => {
      expect(validCategories).toContain(entry.category);
    });
  });

  it('should have required fields for each entry', () => {
    guidanceSeedData.forEach((entry) => {
      expect(entry.title_fr).toBeDefined();
      expect(entry.title_fr.length).toBeGreaterThan(0);
      expect(entry.content_fr).toBeDefined();
      expect(entry.content_fr.length).toBeGreaterThan(0);
      expect(entry.source_reference).toBeDefined();
      expect(entry.source_type).toBeDefined();
      expect(entry.difficulty_level).toBeDefined();
      expect(entry.display_context).toBeDefined();
      expect(entry.display_context.length).toBeGreaterThan(0);
    });
  });

  it('should have valid source types', () => {
    const validSourceTypes = ['hadith', 'quran', 'fiqh', 'scholar'];
    guidanceSeedData.forEach((entry) => {
      expect(validSourceTypes).toContain(entry.source_type);
    });
  });

  it('should have valid difficulty levels', () => {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    guidanceSeedData.forEach((entry) => {
      expect(validLevels).toContain(entry.difficulty_level);
    });
  });

  it('should have valid display contexts', () => {
    const validContexts = ['matching', 'onboarding', 'dashboard', 'istikhara', 'chat'];
    guidanceSeedData.forEach((entry) => {
      entry.display_context.forEach((ctx) => {
        expect(validContexts).toContain(ctx);
      });
    });
  });

  it('should have at least one entry per category', () => {
    const categories = new Set(guidanceSeedData.map((e) => e.category));
    expect(categories.size).toBeGreaterThanOrEqual(8);
  });
});
