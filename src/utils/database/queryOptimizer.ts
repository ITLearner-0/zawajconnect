
/**
 * Query optimizer utilities for database performance monitoring and optimization
 */

export interface QueryPerformanceMetrics {
  queryType: string;
  executionTime: number;
  recordsReturned: number;
  indexesUsed: string[];
  timestamp: Date;
}

class QueryPerformanceMonitor {
  private metrics: QueryPerformanceMetrics[] = [];
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  async measureQuery<T>(
    queryType: string,
    queryFn: () => Promise<{ data: T | null; error: any }>,
    expectedIndexes: string[] = []
  ): Promise<{ data: T | null; error: any; metrics?: QueryPerformanceMetrics }> {
    if (!this.isEnabled) {
      return await queryFn();
    }

    const startTime = performance.now();
    const result = await queryFn();
    const endTime = performance.now();

    const metrics: QueryPerformanceMetrics = {
      queryType,
      executionTime: endTime - startTime,
      recordsReturned: Array.isArray(result.data) ? result.data.length : result.data ? 1 : 0,
      indexesUsed: expectedIndexes,
      timestamp: new Date()
    };

    this.metrics.push(metrics);

    // Log slow queries (> 100ms)
    if (metrics.executionTime > 100) {
      console.warn(`Slow query detected: ${queryType} took ${metrics.executionTime.toFixed(2)}ms`);
    }

    // Log queries returning many records without pagination
    if (metrics.recordsReturned > 100) {
      console.warn(`Large result set: ${queryType} returned ${metrics.recordsReturned} records`);
    }

    return { ...result, metrics };
  }

  getMetrics(): QueryPerformanceMetrics[] {
    return [...this.metrics];
  }

  getSlowQueries(threshold: number = 100): QueryPerformanceMetrics[] {
    return this.metrics.filter(m => m.executionTime > threshold);
  }

  getAverageExecutionTime(queryType?: string): number {
    const relevantMetrics = queryType 
      ? this.metrics.filter(m => m.queryType === queryType)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.executionTime, 0);
    return totalTime / relevantMetrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  getPerformanceReport(): {
    totalQueries: number;
    averageExecutionTime: number;
    slowQueries: number;
    queryTypes: { [key: string]: { count: number; avgTime: number } };
  } {
    const totalQueries = this.metrics.length;
    const averageExecutionTime = this.getAverageExecutionTime();
    const slowQueries = this.getSlowQueries().length;

    const queryTypes: { [key: string]: { count: number; avgTime: number } } = {};
    
    this.metrics.forEach(metric => {
      if (!queryTypes[metric.queryType]) {
        queryTypes[metric.queryType] = { count: 0, avgTime: 0 };
      }
      queryTypes[metric.queryType].count++;
    });

    Object.keys(queryTypes).forEach(type => {
      queryTypes[type].avgTime = this.getAverageExecutionTime(type);
    });

    return {
      totalQueries,
      averageExecutionTime,
      slowQueries,
      queryTypes
    };
  }
}

export const queryPerformanceMonitor = new QueryPerformanceMonitor();

// Query optimization hints
export const QueryOptimizationHints = {
  // Use these hints when constructing queries to ensure optimal performance
  PROFILE_SEARCH: {
    expectedIndexes: ['idx_profiles_visible_gender', 'idx_profiles_visible_location', 'idx_profiles_verified_visible'],
    recommendations: [
      'Always filter by is_visible = true first',
      'Use specific filters (gender, location) before general ones',
      'Limit results to reasonable pagination sizes'
    ]
  },
  
  COMPATIBILITY_MATCHING: {
    expectedIndexes: ['idx_compatibility_results_user_score', 'idx_compatibility_results_score'],
    recommendations: [
      'Order by score DESC for best matches first',
      'Use score thresholds to filter low compatibility',
      'Consider pagination for large result sets'
    ]
  },
  
  MESSAGE_HISTORY: {
    expectedIndexes: ['idx_messages_conversation_created', 'idx_messages_conversation_id'],
    recommendations: [
      'Always include conversation_id in WHERE clause',
      'Use created_at for pagination (before/after)',
      'Limit message batches to 50-100 messages'
    ]
  },
  
  CONVERSATION_LIST: {
    expectedIndexes: ['idx_conversations_participants', 'idx_conversations_created_at'],
    recommendations: [
      'Use GIN index for participants array lookups',
      'Order by created_at for recent conversations',
      'Consider using contains() for participant filtering'
    ]
  },
  
  NOTIFICATION_QUERIES: {
    expectedIndexes: ['idx_match_notifications_user_unread', 'idx_match_notifications_user_id'],
    recommendations: [
      'Filter by user_id and is_read for unread notifications',
      'Use created_at ordering for chronological display',
      'Batch mark-as-read operations'
    ]
  }
};

// Helper function to create optimized query builders
export const createOptimizedQuery = (tableName: string, hint: keyof typeof QueryOptimizationHints) => {
  const optimizationHint = QueryOptimizationHints[hint];
  
  return {
    hint: optimizationHint,
    monitor: (queryFn: () => Promise<any>) => 
      queryPerformanceMonitor.measureQuery(
        `${tableName}_${hint}`,
        queryFn,
        optimizationHint.expectedIndexes
      )
  };
};
