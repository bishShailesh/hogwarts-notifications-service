'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const validation_util_1 = require('../../src/utils/validation.util');
const errors_util_1 = require('../../src/utils/errors.util');
describe('validateCreateNotificationInput', () => {
  it('should pass validation for valid payload', () => {
    const payload = {
      senderId: 'prof-snape',
      recipientId: 'user-1234',
      recipient: 'Hermione Granger',
      message: 'Welcome to Hogwarts!',
    };
    expect(() => (0, validation_util_1.validateCreateNotificationInput)(payload)).not.toThrow();
  });
  it('should throw ValidationError if payload is missing', () => {
    expect(() => (0, validation_util_1.validateCreateNotificationInput)(undefined)).toThrow(
      errors_util_1.ValidationError,
    );
  });
  it('should throw ValidationError if senderId is missing', () => {
    const payload = {
      recipientId: 'user-1234',
      recipient: 'Hermione Granger',
      message: 'Welcome!',
    };
    expect(() => (0, validation_util_1.validateCreateNotificationInput)(payload)).toThrow(
      errors_util_1.ValidationError,
    );
  });
  it('should throw ValidationError if recipientId is missing', () => {
    const payload = {
      senderId: 'prof-snape',
      recipient: 'Hermione Granger',
      message: 'Welcome!',
    };
    expect(() => (0, validation_util_1.validateCreateNotificationInput)(payload)).toThrow(
      errors_util_1.ValidationError,
    );
  });
  it('should throw ValidationError if recipient is missing', () => {
    const payload = {
      senderId: 'prof-snape',
      recipientId: 'user-1234',
      message: 'Welcome!',
    };
    expect(() => (0, validation_util_1.validateCreateNotificationInput)(payload)).toThrow(
      errors_util_1.ValidationError,
    );
  });
  it('should throw ValidationError if message is missing', () => {
    const payload = {
      senderId: 'prof-snape',
      recipientId: 'user-1234',
      recipient: 'Hermione Granger',
    };
    expect(() => (0, validation_util_1.validateCreateNotificationInput)(payload)).toThrow(
      errors_util_1.ValidationError,
    );
  });
  it('should throw ValidationError if any field is not a string', () => {
    const payload = {
      senderId: 123,
      recipientId: 'user-1234',
      recipient: 'Hermione Granger',
      message: 'Welcome!',
    };
    expect(() => (0, validation_util_1.validateCreateNotificationInput)(payload)).toThrow(
      errors_util_1.ValidationError,
    );
  });
});
