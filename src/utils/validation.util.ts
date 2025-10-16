import { ValidationError } from './errors.util';
import { logger } from './logger.util';

export const validateCreateNotificationInput = (
  payload: Components.Schemas.CreateNotification,
): void => {
  const errors: string[] = [];

  logger.debug('Validating create notification input', { payload });

  if (!payload) {
    errors.push('Payload is missing');
  } else {
    if (!payload.senderId) {
      errors.push('senderId is required');
    } else if (typeof payload.senderId !== 'string') {
      errors.push('senderId must be a string');
    }

    if (!payload.recipientId) {
      errors.push('recipientId is required');
    } else if (typeof payload.recipientId !== 'string') {
      errors.push('recipientId must be a string');
    }

    if (!payload.recipientEmail) {
      errors.push('recipientEmail is required');
    } else if (typeof payload.recipientEmail !== 'string') {
      errors.push('recipientEmail must be a string');
    }

    if (!payload.message) {
      errors.push('message is required');
    } else if (typeof payload.message !== 'string') {
      errors.push('message must be a string');
    }
  }

  if (errors.length) {
    logger.debug('Validation failed', { errors });
    throw new ValidationError('Invalid notification payload', errors.join(', '));
  }

  logger.debug('Validation passed');
};

export const isOffline = process.env.IS_OFFLINE === 'true' || process.env.STAGE === 'offline';
