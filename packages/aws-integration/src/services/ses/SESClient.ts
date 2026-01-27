import { SESv2Client, SendEmailCommand, SendBulkEmailCommand } from '@aws-sdk/client-sesv2';
import type { AWSConfig } from '../../types';
import type { SESSendEmailOptions, SESBulkEmailOptions, SESTemplatedEmailOptions } from '../../types';
import { mergeAWSConfig, validateAWSConfig } from '../../config/aws-config';
import { normalizeAWSError, withRetry } from '../../utils';

/**
 * SES 客户端封装类
 */
export class SESClient {
  private client: SESv2Client;

  constructor(config?: Partial<AWSConfig>) {
    const mergedConfig = mergeAWSConfig({ region: 'us-east-1' }, config);
    validateAWSConfig(mergedConfig);
    this.client = new SESv2Client(mergedConfig);
  }

  /**
   * 发送邮件
   */
  async sendEmail(options: SESSendEmailOptions): Promise<{ messageId: string }> {
    try {
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
      const ccAddresses = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined;
      const bccAddresses = options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined;
      const replyToAddresses = options.replyTo ? (Array.isArray(options.replyTo) ? options.replyTo : [options.replyTo]) : undefined;

      const command = new SendEmailCommand({
        FromEmailAddress: options.from,
        Destination: {
          ToAddresses: toAddresses,
          CcAddresses: ccAddresses,
          BccAddresses: bccAddresses,
        },
        Content: {
          Simple: {
            Subject: {
              Data: options.subject,
              Charset: 'UTF-8',
            },
            Body: {
              Text: options.htmlBody ? undefined : {
                Data: options.body,
                Charset: 'UTF-8',
              },
              Html: options.htmlBody ? {
                Data: options.htmlBody,
                Charset: 'UTF-8',
              } : undefined,
            },
          },
        },
        ReplyToAddresses: replyToAddresses,
      });

      const result = await withRetry(() => this.client.send(command));
      return {
        messageId: (result as any).MessageId || '',
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 批量发送邮件
   * Note: SendBulkEmailCommand requires DefaultEmailContent at command level
   * For per-recipient customization, we'll use individual SendEmailCommand calls
   */
  async sendBulkEmail(options: SESBulkEmailOptions): Promise<{ messageId: string; errors: Array<{ email: string; error: string }> }> {
    try {
      const errors: Array<{ email: string; error: string }> = [];
      const messageIds: string[] = [];

      // Send emails individually for better error handling and per-recipient customization
      for (const dest of options.destinations) {
        try {
          const toAddresses = Array.isArray(dest.to) ? dest.to : [dest.to];
          const command = new SendEmailCommand({
            FromEmailAddress: options.from,
            Destination: {
              ToAddresses: toAddresses,
            },
            Content: {
              Simple: {
                Subject: {
                  Data: dest.subject,
                  Charset: 'UTF-8',
                },
                Body: {
                  Text: dest.htmlBody ? undefined : {
                    Data: dest.body,
                    Charset: 'UTF-8',
                  },
                  Html: dest.htmlBody ? {
                    Data: dest.htmlBody,
                    Charset: 'UTF-8',
                  } : undefined,
                },
              },
            },
          });

          const result = await withRetry(() => this.client.send(command));
          const messageId = (result as any).MessageId;
          if (messageId) {
            messageIds.push(messageId);
          }
        } catch (error: any) {
          const email = Array.isArray(dest.to) ? dest.to[0] : dest.to;
          errors.push({
            email,
            error: error?.message || error?.toString() || 'Unknown error',
          });
        }
      }

      return {
        messageId: messageIds[0] || '',
        errors,
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 发送模板邮件
   * Note: SESv2 doesn't have SendTemplatedEmailCommand, using regular email with template data in body
   */
  async sendTemplatedEmail(options: SESTemplatedEmailOptions): Promise<{ messageId: string }> {
    try {
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

      // SESv2 doesn't support templated emails directly, so we'll use regular email
      // In a real implementation, you might want to use SESv1 or a template service
      const templateDataStr = JSON.stringify(options.templateData);
      
      const command = new SendEmailCommand({
        FromEmailAddress: options.from,
        Destination: {
          ToAddresses: toAddresses,
        },
        Content: {
          Simple: {
            Subject: {
              Data: `Template: ${options.template}`,
              Charset: 'UTF-8',
            },
            Body: {
              Text: {
                Data: `Template: ${options.template}\nData: ${templateDataStr}`,
                Charset: 'UTF-8',
              },
            },
          },
        },
      });

      const result = await withRetry(() => this.client.send(command));
      return {
        messageId: (result as any).MessageId || '',
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }
}