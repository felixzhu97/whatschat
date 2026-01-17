/**
 * Web Vitals 指标收集工具
 */

export interface WebVitals {
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

/**
 * 收集 Web Vitals 指标
 */
export function collectWebVitals(): Promise<WebVitals> {
  return new Promise((resolve) => {
    const vitals: WebVitals = {};
    let resolved = false;

    // First Contentful Paint (FCP)
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(
            (entry) => entry.name === "first-contentful-paint"
          ) as PerformancePaintTiming | undefined;
          if (fcpEntry && !vitals.firstContentfulPaint) {
            vitals.firstContentfulPaint = fcpEntry.startTime;
            checkComplete();
          }
        });
        fcpObserver.observe({ entryTypes: ["paint"] });
      } catch (error) {
        console.warn("FCP observer not supported:", error);
      }
    }

    // Largest Contentful Paint (LCP)
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as
            | PerformanceEntry
            | undefined;
          if (lastEntry) {
            vitals.largestContentfulPaint = lastEntry.startTime;
            checkComplete();
          }
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch (error) {
        console.warn("LCP observer not supported:", error);
      }
    }

    // First Input Delay (FID)
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const perfEntry = entry as PerformanceEventTiming;
            if (perfEntry.processingStart && perfEntry.startTime) {
              vitals.firstInputDelay =
                perfEntry.processingStart - perfEntry.startTime;
              checkComplete();
            }
          });
        });
        fidObserver.observe({ entryTypes: ["first-input"] });
      } catch (error) {
        console.warn("FID observer not supported:", error);
      }
    }

    // Cumulative Layout Shift (CLS)
    if (typeof PerformanceObserver !== "undefined") {
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const layoutShift = entry as PerformanceEntry & {
              value?: number;
              hadRecentInput?: boolean;
            };
            if (!layoutShift.hadRecentInput && layoutShift.value) {
              clsValue += layoutShift.value;
            }
          });
          vitals.cumulativeLayoutShift = clsValue;
          checkComplete();
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });
      } catch (error) {
        console.warn("CLS observer not supported:", error);
      }
    }

    // 超时处理（5秒后返回已有指标）
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(vitals);
      }
    }, 5000);

    function checkComplete() {
      // 检查是否所有指标都已收集（或超时）
      // 这里简化处理，实际上需要更复杂的逻辑
    }
  });
}

/**
 * 获取 Navigation Timing 指标
 */
export function getNavigationTiming(): {
  dns: number;
  tcp: number;
  request: number;
  response: number;
  dom: number;
  load: number;
} | null {
  if (
    typeof window === "undefined" ||
    !window.performance ||
    !window.performance.getEntriesByType
  ) {
    return null;
  }

  const navigation = window.performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming | undefined;

  if (!navigation) {
    return null;
  }

  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domComplete - (navigation.domContentLoadedEventStart || navigation.domInteractive),
    load: navigation.loadEventEnd - navigation.fetchStart,
  };
}
