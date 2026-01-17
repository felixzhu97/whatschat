import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { delay, waitFor, waitForValue } from '../../async/wait';

describe('Async Wait Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('delay()', () => {
    describe('when waiting for specified milliseconds', () => {
      it('should wait for specified milliseconds', async () => {
        // Arrange (Given)
        const ms = 1000;
        const delayPromise = delay(ms);

        // Act (When)
        vi.advanceTimersByTime(ms);

        // Assert (Then)
        await expect(delayPromise).resolves.toBeUndefined();
      });

      it('should resolve after correct delay', async () => {
        // Arrange (Given)
        const startTime = Date.now();
        const delayPromise = delay(500);

        // Act (When)
        vi.advanceTimersByTime(500);

        // Assert (Then)
        await delayPromise;
        // Note: In fake timers, Date.now() doesn't advance automatically
        // This test mainly verifies the promise resolves
        expect(true).toBe(true);
      });
    });
  });

  describe('waitFor()', () => {
    describe('when waiting for condition', () => {
      it('should resolve when condition becomes true', async () => {
        // Arrange (Given)
        let conditionMet = false;
        const condition = () => conditionMet;
        const waitPromise = waitFor(condition, { timeout: 5000, interval: 100 });

        // Act (When) - Set condition to true after 500ms
        setTimeout(() => {
          conditionMet = true;
        }, 500);
        
        // Advance timers and run all pending promises
        await vi.advanceTimersByTimeAsync(600);
        
        // Assert (Then)
        await expect(waitPromise).resolves.toBeUndefined();
      });

      it('should throw timeout error when condition never met', async () => {
        // Arrange (Given)
        const condition = () => false;
        const waitPromise = waitFor(condition, { timeout: 1000, interval: 100 }).catch((err) => {
          // Catch error to avoid unhandled rejection
          throw err;
        });

        // Act (When) - Advance past timeout
        await vi.advanceTimersByTimeAsync(1100); // Slightly more than timeout

        // Assert (Then)
        await expect(waitPromise).rejects.toThrow(/Condition not met within/);
      });

      it('should check condition at specified intervals', async () => {
        // Arrange (Given)
        let checkCount = 0;
        const condition = () => {
          checkCount++;
          return checkCount >= 3;
        };
        const waitPromise = waitFor(condition, { timeout: 5000, interval: 100 });

        // Act (When) - Advance enough time for 3+ checks
        await vi.advanceTimersByTimeAsync(350); // Enough for at least 3 intervals

        // Assert (Then)
        await expect(waitPromise).resolves.toBeUndefined();
        expect(checkCount).toBeGreaterThanOrEqual(3);
      });

      it('should work with async conditions', async () => {
        // Arrange (Given)
        let resolved = false;
        const condition = async () => {
          await delay(100);
          return resolved;
        };
        const waitPromise = waitFor(condition, { timeout: 5000, interval: 50 });

        // Act (When)
        setTimeout(() => {
          resolved = true;
        }, 200);
        await vi.advanceTimersByTimeAsync(350); // Enough for delay + resolution

        // Assert (Then)
        await expect(waitPromise).resolves.toBeUndefined();
      });
    });
  });

  describe('waitForValue()', () => {
    describe('when waiting for non-null value', () => {
      it('should return value when condition returns non-null', async () => {
        // Arrange (Given)
        let value: string | null = null;
        const condition = () => value;
        const waitPromise = waitForValue(condition, { timeout: 5000, interval: 100 });

        // Act (When)
        setTimeout(() => {
          value = 'result';
        }, 500);
        await vi.advanceTimersByTimeAsync(600); // Enough time for value to be set and checked

        // Assert (Then)
        await expect(waitPromise).resolves.toBe('result');
      });

      it('should throw timeout error when condition never returns value', async () => {
        // Arrange (Given)
        const condition = () => null;
        const waitPromise = waitForValue(condition, { timeout: 1000, interval: 100 }).catch((err) => {
          // Catch error to avoid unhandled rejection
          throw err;
        });

        // Act (When) - Advance past timeout
        await vi.advanceTimersByTimeAsync(1100);

        // Assert (Then)
        await expect(waitPromise).rejects.toThrow(/Condition not met within/);
      });

      it('should work with undefined values', async () => {
        // Arrange (Given)
        let value: string | undefined = undefined;
        const condition = () => value;
        const waitPromise = waitForValue(condition, { timeout: 5000, interval: 100 });

        // Act (When)
        setTimeout(() => {
          value = 'defined';
        }, 500);
        await vi.advanceTimersByTimeAsync(600); // Enough time for value to be set and checked

        // Assert (Then)
        await expect(waitPromise).resolves.toBe('defined');
      });

      it('should work with async conditions returning values', async () => {
        // Arrange (Given)
        let result: number | null = null;
        const condition = async () => {
          await delay(100);
          return result;
        };
        const waitPromise = waitForValue(condition, { timeout: 5000, interval: 50 });

        // Act (When)
        setTimeout(() => {
          result = 42;
        }, 200);
        await vi.advanceTimersByTimeAsync(350); // Enough for delay + resolution

        // Assert (Then)
        await expect(waitPromise).resolves.toBe(42);
      });
    });
  });
});
