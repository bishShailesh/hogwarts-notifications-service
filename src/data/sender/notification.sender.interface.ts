export interface INotificationSender {
  send(recipientEmail: string, message: string): Promise<void>;
}
