import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retry, timeout } from '../../async/retry';

describe('Async Retry Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('retry()', () => {
    describe('when retrying on failure', () => {
      it('should retry on failure and succeed eventually', async () => {
        // Arrange (Given)
        let attemptCount = 0;
        const fn = async () => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error('Temporary failure');
          }
          return 'success';
        };

        // Act (When)
        const promise = retry(fn, { maxAttempts: 3, delay: 100, delayBeforeRetry: true });
        
        // Advance timers to allow retries to complete
        await vi.advanceTimersByTimeAsync(350); // Enough for 2 retries (2 * 100ms delay) + processing
        
        const result = await promise;

        // Assert (Then)
        expect(result).toBe('success');
        expect(attemptCount).toBe(3);
      });

      it('should throw last error after max attempts', async () => {
        // Arrange (Given)
        let attemptCount = 0;
        const fn = async () => {
          attemptCount++;
          throw new Error('Persistent failure');
        };

        // Act (When)
        const promise = retry(fn, { maxAttempts: 3, delay: 100, delayBeforeRetry: true }).catch((err) => {
          // Catch error to avoid unhandled rejection
          throw err;
        });
        
        // Advance timers to allow all retries to complete
        await vi.advanceTimersByTimeAsync(350); // Enough for 2 retries (2 * 100ms delay) + processing

        // Assert (Then)
        await expect(promise).rejects.toThrow('Persistent failure');
        expect(attemptCount).toBe(3);
      });

      it('should not delay before first attempt', async () => {
        // Arrange (Given)
        let attemptCount = 0;
        const fn = async () => {
          attemptCount++;
          return 'success';
        };

        // Act (When)
        const promise = retry(fn, {
          maxAttempts: 1,
          delay: 1000,
          delayBeforeRetry: true,
        });
        // No need to advance timers for first attempt
        const result = await promise;

        // Assert (Then)
        expect(result).toBe('success');
        expect(attemptCount).toBe(1);
      });

      it('should respect delayBeforeRetry option', async () => {
        // Arrange (Given)
        let attemptCount = 0;
        const fn = async () => {
          attemptCount++;
          if (attemptCount < 2) {
            throw new Error('Fail once');
          }
          return 'success';
        };

        // Act (When)
        const promise = retry(fn, {
          maxAttempts: 2,
          delay: 500,
          delayBeforeRetry: false,
        });
        // Should not delay between retries when delayBeforeRetry is false
        vi.advanceTimersByTime(10); // Minimal advance
        const result = await promise;

        // Assert (Then)
        expect(result).toBe('success');
      });

      it('should work with synchronous functions', async () => {
        // Arrange (Given)
        let attemptCount = 0;
        const fn = () => {
          attemptCount++;
          if (attemptCount < 2) {
            throw new Error('Fail once');
          }
          return 'success';
        };

        // Act (When)
        const promise = retry(fn, { maxAttempts: 2, delay: 100 });
        vi.advanceTimersByTime(200);
        const result = await promise;

        // Assert (Then)
        expect(result).toBe('success');
        expect(attemptCount).toBe(2);
      });
    });
  });

  describe('timeout()', () => {
    describe('when waiting for promise with timeout', () => {
      it('should resolve if promise completes within timeout', async () => {
        // Arrange (Given)
        const fastPromise = new Promise<string>((resolve) => {
          setTimeout(() => resolve('success'), 100);
        });

        // Act (When)
        const timeoutPromise = timeout(fastPromise, 500, 'Timeout error');
        vi.advanceTimersByTime(100);
        const result = await timeoutPromise;

        // Assert (Then)
        expect(result).toBe('success');
      });

      it('should reject if promise exceeds timeout', async () => {
        // Arrange (Given)
        const slowPromise = new Promise<string>((resolve) => {
          setTimeout(() => resolve('success'), 1000);
        });

        // Act (When)
        const timeoutPromise = timeout(slowPromise, 500, 'Custom timeout error');
        vi.advanceTimersByTime(500);

        // Assert (Then)
        await expect(timeoutPromise).rejects.toThrow('Custom timeout error');
      });

      it('should use default error message if not provided', async () => {
        // Arrange (Given)
        const slowPromise = new Promise<string>((resolve) => {
          setTimeout(() => resolve('success'), 1000);
        });

        // Act (When)
        const timeoutPromise = timeout(slowPromise, 500);
        vi.advanceTimersByTime(500);

        // Assert (Then)
        await expect(timeoutPromise).rejects.toThrow(/Operation timed out/);
      });

      it('should work with rejecting promises', async () => {
        // Arrange (Given)
        const rejectingPromise = new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error('Promise rejected')), 100);
        });

        // Act (When)
        const timeoutPromise = timeout(rejectingPromise, 500);
        vi.advanceTimersByTime(100);

        // Assert (Then)
        await expect(timeoutPromise).rejects.toThrow('Promise rejected');
      });

      it('should handle immediate resolution', async () => {
        // Arrange (Given)
        const immediatePromise = Promise.resolve('immediate');

        // Act (When)
        const timeoutPromise = timeout(immediatePromise, 5000);

        // Assert (Then)
        await expect(timeoutPromise).resolves.toBe('immediate');
      });
    });
  });
});
