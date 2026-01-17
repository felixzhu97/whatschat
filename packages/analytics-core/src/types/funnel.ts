/**
 * 转化漏斗类型定义
 */

export interface FunnelStep {
  id: string;
  name: string;
  event: string;
  properties?: Record<string, unknown>;
}

export interface Funnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  createdAt: number;
}

export interface FunnelEvent {
  funnelId: string;
  stepId: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  properties?: Record<string, unknown>;
}

export interface FunnelResult {
  funnelId: string;
  totalUsers: number;
  stepConversions: Array<{
    stepId: string;
    stepName: string;
    users: number;
    conversionRate: number;
  }>;
  overallConversionRate: number;
  period: {
    start: number;
    end: number;
  };
}

export type FunnelCallback = (result: FunnelResult) => void | Promise<void>;
