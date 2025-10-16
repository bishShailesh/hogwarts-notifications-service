import { wrapLambdaHandler } from '../utils/lambda-wrapper.util';
import { NotificationService } from '../service/notification.service';
import { DynamoNotificationRepository } from '../data/repository/dynamo.notification.repository';
import { SqsNotificationQueue } from '../data/queue/sqs.notification.queue';
import { BadRequestError, NotFoundError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';

const repo = new DynamoNotificationRepository();
const queue = new SqsNotificationQueue();
const service = new NotificationService(repo, queue);

export const handler = wrapLambdaHandler(async (event) => {
  const notificationId = event.pathParameters?.id;
  if (!notificationId) {
    throw new BadRequestError('Missing notification id in path');
  }

  logger.info('Fetching notification', { notificationId });

  const notification = await service.get(notificationId);

  if (!notification) {
    throw new NotFoundError('Notification', `Notification with id ${notificationId} not found`);
  }

  logger.info('Notification fetched', { notificationId });

  return {
    statusCode: 200,
    body: JSON.stringify(notification),
  };
});
