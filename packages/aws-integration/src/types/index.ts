import type { Credentials } from '@aws-sdk/types';

/**
 * AWS 配置接口
 */
export interface AWSConfig {
  region?: string;
  credentials?: Credentials;
  endpoint?: string;
}

/**
 * S3 上传文件选项
 */
export interface S3UploadOptions {
  bucket: string;
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

/**
 * S3 下载文件选项
 */
export interface S3DownloadOptions {
  bucket: string;
  key: string;
}

/**
 * S3 预签名 URL 选项
 */
export interface S3PresignedUrlOptions {
  bucket: string;
  key: string;
  expiresIn?: number;
}

/**
 * SES 发送邮件选项
 */
export interface SESSendEmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  body: string;
  htmlBody?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * SES 批量发送邮件选项
 */
export interface SESBulkEmailOptions {
  from: string;
  destinations: Array<{
    to: string | string[];
    subject: string;
    body: string;
    htmlBody?: string;
  }>;
}

/**
 * SES 模板邮件选项
 */
export interface SESTemplatedEmailOptions {
  from: string;
  to: string | string[];
  template: string;
  templateData: Record<string, unknown>;
}

/**
 * SNS 发布消息选项
 */
export interface SNSPublishOptions {
  topicArn?: string;
  targetArn?: string;
  message: string;
  subject?: string;
  attributes?: Record<string, string>;
}

/**
 * SNS 订阅选项
 */
export interface SNSSubscribeOptions {
  topicArn: string;
  protocol: 'email' | 'sms' | 'sqs' | 'http' | 'https' | 'application';
  endpoint: string;
}

/**
 * SQS 发送消息选项
 */
export interface SQSSendMessageOptions {
  queueUrl: string;
  messageBody: string;
  delaySeconds?: number;
  attributes?: Record<string, string>;
}

/**
 * SQS 接收消息选项
 */
export interface SQSReceiveMessageOptions {
  queueUrl: string;
  maxNumberOfMessages?: number;
  waitTimeSeconds?: number;
  visibilityTimeout?: number;
}

/**
 * Lambda 调用选项
 */
export interface LambdaInvokeOptions {
  functionName: string;
  payload?: Record<string, unknown> | string;
  invocationType?: 'RequestResponse' | 'Event' | 'DryRun';
}

/**
 * Cognito 注册选项
 */
export interface CognitoSignUpOptions {
  clientId: string;
  username: string;
  password: string;
  email?: string;
  phoneNumber?: string;
  attributes?: Record<string, string>;
}

/**
 * Cognito 登录选项
 */
export interface CognitoSignInOptions {
  clientId: string;
  username: string;
  password: string;
}

/**
 * Cognito 确认注册选项
 */
export interface CognitoConfirmSignUpOptions {
  clientId: string;
  username: string;
  confirmationCode: string;
}

/**
 * Cognito 刷新令牌选项
 */
export interface CognitoRefreshTokenOptions {
  clientId: string;
  refreshToken: string;
}

/**
 * CloudWatch 指标选项
 */
export interface CloudWatchPutMetricOptions {
  namespace: string;
  metricName: string;
  value: number;
  unit?: string;
  dimensions?: Record<string, string>;
  timestamp?: Date;
}

/**
 * CloudWatch 写入日志选项
 */
export interface CloudWatchPutLogsOptions {
  logGroupName: string;
  logStreamName: string;
  logEvents: Array<{
    message: string;
    timestamp: number;
  }>;
}

/**
 * CloudWatch 查询日志选项
 */
export interface CloudWatchGetLogsOptions {
  logGroupName: string;
  startTime: number;
  endTime: number;
  filterPattern?: string;
  limit?: number;
}

/**
 * CloudWatch 创建告警选项
 */
export interface CloudWatchCreateAlarmOptions {
  alarmName: string;
  metricName: string;
  namespace: string;
  statistic: 'SampleCount' | 'Average' | 'Sum' | 'Minimum' | 'Maximum';
  period: number;
  evaluationPeriods: number;
  threshold: number;
  comparisonOperator: 'GreaterThanThreshold' | 'LessThanThreshold' | 'GreaterThanOrEqualToThreshold' | 'LessThanOrEqualToThreshold';
  alarmActions?: string[];
}

/**
 * AWS 错误类型
 */
export class AWSError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly requestId?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AWSError';
    Object.setPrototypeOf(this, AWSError.prototype);
  }
}