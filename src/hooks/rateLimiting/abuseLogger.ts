import { AbuseLog } from './types';

export const logAbuseAttempt = async (endpoint: string, requestData?: any): Promise<void> => {
  const abuseLog: AbuseLog = {
    endpoint,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ip: 'client-side', // Would be server-side in real implementation
    requestData: requestData ? JSON.stringify(requestData).substring(0, 100) : null
  };

  console.group('🚨 Abuse Detection');
  console.error('Rate limit exceeded:', abuseLog);
  console.groupEnd();

  // Store abuse attempts
  try {
    const existingLogs = JSON.parse(localStorage.getItem('abuse_logs') || '[]');
    existingLogs.push(abuseLog);
    
    // Keep only last 50 logs
    const recentLogs = existingLogs.slice(-50);
    localStorage.setItem('abuse_logs', JSON.stringify(recentLogs));
  } catch (error) {
    console.warn('Failed to store abuse log:', error);
  }
};
