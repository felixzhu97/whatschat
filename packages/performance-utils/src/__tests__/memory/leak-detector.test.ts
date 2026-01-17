import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { leakDetector, LeakDetector } from '../../memory/leak-detector';

describe('leakDetector', () => {
  let detector: LeakDetector;

  beforeEach(() => {
    vi.useFakeTimers();
    detector = leakDetector();
  });

  afterEach(() => {
    detector.dispose();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('应该创建泄漏检测器', () => {
    expect(detector).toBeInstanceOf(LeakDetector);
  });

  it('应该跟踪对象', () => {
    const obj = {};
    detector.track(obj);
    // WeakMap 无法直接检查，但应该不会抛出错误
    expect(() => detector.track(obj)).not.toThrow();
  });

  it('应该获取内存快照', () => {
    const snapshot = detector.takeSnapshot();
    expect(snapshot).toHaveProperty('heapUsed');
    expect(snapshot).toHaveProperty('heapTotal');
    expect(snapshot).toHaveProperty('timestamp');
    expect(typeof snapshot.heapUsed).toBe('number');
    expect(typeof snapshot.timestamp).toBe('number');
  });

  it('应该检查潜在泄漏', () => {
    const result = detector.check();
    expect(result).toHaveProperty('hasLeak');
    expect(result).toHaveProperty('trackedObjects');
    expect(result).toHaveProperty('memoryGrowth');
    expect(result).toHaveProperty('recommendation');
  });

  it('应该启动和停止监控', () => {
    expect(() => detector.start()).not.toThrow();
    expect(() => detector.stop()).not.toThrow();
  });
});
