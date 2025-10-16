import type { SQSEvent, Context } from 'aws-lambda';
import { NotificationService } from '../service/notification.service';
import { DynamoNotificationRepository } from '../data/repository/dynamo.notification.repository';
import { SqsNotificationQueue } from '../data/queue/sqs.notification.queue';
import { logger } from '../utils/logger.util';
import { SnsNotificationSender } from '../data/sender/sns.notification.sender';

const repo = new DynamoNotificationRepository();
const queue = new SqsNotificationQueue();
const sender = new SnsNotificationSender();
const service = new NotificationService(repo, queue, sender);

export const handler = async (
  event: SQSEvent,
  context: Context,
): Promise<{ statusCode: number }> => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    const notificationId = body.notificationId;

    logger.info('Processing delivery for notification', { notificationId });

    try {
      await service.deliver(notificationId);
      logger.info('Notification delivered successfully', { notificationId });
    } catch (error) {
      logger.error('Error processing notification', { error, notificationId });
      // Rethrow so SQS/Lambda will retry.
      // By default, Lambda will attempt to process the message up to 2 more times (3 total attempts).
      // After the max attempts, the message will be sent to the DLQ if one is configured. TODO: DLQ
      throw error;
    }
  }
  return { statusCode: 200 };
};
