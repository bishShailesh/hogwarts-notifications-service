import { validateCreateNotificationInput } from '../../src/utils/validation.util';
import { ValidationError } from '../../src/utils/errors.util';

describe('validateCreateNotificationInput', () => {
  it('should pass validation for valid payload', () => {
    const payload = {
      senderId: 'prof-snape',
      recipientId: 'user-1234',
      recipient: 'Hermione Granger',
      message: 'Welcome to Hogwarts!',
    };
    expect(() => validateCreateNotificationInput(payload)).not.toThrow();
  });

  it('should throw ValidationError if payload is missing', () => {
    expect(() => validateCreateNotificationInput(undefined as any)).toThrow(ValidationError);
  });

  it('should throw ValidationError if senderId is missing', () => {
    const payload = {
      recipientId: 'user-1234',
      recipient: 'Hermione Granger',
      message: 'Welcome!',
    };
    expect(() => validateCreateNotificationInput(payload as any)).toThrow(ValidationError);
  });

  it('should throw ValidationError if recipientId is missing', () => {
    const payload = {
      senderId: 'prof-snape',
      recipient: 'Hermione Granger',
      message: 'Welcome!',
    };
    expect(() => validateCreateNotificationInput(payload as any)).toThrow(ValidationError);
  });

  it('should throw ValidationError if recipient is missing', () => {
    const payload = {
      senderId: 'prof-snape',
      recipientId: 'user-1234',
      message: 'Welcome!',
    };
    expect(() => validateCreateNotificationInput(payload as any)).toThrow(ValidationError);
  });

  it('should throw ValidationError if message is missing', () => {
    const payload = {
      senderId: 'prof-snape',
      recipientId: 'user-1234',
      recipient: 'Hermione Granger',
    };
    expect(() => validateCreateNotificationInput(payload as any)).toThrow(ValidationError);
  });

  it('should throw ValidationError if any field is not a string', () => {
    const payload = {
      senderId: 123,
      recipientId: 'user-1234',
      recipient: 'Hermione Granger',
      message: 'Welcome!',
    };
    expect(() => validateCreateNotificationInput(payload as any)).toThrow(ValidationError);
  });
});
