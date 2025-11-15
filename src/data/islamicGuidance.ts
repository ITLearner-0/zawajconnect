export interface IslamicGuidanceData {
  title: string;
  verse: string;
  source: string;
  application: string;
  category: string[];
}

export const islamicGuidanceDatabase: IslamicGuidanceData[] = [];

export const getGuidanceByCategory = (categories: string[]): IslamicGuidanceData[] => {
  return islamicGuidanceDatabase.filter((guidance) =>
    guidance.category.some((cat) => categories.includes(cat))
  );
};

export const getRandomGuidance = (count: number = 3): IslamicGuidanceData[] => {
  const shuffled = [...islamicGuidanceDatabase].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
