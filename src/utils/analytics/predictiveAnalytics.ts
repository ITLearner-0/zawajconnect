/**
 * Predictive Analytics Utilities
 * Provides statistical functions for trend prediction and anomaly detection
 */

export interface DataPoint {
  date: string;
  value: number;
}

export interface Prediction {
  date: string;
  predicted: number;
  confidence: number; // 0-1
  lower_bound: number;
  upper_bound: number;
}

export interface Anomaly {
  date: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  metric: string;
}

/**
 * Calculate moving average for smoothing data
 */
export const calculateMovingAverage = (data: DataPoint[], window: number = 7): DataPoint[] => {
  const result: DataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    const avg = slice.reduce((sum, point) => sum + point.value, 0) / slice.length;

    result.push({
      date: data[i]?.date ?? '',
      value: avg,
    });
  }

  return result;
};

/**
 * Simple linear regression for trend prediction
 */
export const linearRegression = (data: DataPoint[]): { slope: number; intercept: number } => {
  const n = data.length;

  // Convert dates to numeric indices
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data.map((d) => d.value);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * (y[i] ?? 0), 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

/**
 * Predict future values based on historical data
 */
export const predictFutureValues = (data: DataPoint[], daysAhead: number = 30): Prediction[] => {
  if (data.length < 3) return [];

  const { slope, intercept } = linearRegression(data);

  // Calculate standard deviation for confidence intervals
  const predictions = data.map((_, i) => slope * i + intercept);
  const residuals = data.map((d, i) => d.value - (predictions[i] ?? 0));
  const stdDev = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length);

  const result: Prediction[] = [];
  const lastDateStr = data[data.length - 1]?.date;
  if (!lastDateStr) return [];

  const lastDate = new Date(lastDateStr);

  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);

    const predicted = slope * (data.length + i - 1) + intercept;
    const confidence = Math.max(0, 1 - (i / daysAhead) * 0.5); // Decreases with time

    const dateString = futureDate.toISOString().split('T')[0];
    if (!dateString) continue;

    result.push({
      date: dateString,
      predicted: Math.max(0, Math.round(predicted)),
      confidence,
      lower_bound: Math.max(0, Math.round(predicted - 2 * stdDev)),
      upper_bound: Math.max(0, Math.round(predicted + 2 * stdDev)),
    });
  }

  return result;
};

/**
 * Detect anomalies in the data using statistical methods
 */
export const detectAnomalies = (
  data: DataPoint[],
  metric: string,
  threshold: number = 2.5 // Z-score threshold
): Anomaly[] => {
  if (data.length < 7) return [];

  // Calculate moving average and standard deviation
  const movingAvg = calculateMovingAverage(data, 7);

  const anomalies: Anomaly[] = [];

  data.forEach((point, index) => {
    if (index < 7) return; // Skip first week (not enough data)

    const recentData = data.slice(Math.max(0, index - 14), index);
    const mean = recentData.reduce((sum, p) => sum + p.value, 0) / recentData.length;
    const variance =
      recentData.reduce((sum, p) => sum + Math.pow(p.value - mean, 2), 0) / recentData.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return;

    const zScore = Math.abs((point.value - mean) / stdDev);

    if (zScore > threshold) {
      const deviation = ((point.value - mean) / mean) * 100;

      anomalies.push({
        date: point.date,
        value: point.value,
        expected: Math.round(mean),
        deviation: Math.round(deviation),
        severity: zScore > 4 ? 'high' : zScore > 3 ? 'medium' : 'low',
        metric,
      });
    }
  });

  return anomalies;
};

/**
 * Calculate trend direction and strength
 */
export const calculateTrend = (
  data: DataPoint[]
): {
  direction: 'up' | 'down' | 'stable';
  strength: number; // 0-1
  changePercent: number;
} => {
  if (data.length < 2) {
    return { direction: 'stable', strength: 0, changePercent: 0 };
  }

  const { slope } = linearRegression(data);
  const firstValue = data[0]?.value || 1;
  const changePercent = ((slope * data.length) / firstValue) * 100;

  const direction = Math.abs(changePercent) < 5 ? 'stable' : changePercent > 0 ? 'up' : 'down';
  const strength = Math.min(1, Math.abs(changePercent) / 50); // Normalize to 0-1

  return {
    direction,
    strength,
    changePercent: Math.round(changePercent * 10) / 10,
  };
};

/**
 * Calculate forecast accuracy for past predictions
 */
export const calculateAccuracy = (actual: DataPoint[], predicted: DataPoint[]): number => {
  if (actual.length !== predicted.length) return 0;

  const errors = actual.map((point, i) => {
    const predictedPoint = predicted[i];
    if (!predictedPoint) return 0;
    return Math.abs(point.value - predictedPoint.value) / (point.value || 1);
  });

  const mape = errors.reduce((sum, err) => sum + err, 0) / errors.length;
  return Math.max(0, Math.min(100, (1 - mape) * 100));
};
