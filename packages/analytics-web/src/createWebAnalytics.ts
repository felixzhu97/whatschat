import { WebAnalytics } from "./WebAnalytics";
import { AnalyticsConfig, IAnalytics } from "@whatschat/analytics-core";

/**
 * 创建 Web 平台分析工具实例
 */
export function createWebAnalytics(config: AnalyticsConfig): IAnalytics {
  return new WebAnalytics(config);
}
