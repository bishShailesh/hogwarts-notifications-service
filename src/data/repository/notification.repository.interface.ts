export interface INotificationRepository {
  save(notification: Components.Schemas.CreateNotification): Promise<void>;
  getById(id: string): Promise<Components.Schemas.Notification>;
  getAll(
    filter?: Partial<Components.Schemas.Notification>,
  ): Promise<Components.Schemas.Notification[]>;
}
