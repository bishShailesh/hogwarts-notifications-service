import { v4 as uuidv4 } from 'uuid';

export class NotificationFactory {
  static create(payload: Components.Schemas.CreateNotification): Components.Schemas.Notification {
    const now = new Date().toISOString();
    return {
      ...payload,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      status: 'queued',
    };
  }

  static update(notification: Components.Schemas.Notification): Components.Schemas.Notification {
    return {
      ...notification,
      updatedAt: new Date().toISOString(),
    };
  }
}
