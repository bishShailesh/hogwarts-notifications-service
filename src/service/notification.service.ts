import type { INotificationRepository } from '../data/repository/notification.repository.interface';
import type { INotificationQueue } from '../data/queue/notification.queue.interface';
import { NotificationFactory } from '../factory/notification.factory';
import { logger } from '../utils/logger.util';

export class NotificationService {
  private repo: INotificationRepository;
  private queue: INotificationQueue;

  constructor(repo: INotificationRepository, queue: INotificationQueue) {
    this.repo = repo;
    this.queue = queue;
  }

  async create(
    payload: Components.Schemas.CreateNotification,
  ): Promise<Components.Schemas.Notification> {
    logger.info('Creating notification', {
      recipientId: payload.recipientId,
      senderId: payload.senderId,
    });
    const notification = NotificationFactory.create(payload);
    await this.repo.save(notification);
    await this.queue.enqueue(notification.id);
    logger.info('Notification created and enqueued', { notificationId: notification.id });
    return notification;
  }

  async get(id: string): Promise<Components.Schemas.Notification> {
    logger.info('Fetching notification', { notificationId: id });
    const notification = await this.repo.getById(id);
    logger.info('Notification fetched', { notificationId: id });
    return notification;
  }

  async list(filter?: {
    recipientId?: string;
    recipient?: string;
  }): Promise<Components.Schemas.Notification[]> {
    logger.info('Listing notifications', { filter });
    const notifications = await this.repo.getAll(filter);
    logger.info('Notifications listed', { count: notifications.length });
    return notifications;
  }

  async deliver(id: string): Promise<Components.Schemas.Notification> {
    logger.info('Delivering notification', { notificationId: id });
    const notification = await this.repo.getById(id);
    const delivered: Components.Schemas.Notification = {
      ...notification,
      status: 'delivered',
      updatedAt: new Date().toISOString(),
    };
    await this.repo.save(delivered);
    logger.info('Notification delivered', { notificationId: id });
    return delivered;
  }
}
