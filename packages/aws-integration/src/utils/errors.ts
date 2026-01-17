import { AWSError } from '../types';
import type { ServiceException } from '@aws-sdk/smithy-client';

/**
 * 将 AWS SDK 错误转换为统一的 AWSError
 */
export function normalizeAWSError(error: unknown): AWSError {
  if (error instanceof AWSError) {
    return error;
  }

  if (error instanceof Error) {
    // 检查是否是 AWS SDK ServiceException
    const awsError = error as ServiceException;
    
    if (awsError.name && awsError.$metadata) {
      return new AWSError(
        awsError.message || 'Unknown AWS error',
        awsError.name,
        awsError.$metadata.httpStatusCode,
        awsError.$metadata.requestId,
        error
      );
    }

    // 普通 Error 对象
    return new AWSError(error.message, undefined, undefined, undefined, error);
  }

  // 未知错误类型
  return new AWSError(
    `Unknown error: ${String(error)}`,
    undefined,
    undefined,
    undefined,
    error instanceof Error ? error : undefined
  );
}

/**
 * 检查错误是否是特定类型的 AWS 错误
 */
export function isAWSError(error: unknown, code?: string): error is AWSError {
  if (!(error instanceof AWSError)) {
    return false;
  }

  if (code) {
    return error.code === code;
  }

  return true;
}

/**
 * 检查是否是可重试的错误
 */
export function isRetryableError(error: unknown): boolean {
  if (!isAWSError(error)) {
    return false;
  }

  // 5xx 错误通常可重试
  if (error.statusCode && error.statusCode >= 500) {
    return true;
  }

  // 特定错误代码可重试
  const retryableCodes = [
    'Throttling',
    'ThrottlingException',
    'ThrottledException',
    'RequestThrottled',
    'TooManyRequestsException',
    'ServiceUnavailable',
    'InternalServerError',
    'RequestTimeout',
    'RequestTimeoutException',
    'ECONNRESET',
    'ENOTFOUND',
    'ETIMEDOUT',
  ];

  if (error.code && retryableCodes.includes(error.code)) {
    return true;
  }

  return false;
}