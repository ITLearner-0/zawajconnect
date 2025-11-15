// Application-wide constants for better maintainability
export const APP_CONSTANTS = {
  // Compatibility scoring
  COMPATIBILITY: {
    MIN_SCORE: 0,
    MAX_SCORE: 100,
    DEFAULT_MIN_FILTER: 50,
    EXCELLENT_THRESHOLD: 80,
    GOOD_THRESHOLD: 60,
    FAIR_THRESHOLD: 40,
  },

  // Lazy loading configuration
  LAZY_LOADING: {
    DEFAULT_THRESHOLD: 0.1,
    DEFAULT_ROOT_MARGIN: '50px',
    DEFAULT_BATCH_SIZE: 10,
    DEFAULT_DELAY: 100,
    MAX_RETRIES: 3,
  },

  // Analytics
  ANALYTICS: {
    REFRESH_INTERVAL: 10000, // 10 seconds
    TREND_DAYS: 7,
    CACHE_DURATION: 300000, // 5 minutes
  },

  // Performance grades
  PERFORMANCE_GRADES: {
    EXCELLENT: 'excellent',
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor',
  } as const,

  // Colors for UI consistency
  COLORS: {
    CHART_COLORS: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'],
    GRADE_COLORS: {
      excellent: 'text-green-600',
      good: 'text-blue-600',
      fair: 'text-yellow-600',
      poor: 'text-red-600',
    },
  },
} as const;

// Type definitions for constants
export type PerformanceGrade = keyof typeof APP_CONSTANTS.PERFORMANCE_GRADES;
export type GradeColor = keyof typeof APP_CONSTANTS.COLORS.GRADE_COLORS;
