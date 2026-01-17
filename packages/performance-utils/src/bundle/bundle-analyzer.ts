/**
 * 打包分析工具
 * 分析打包产物大小和依赖关系
 */

import type { BundleAnalysisResult } from '../types';

/**
 * 分析打包结果
 * 注意：此函数需要在构建环境中使用
 */
export async function analyzeBundle(
  bundlePath: string
): Promise<BundleAnalysisResult> {
  // 这是一个占位实现
  // 实际实现需要读取文件系统或使用构建工具的输出

  if (typeof process === 'undefined' || !process.cwd) {
    throw new Error('打包分析工具仅在 Node.js 环境中可用');
  }

  try {
    const fs = require('fs');
    const path = require('path');

    const files: Array<{ name: string; size: number; gzippedSize?: number }> = [];
    let totalSize = 0;

    // 递归读取目录
    function readDir(dir: string, basePath: string = ''): void {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
          readDir(fullPath, relativePath);
        } else if (entry.isFile()) {
          const stats = fs.statSync(fullPath);
          const size = stats.size;
          totalSize += size;

          // 只统计 JS/CSS 等资源文件
          const ext = path.extname(entry.name);
          if (
            ['.js', '.mjs', '.css', '.json'].includes(ext) &&
            !entry.name.includes('.map')
          ) {
            files.push({
              name: relativePath,
              size,
            });
          }
        }
      }
    }

    readDir(bundlePath);

    // 按大小排序
    files.sort((a, b) => b.size - a.size);

    // 获取最大的块
    const largestChunks = files.slice(0, 10).map((file) => ({
      name: file.name,
      size: file.size,
    }));

    return {
      totalSize,
      files,
      largestChunks,
    };
  } catch (error) {
    throw new Error(`无法分析打包结果: ${error}`);
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 分析包大小预算
 */
export function checkBundleBudget(
  analysis: BundleAnalysisResult,
  budget: number
): {
  passed: boolean;
  totalSize: number;
  budget: number;
  overBudget: number;
  recommendation: string;
} {
  const overBudget = analysis.totalSize - budget;
  const passed = overBudget <= 0;

  let recommendation = '';
  if (!passed) {
    recommendation = `打包大小超过预算 ${formatFileSize(overBudget)}。建议：`;
    recommendation += '\n1. 检查是否有未使用的依赖';
    recommendation += '\n2. 使用代码分割';
    recommendation += '\n3. 优化大型库的使用';
    recommendation += `\n4. 考虑移除最大的块: ${analysis.largestChunks[0]?.name}`;
  } else {
    recommendation = '打包大小在预算范围内';
  }

  return {
    passed,
    totalSize: analysis.totalSize,
    budget,
    overBudget,
    recommendation,
  };
}
