import { SESv2Client, SendEmailCommand, SendBulkEmailCommand, SendTemplatedEmailCommand } from '@aws-sdk/client-sesv2';
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
        messageId: result.MessageId || '',
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 批量发送邮件
   */
  async sendBulkEmail(options: SESBulkEmailOptions): Promise<{ messageId: string; errors: Array<{ email: string; error: string }> }> {
    try {
      const destinations = options.destinations.map((dest) => ({
        Destination: {
          ToAddresses: Array.isArray(dest.to) ? dest.to : [dest.to],
        },
        ReplacementEmailContent: {
          ReplacementTemplate: {
            ReplacementSubject: {
              Data: dest.subject,
              Charset: 'UTF-8',
            },
            ReplacementHtmlPart: dest.htmlBody ? {
              Data: dest.htmlBody,
              Charset: 'UTF-8',
            } : undefined,
            ReplacementTextPart: !dest.htmlBody ? {
              Data: dest.body,
              Charset: 'UTF-8',
            } : undefined,
          },
        },
      }));

      const command = new SendBulkEmailCommand({
        FromEmailAddress: options.from,
        BulkEmailEntries: destinations,
      });

      const result = await withRetry(() => this.client.send(command));
      
      const errors: Array<{ email: string; error: string }> = [];
      if (result.BulkEmailEntryResults) {
        for (let i = 0; i < result.BulkEmailEntryResults.length; i++) {
          const entry = result.BulkEmailEntryResults[i];
          if (entry.Error) {
            const dest = options.destinations[i];
            const email = Array.isArray(dest.to) ? dest.to[0] : dest.to;
            errors.push({
              email,
              error: entry.Error.Message || 'Unknown error',
            });
          }
        }
      }

      return {
        messageId: result.MessageId || '',
        errors,
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 发送模板邮件
   */
  async sendTemplatedEmail(options: SESTemplatedEmailOptions): Promise<{ messageId: string }> {
    try {
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

      const command = new SendTemplatedEmailCommand({
        FromEmailAddress: options.from,
        Destination: {
          ToAddresses: toAddresses,
        },
        Template: options.template,
        TemplateData: JSON.stringify(options.templateData),
      });

      const result = await withRetry(() => this.client.send(command));
      return {
        messageId: result.MessageId || '',
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }
}