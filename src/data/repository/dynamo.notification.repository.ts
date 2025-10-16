import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import type { INotificationRepository } from './notification.repository.interface';
import { dynamoDbClient } from '../../utils/dynamodb-client.util';
import { NotFoundError } from '../../utils/errors.util';
import { logger } from '../../utils/logger.util';

const TABLE_NAME = process.env.DYNAMODB_TABLE!;
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);

export class DynamoNotificationRepository implements INotificationRepository {
  async save(notification: Components.Schemas.Notification): Promise<void> {
    logger.debug('Saving notification to DynamoDB', { notificationId: notification.id });
    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: notification,
      }),
    );
    logger.info('Notification saved to DynamoDB', { notificationId: notification.id });
  }

  async getById(id: string): Promise<Components.Schemas.Notification> {
    logger.debug('Fetching notification by ID from DynamoDB', { notificationId: id });
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      }),
    );
    if (!result.Item) {
      logger.warn('Notification not found in DynamoDB', { notificationId: id });
      throw new NotFoundError('Notification', `Notification with id ${id} not found`);
    }
    logger.info('Notification fetched from DynamoDB', { notificationId: id });
    return result.Item as Components.Schemas.Notification;
  }

  async getAll(filter?: {
    recipientId?: string;
    recipient?: string;
    senderId?: string;
    limit?: number;
  }): Promise<Components.Schemas.Notification[]> {
    logger.debug('Fetching notifications from DynamoDB', { filter });
    const params: any = { TableName: TABLE_NAME };

    const filterExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};

    if (filter?.recipientId) {
      filterExpressions.push('recipientId = :recipientId');
      expressionAttributeValues[':recipientId'] = filter.recipientId;
    }
    if (filter?.recipient) {
      filterExpressions.push('recipient = :recipient');
      expressionAttributeValues[':recipient'] = filter.recipient;
    }
    if (filter?.senderId) {
      filterExpressions.push('senderId = :senderId');
      expressionAttributeValues[':senderId'] = filter.senderId;
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const result = await dynamoDb.send(new ScanCommand(params));
    let items = (result.Items as Components.Schemas.Notification[]) || [];

    // Apply limit if provided
    if (filter?.limit && !isNaN(filter.limit) && filter.limit > 0) {
      items = items.slice(0, filter.limit);
    }

    logger.info('Notifications fetched from DynamoDB', { count: items.length });
    return items;
  }
}
