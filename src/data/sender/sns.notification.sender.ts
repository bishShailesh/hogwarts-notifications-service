import { PublishCommand } from '@aws-sdk/client-sns';
import { snsClient } from '../../utils/sns-client.util';
import { logger } from '../../utils/logger.util';
import type { INotificationSender } from './notification.sender.interface';

const TOPIC_ARN = process.env.NOTIFICATION_TOPIC_ARN!;

export class SnsNotificationSender implements INotificationSender {
  async send(recipientEmail: string, message: string): Promise<void> {
    logger.debug('Publishing notification to SNS', { recipientEmail, topicArn: TOPIC_ARN });
    await snsClient.send(
      new PublishCommand({
        TopicArn: TOPIC_ARN,
        Message: message,
        Subject: 'Hogwarts Notification',
        MessageAttributes: {
          recipientEmail: {
            DataType: 'String',
            StringValue: recipientEmail,
          },
        },
      }),
    );
    logger.info('Notification published to SNS', { recipientEmail, topicArn: TOPIC_ARN });
  }
}
