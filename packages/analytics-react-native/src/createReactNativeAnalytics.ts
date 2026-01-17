import { ReactNativeAnalytics } from "./ReactNativeAnalytics";
import { AnalyticsConfig, IAnalytics } from "@whatschat/analytics-core";

/**
 * 创建 React Native 平台分析工具实例
 */
export function createReactNativeAnalytics(
  config: AnalyticsConfig
): IAnalytics {
  return new ReactNativeAnalytics(config);
}
