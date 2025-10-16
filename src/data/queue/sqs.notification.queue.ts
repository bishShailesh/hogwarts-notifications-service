import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '../../utils/sqs-client.util';
import type { INotificationQueue } from './notification.queue.interface';
import { logger } from '../../utils/logger.util';

const QUEUE_URL = process.env.NOTIFICATION_QUEUE_URL!;

export class SqsNotificationQueue implements INotificationQueue {
  async enqueue(notificationId: string): Promise<void> {
    logger.debug('Enqueuing notification to SQS', { notificationId, queueUrl: QUEUE_URL });
    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify({ notificationId }),
      }),
    );
    logger.info('Notification enqueued to SQS', { notificationId, queueUrl: QUEUE_URL });
  }
}
