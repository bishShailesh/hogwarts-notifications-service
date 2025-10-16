import { wrapLambdaHandler } from '../utils/lambda-wrapper.util';
import { NotificationService } from '../service/notification.service';
import { DynamoNotificationRepository } from '../data/repository/dynamo.notification.repository';
import { SqsNotificationQueue } from '../data/queue/sqs.notification.queue';
import { logger } from '../utils/logger.util';

const repo = new DynamoNotificationRepository();
const queue = new SqsNotificationQueue();
const service = new NotificationService(repo, queue);

export const handler = wrapLambdaHandler(async (event) => {
  const { recipientId, recipient, senderId, limit } = event.queryStringParameters || {};

  // Build filter object from available query parameters
  const filter: { recipientId?: string; recipient?: string; senderId?: string } = {};
  if (recipientId) filter.recipientId = recipientId;
  if (recipient) filter.recipient = recipient;
  if (senderId) filter.senderId = senderId;

  logger.info('Listing notifications', { filter, limit });

  // Fetch notifications (filtered or all)
  const notifications = await service.list(filter);

  // Apply limit only if provided and valid
  let limitedNotifications = notifications;
  if (limit && !isNaN(Number(limit)) && Number(limit) > 0) {
    limitedNotifications = notifications.slice(0, Number(limit));
  }

  logger.info('Notifications listed', { count: limitedNotifications.length });

  // Return metadata and notifications
  return {
    statusCode: 200,
    body: JSON.stringify({
      metadata: {
        total: notifications.length,
        returned: limitedNotifications.length,
        filter,
        limit: limit ? Number(limit) : undefined,
      },
      notifications: limitedNotifications,
    }),
  };
});
