/**
 * 性能预算检查器
 * 检查性能预算是否符合预期
 */

import type { PerformanceBudget, BudgetCheckResult } from '../types';

/**
 * 性能预算检查器
 */
export class BudgetChecker {
  private budget: PerformanceBudget;

  constructor(budget: PerformanceBudget) {
    this.budget = budget;
  }

  /**
   * 检查预算
   */
  check(
    metrics: Partial<{
      bundleSize: number;
      loadTime: number;
      fcp: number;
      lcp: number;
    }>
  ): BudgetCheckResult {
    const violations: Array<{
      metric: string;
      actual: number;
      budget: number;
    }> = [];

    // 检查包大小
    if (this.budget.bundleSize !== undefined && metrics.bundleSize !== undefined) {
      if (metrics.bundleSize > this.budget.bundleSize) {
        violations.push({
          metric: 'bundleSize',
          actual: metrics.bundleSize,
          budget: this.budget.bundleSize,
        });
      }
    }

    // 检查加载时间
    if (this.budget.loadTime !== undefined && metrics.loadTime !== undefined) {
      if (metrics.loadTime > this.budget.loadTime) {
        violations.push({
          metric: 'loadTime',
          actual: metrics.loadTime,
          budget: this.budget.loadTime,
        });
      }
    }

    // 检查 FCP
    if (this.budget.fcp !== undefined && metrics.fcp !== undefined) {
      if (metrics.fcp > this.budget.fcp) {
        violations.push({
          metric: 'fcp',
          actual: metrics.fcp,
          budget: this.budget.fcp,
        });
      }
    }

    // 检查 LCP
    if (this.budget.lcp !== undefined && metrics.lcp !== undefined) {
      if (metrics.lcp > this.budget.lcp) {
        violations.push({
          metric: 'lcp',
          actual: metrics.lcp,
          budget: this.budget.lcp,
        });
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * 更新预算
   */
  updateBudget(budget: Partial<PerformanceBudget>): void {
    this.budget = {
      ...this.budget,
      ...budget,
    };
  }

  /**
   * 获取预算
   */
  getBudget(): PerformanceBudget {
    return { ...this.budget };
  }
}

/**
 * 创建性能预算检查器
 */
export function budgetChecker(budget: PerformanceBudget): BudgetChecker {
  return new BudgetChecker(budget);
}

/**
 * 格式化预算结果
 */
export function formatBudgetResult(result: BudgetCheckResult): string {
  if (result.passed) {
    return '所有性能指标都在预算范围内';
  }

  let message = '性能预算违反:\n';
  result.violations.forEach((violation) => {
    const overBudget = violation.actual - violation.budget;
    const percentage = ((overBudget / violation.budget) * 100).toFixed(2);
    message += `  - ${violation.metric}: 实际值 ${violation.actual}，预算 ${violation.budget}，超出 ${percentage}%\n`;
  });

  return message;
}
