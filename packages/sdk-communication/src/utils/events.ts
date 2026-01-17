/**
 * 事件发射器
 */
export class EventEmitter {
  private events: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  /**
   * 监听事件
   */
  on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)?.add(handler);
  }

  /**
   * 移除事件监听
   */
  off(event: string, handler: (...args: unknown[]) => void): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * 触发事件
   */
  protected emit(event: string, ...args: unknown[]): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 移除所有事件监听
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}
