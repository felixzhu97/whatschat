/**
 * @whatschat/aws-integration
 * 
 * AWS 集成工具包
 * 提供对 S3、SES、SNS、SQS、Lambda、Cognito 和 CloudWatch 等 AWS 服务的统一封装接口
 * 
 * @example
 * ```typescript
 * import { S3Client, SESClient, SNSClient } from '@whatschat/aws-integration';
 * 
 * // 创建 S3 客户端
 * const s3Client = new S3Client({ region: 'us-east-1' });
 * await s3Client.uploadFile({
 *   bucket: 'my-bucket',
 *   key: 'path/to/file.txt',
 *   body: 'file content'
 * });
 * 
 * // 创建 SES 客户端
 * const sesClient = new SESClient({ region: 'us-east-1' });
 * await sesClient.sendEmail({
 *   from: 'sender@example.com',
 *   to: 'recipient@example.com',
 *   subject: 'Hello',
 *   body: 'World'
 * });
 * ```
 */

// 导出类型
export * from './types';

// 导出配置
export * from './config/aws-config';

// 导出工具函数
export * from './utils';

// 导出服务客户端
export * from './services/s3';
export * from './services/ses';
export * from './services/sns';
export * from './services/sqs';
export * from './services/lambda';
export * from './services/cognito';
export * from './services/cloudwatch';