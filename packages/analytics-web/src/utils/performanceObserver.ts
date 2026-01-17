/**
 * Performance Observer 工具函数
 */

/**
 * 创建 Performance Observer 包装器
 */
export function createPerformanceObserver(
  entryTypes: string[],
  callback: (entries: PerformanceEntry[]) => void
): PerformanceObserver | null {
  if (typeof PerformanceObserver === "undefined") {
    return null;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });

    observer.observe({ entryTypes });
    return observer;
  } catch (error) {
    console.warn("PerformanceObserver not supported:", error);
    return null;
  }
}

/**
 * 获取所有性能条目
 */
export function getPerformanceEntries(
  entryType?: string
): PerformanceEntry[] {
  if (typeof window === "undefined" || !window.performance) {
    return [];
  }

  if (entryType) {
    return window.performance.getEntriesByType(entryType);
  }

  return window.performance.getEntries();
}

/**
 * 清除性能标记
 */
export function clearPerformanceMarks(markName?: string): void {
  if (typeof performance === "undefined") {
    return;
  }

  if (markName) {
    performance.clearMarks(markName);
  } else {
    performance.clearMarks();
  }
}

/**
 * 清除性能测量
 */
export function clearPerformanceMeasures(measureName?: string): void {
  if (typeof performance === "undefined") {
    return;
  }

  if (measureName) {
    performance.clearMeasures(measureName);
  } else {
    performance.clearMeasures();
  }
}

/**
 * 标记性能时间点
 */
export function markPerformance(markName: string): void {
  if (typeof performance !== "undefined") {
    performance.mark(markName);
  }
}

/**
 * 测量性能区间
 */
export function measurePerformance(
  measureName: string,
  startMark?: string,
  endMark?: string
): void {
  if (typeof performance !== "undefined") {
    try {
      if (startMark && endMark) {
        performance.measure(measureName, startMark, endMark);
      } else if (startMark) {
        performance.measure(measureName, startMark);
      } else {
        performance.measure(measureName);
      }
    } catch (error) {
      console.warn("Performance measure failed:", error);
    }
  }
}
