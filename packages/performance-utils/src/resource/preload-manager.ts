/**
 * 资源预加载管理器
 * 资源预加载队列管理、优先级控制
 */

import type { PreloadOptions } from '../types';

/**
 * 预加载任务
 */
interface PreloadTask {
  url: string;
  options: PreloadOptions;
  priority: number;
  status: 'pending' | 'loading' | 'loaded' | 'error';
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

/**
 * 资源预加载管理器
 */
export class PreloadManager {
  private tasks: PreloadTask[] = [];
  private loadingTasks: Set<string> = new Set();
  private maxConcurrent: number = 3;

  /**
   * 预加载资源
   */
  preload(url: string, options?: PreloadOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const priority = this.getPriority(options?.priority || 'auto');

      const task: PreloadTask = {
        url,
        options: options || {},
        priority,
        status: 'pending',
        resolve,
        reject,
      };

      this.tasks.push(task);
      this.tasks.sort((a, b) => b.priority - a.priority);

      this.processQueue();
    });
  }

  /**
   * 获取优先级数值
   */
  private getPriority(priority: 'high' | 'low' | 'auto'): number {
    switch (priority) {
      case 'high':
        return 10;
      case 'low':
        return 1;
      case 'auto':
      default:
        return 5;
    }
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    // 如果已达到最大并发数，等待
    if (this.loadingTasks.size >= this.maxConcurrent) {
      return;
    }

    // 找到下一个待处理的任务
    const task = this.tasks.find((t) => t.status === 'pending');
    if (!task) {
      return;
    }

    // 标记为加载中
    task.status = 'loading';
    this.loadingTasks.add(task.url);

    try {
      await this.loadResource(task.url, task.options);
      task.status = 'loaded';
      task.resolve(undefined);
    } catch (error) {
      task.status = 'error';
      task.reject(error);
    } finally {
      this.loadingTasks.delete(task.url);
      this.processQueue();
    }
  }

  /**
   * 加载资源
   */
  private async loadResource(url: string, options: PreloadOptions): Promise<void> {
    const { as = 'fetch', crossorigin } = options;

    if (typeof document === 'undefined') {
      throw new Error('预加载管理器仅在浏览器环境中可用');
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = as;

      if (crossorigin) {
        link.crossOrigin = crossorigin;
      }

      link.onload = () => resolve(undefined);
      link.onerror = () => reject(new Error(`无法预加载资源: ${url}`));

      document.head.appendChild(link);
    });
  }

  /**
   * 预加载图片
   */
  preloadImage(url: string, options?: Omit<PreloadOptions, 'as'>): Promise<void> {
    return this.preload(url, { ...options, as: 'image' });
  }

  /**
   * 预加载脚本
   */
  preloadScript(url: string, options?: Omit<PreloadOptions, 'as'>): Promise<void> {
    return this.preload(url, { ...options, as: 'script' });
  }

  /**
   * 预加载样式
   */
  preloadStyle(url: string, options?: Omit<PreloadOptions, 'as'>): Promise<void> {
    return this.preload(url, { ...options, as: 'style' });
  }

  /**
   * 批量预加载
   */
  preloadBatch(urls: string[], options?: PreloadOptions): Promise<void[]> {
    return Promise.all(urls.map((url) => this.preload(url, options)));
  }

  /**
   * 取消预加载
   */
  cancel(url: string): boolean {
    const task = this.tasks.find((t) => t.url === url && t.status === 'pending');
    if (task) {
      task.status = 'error';
      task.reject(new Error('预加载已取消'));
      this.tasks = this.tasks.filter((t) => t !== task);
      return true;
    }
    return false;
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(url: string): 'pending' | 'loading' | 'loaded' | 'error' | undefined {
    const task = this.tasks.find((t) => t.url === url);
    return task?.status;
  }

  /**
   * 设置最大并发数
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = max;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.tasks.forEach((task) => {
      if (task.status === 'pending' || task.status === 'loading') {
        task.reject(new Error('预加载管理器已销毁'));
      }
    });
    this.tasks = [];
    this.loadingTasks.clear();
  }
}

/**
 * 创建预加载管理器
 */
export function preloadManager(): PreloadManager {
  return new PreloadManager();
}
