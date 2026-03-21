import { describe, it, expect } from 'vitest';
import { istikharaDua, dailyContent, moodLabels } from '@/data/istikhara_content';

describe('Istikhara Content Data', () => {
  describe('istikharaDua', () => {
    it('should have Arabic text', () => {
      expect(istikharaDua.arabic).toBeDefined();
      expect(istikharaDua.arabic.length).toBeGreaterThan(0);
    });

    it('should have transliteration', () => {
      expect(istikharaDua.transliteration).toBeDefined();
      expect(istikharaDua.transliteration.length).toBeGreaterThan(0);
    });

    it('should have French translation', () => {
      expect(istikharaDua.french).toBeDefined();
      expect(istikharaDua.french.length).toBeGreaterThan(0);
    });
  });

  describe('dailyContent', () => {
    it('should have exactly 7 days of content', () => {
      expect(dailyContent).toHaveLength(7);
    });

    it('should have sequential day numbers', () => {
      dailyContent.forEach((day, index) => {
        expect(day.day).toBe(index + 1);
      });
    });

    it('should have required fields for each day', () => {
      dailyContent.forEach((day) => {
        expect(day.hadith).toBeDefined();
        expect(day.hadith.arabic).toBeDefined();
        expect(day.hadith.french).toBeDefined();
        expect(day.reflection).toBeDefined();
        expect(day.advice).toBeDefined();
      });
    });
  });

  describe('moodLabels', () => {
    it('should have all mood types', () => {
      expect(moodLabels.serene).toBeDefined();
      expect(moodLabels.uncertain).toBeDefined();
      expect(moodLabels.positive).toBeDefined();
      expect(moodLabels.doubtful).toBeDefined();
      expect(moodLabels.neutral).toBeDefined();
    });

    it('should have label and emoji for each mood', () => {
      Object.values(moodLabels).forEach((mood) => {
        expect(mood.label).toBeDefined();
        expect(mood.emoji).toBeDefined();
      });
    });
  });
});
