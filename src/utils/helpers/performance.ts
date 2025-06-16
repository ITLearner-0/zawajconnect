
// Performance utilities for optimization
import { performanceCore } from '../performance/core';
import { performanceFunctions } from '../performance/functions';
import { webVitals } from '../performance/webVitals';
import { resourceAnalysis } from '../performance/resourceAnalysis';

export const performance = {
  // Re-export all utilities from smaller modules
  ...performanceCore,
  ...performanceFunctions,
  ...webVitals,
  ...resourceAnalysis
};
