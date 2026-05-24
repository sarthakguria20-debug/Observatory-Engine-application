export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  ruleMatched: string;
  severity: 'HIGH' | 'CRITICAL';
  logContext: LogEntry;
  acknowledged: boolean;
}

export interface MetricsSnapshot {
  timestamp: string;
  totalLogs: number;
  errorRate: number;
  serviceBreakdown: Record<string, number>;
}
