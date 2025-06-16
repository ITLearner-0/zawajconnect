
// Resource timing analysis utilities
export const resourceAnalysis = {
  // Resource timing analysis
  getResourceTimings: (): {
    scripts: number;
    stylesheets: number;
    images: number;
    other: number;
    totalSize: number;
  } => {
    const resources = globalThis.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const analysis = {
      scripts: 0,
      stylesheets: 0,
      images: 0,
      other: 0,
      totalSize: 0
    };

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      analysis.totalSize += size;

      if (resource.name.includes('.js')) {
        analysis.scripts += size;
      } else if (resource.name.includes('.css')) {
        analysis.stylesheets += size;
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        analysis.images += size;
      } else {
        analysis.other += size;
      }
    });

    return analysis;
  }
};
