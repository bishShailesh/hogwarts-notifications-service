import { NotificationService } from '../service/notification.service';
import { DynamoNotificationRepository } from '../data/repository/dynamo.notification.repository';
import { SqsNotificationQueue } from '../data/queue/sqs.notification.queue';
import { validateCreateNotificationInput } from '../utils/validation.util';
import { logger } from '../utils/logger.util';
import { BadRequestError } from '../utils/errors.util';
import { wrapLambdaHandler } from '../utils/lambda-wrapper.util';

const repo = new DynamoNotificationRepository();
const queue = new SqsNotificationQueue();
const service = new NotificationService(repo, queue);

export const handler = wrapLambdaHandler(async (event) => {
  if (!event.body) {
    throw new BadRequestError('Missing request body');
  }

  const payload = JSON.parse(event.body);

  validateCreateNotificationInput(payload);

  const notification = await service.create(payload);

  logger.info('Notification created', { notificationId: notification.id });

  return {
    statusCode: 201,
    body: JSON.stringify(notification),
  };
});
