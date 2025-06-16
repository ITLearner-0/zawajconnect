
interface UserMetric {
  userId: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  sessionId: string;
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, any>;
}

interface BusinessMetric {
  type: 'conversion' | 'engagement' | 'retention' | 'satisfaction';
  value: number;
  period: 'daily' | 'weekly' | 'monthly';
  timestamp: Date;
  breakdown?: Record<string, number>;
}

interface ErrorMetric {
  id: string;
  error: string;
  component: string;
  timestamp: Date;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class MetricsService {
  private userMetrics: UserMetric[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private businessMetrics: BusinessMetric[] = [];
  private errorMetrics: ErrorMetric[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  // Track user actions
  trackUserAction(action: string, userId?: string, metadata?: Record<string, any>): void {
    const metric: UserMetric = {
      userId: userId || 'anonymous',
      action,
      timestamp: new Date(),
      metadata,
      sessionId: this.sessionId
    };

    this.userMetrics.push(metric);
    console.log(`📊 Analytics: User action tracked - ${action}`);

    // Send to analytics service (would be real API in production)
    this.sendToAnalytics('user_action', metric);
  }

  // Track performance metrics
  trackPerformance(name: string, value: number, unit: string = 'ms', context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      id: this.generateId(),
      name,
      value,
      unit,
      timestamp: new Date(),
      context
    };

    this.performanceMetrics.push(metric);
    console.log(`⚡ Performance: ${name} = ${value}${unit}`);

    this.sendToAnalytics('performance', metric);
  }

  // Track business metrics
  trackBusinessMetric(
    type: BusinessMetric['type'],
    value: number,
    period: BusinessMetric['period'],
    breakdown?: Record<string, number>
  ): void {
    const metric: BusinessMetric = {
      type,
      value,
      period,
      timestamp: new Date(),
      breakdown
    };

    this.businessMetrics.push(metric);
    console.log(`💼 Business: ${type} = ${value} (${period})`);

    this.sendToAnalytics('business', metric);
  }

  // Track errors
  trackError(
    error: string,
    component: string,
    severity: ErrorMetric['severity'] = 'medium',
    userId?: string
  ): void {
    const metric: ErrorMetric = {
      id: this.generateId(),
      error,
      component,
      timestamp: new Date(),
      userId,
      severity
    };

    this.errorMetrics.push(metric);
    console.error(`🚨 Error: ${severity} - ${error} in ${component}`);

    this.sendToAnalytics('error', metric);
  }

  // Generate analytics dashboard data
  getDashboardData(): {
    userEngagement: {
      totalActions: number;
      uniqueUsers: number;
      averageSessionDuration: number;
      topActions: { action: string; count: number }[];
    };
    performance: {
      averageLoadTime: number;
      slowestComponents: { name: string; avgTime: number }[];
      performanceScore: number;
    };
    business: {
      conversionRate: number;
      engagementRate: number;
      retentionRate: number;
      trends: { type: string; trend: 'up' | 'down' | 'stable' }[];
    };
    errors: {
      totalErrors: number;
      criticalErrors: number;
      errorRate: number;
      topErrors: { error: string; count: number }[];
    };
  } {
    return {
      userEngagement: this.calculateUserEngagement(),
      performance: this.calculatePerformanceMetrics(),
      business: this.calculateBusinessMetrics(),
      errors: this.calculateErrorMetrics()
    };
  }

  private calculateUserEngagement() {
    const totalActions = this.userMetrics.length;
    const uniqueUsers = new Set(this.userMetrics.map(m => m.userId)).size;
    const averageSessionDuration = 12.5; // Simulated

    const actionCounts = this.userMetrics.reduce((acc, metric) => {
      acc[metric.action] = (acc[metric.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalActions,
      uniqueUsers,
      averageSessionDuration,
      topActions
    };
  }

  private calculatePerformanceMetrics() {
    const loadTimeMetrics = this.performanceMetrics.filter(m => m.name.includes('load'));
    const averageLoadTime = loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length || 0;

    const componentTimes = this.performanceMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = { total: 0, count: 0 };
      }
      acc[metric.name].total += metric.value;
      acc[metric.name].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const slowestComponents = Object.entries(componentTimes)
      .map(([name, data]) => ({ name, avgTime: data.total / data.count }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    const performanceScore = averageLoadTime < 100 ? 95 : averageLoadTime < 500 ? 80 : 60;

    return {
      averageLoadTime,
      slowestComponents,
      performanceScore
    };
  }

  private calculateBusinessMetrics() {
    // Simulated business metrics
    return {
      conversionRate: 12.5,
      engagementRate: 68.3,
      retentionRate: 84.7,
      trends: [
        { type: 'conversion', trend: 'up' as const },
        { type: 'engagement', trend: 'stable' as const },
        { type: 'retention', trend: 'up' as const }
      ]
    };
  }

  private calculateErrorMetrics() {
    const totalErrors = this.errorMetrics.length;
    const criticalErrors = this.errorMetrics.filter(m => m.severity === 'critical').length;
    const errorRate = (totalErrors / Math.max(this.userMetrics.length, 1)) * 100;

    const errorCounts = this.errorMetrics.reduce((acc, metric) => {
      acc[metric.error] = (acc[metric.error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalErrors,
      criticalErrors,
      errorRate,
      topErrors
    };
  }

  // Export metrics for analysis
  exportMetrics(): {
    userMetrics: UserMetric[];
    performanceMetrics: PerformanceMetric[];
    businessMetrics: BusinessMetric[];
    errorMetrics: ErrorMetric[];
    summary: any;
  } {
    return {
      userMetrics: this.userMetrics,
      performanceMetrics: this.performanceMetrics,
      businessMetrics: this.businessMetrics,
      errorMetrics: this.errorMetrics,
      summary: this.getDashboardData()
    };
  }

  // Generate insights and recommendations
  generateInsights(): {
    insights: string[];
    recommendations: string[];
    alerts: { level: 'info' | 'warning' | 'error'; message: string }[];
  } {
    const data = this.getDashboardData();
    const insights: string[] = [];
    const recommendations: string[] = [];
    const alerts: { level: 'info' | 'warning' | 'error'; message: string }[] = [];

    // Performance insights
    if (data.performance.averageLoadTime > 500) {
      insights.push('Performance dégradée détectée');
      recommendations.push('Optimiser les composants lents identifiés');
      alerts.push({ level: 'warning', message: 'Temps de chargement élevé' });
    }

    // User engagement insights
    if (data.userEngagement.averageSessionDuration < 5) {
      insights.push('Engagement utilisateur faible');
      recommendations.push('Améliorer l\'UX pour augmenter l\'engagement');
    }

    // Error insights
    if (data.errors.criticalErrors > 0) {
      insights.push('Erreurs critiques détectées');
      recommendations.push('Résoudre les erreurs critiques en priorité');
      alerts.push({ level: 'error', message: `${data.errors.criticalErrors} erreurs critiques` });
    }

    return { insights, recommendations, alerts };
  }

  private sendToAnalytics(type: string, data: any): void {
    // Simulate sending to analytics service
    console.log(`📊 Sending ${type} analytics:`, data);
  }

  private generateId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clear old metrics (for memory management)
  cleanup(olderThan: Date): void {
    this.userMetrics = this.userMetrics.filter(m => m.timestamp >= olderThan);
    this.performanceMetrics = this.performanceMetrics.filter(m => m.timestamp >= olderThan);
    this.businessMetrics = this.businessMetrics.filter(m => m.timestamp >= olderThan);
    this.errorMetrics = this.errorMetrics.filter(m => m.timestamp >= olderThan);
  }
}

export const metricsService = new MetricsService();

// React hook for metrics tracking
export const useMetrics = () => {
  return {
    trackAction: metricsService.trackUserAction.bind(metricsService),
    trackPerformance: metricsService.trackPerformance.bind(metricsService),
    trackBusiness: metricsService.trackBusinessMetric.bind(metricsService),
    trackError: metricsService.trackError.bind(metricsService),
    getDashboard: metricsService.getDashboardData.bind(metricsService),
    getInsights: metricsService.generateInsights.bind(metricsService)
  };
};
