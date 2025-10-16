import type { SQSEvent, Context } from 'aws-lambda';
import { NotificationService } from '../service/notification.service';
import { DynamoNotificationRepository } from '../data/repository/dynamo.notification.repository';
import { SqsNotificationQueue } from '../data/queue/sqs.notification.queue';
import { logger } from '../utils/logger.util';

const repo = new DynamoNotificationRepository();
const queue = new SqsNotificationQueue();
const service = new NotificationService(repo, queue);

export const handler = async (
  event: SQSEvent,
  context: Context,
): Promise<{ statusCode: number }> => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const notificationId = body.notificationId;

      logger.info('Processing delivery for notification', { notificationId });

      // Use service to deliver notification
      await service.deliver(notificationId);

      // TODO: Integrate with actual notification delivery service (email, SMS, etc.)
      logger.info('Notification delivered (integration pending)', { notificationId });
    } catch (error) {
      logger.error('Error processing notification', { error });
    }
  }
  return { statusCode: 200 };
};
