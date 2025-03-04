
// AI monitoring types
export interface MonitoringReport {
  behavioralScore: number;
  islamicComplianceScore: number;
  sentimentScore: number;
  violations: Violation[];
  recommendations: string[];
  timestamp: string;
}

export interface Violation {
  type: 'behavioral' | 'islamic' | 'sentiment';
  severity: 'low' | 'medium' | 'high';
  message: string;
  messageId: string;
  timestamp: string;
  metadata?: {
    context?: string;
    [key: string]: any;
  };
}

// Islamic guidelines (simplified for demonstration)
export const ISLAMIC_GUIDELINES = [
  { pattern: /dating|boyfriend|girlfriend/, severity: 'high' as const, message: 'Dating terms detected' },
  { pattern: /alcohol|wine|beer|drinking/, severity: 'medium' as const, message: 'Alcohol references detected' },
  { pattern: /meet alone|private meeting/, severity: 'medium' as const, message: 'Meeting without wali supervision' },
  { pattern: /inappropriate|flirting/, severity: 'medium' as const, message: 'Potentially inappropriate tone' },
  { pattern: /phone number|address|location/, severity: 'low' as const, message: 'Sharing personal details' },
];
