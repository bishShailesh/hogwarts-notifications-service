export interface INotificationQueue {
  enqueue(notificationId: string): Promise<void>;
}
