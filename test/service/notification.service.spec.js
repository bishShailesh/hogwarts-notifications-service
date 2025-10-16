'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const notification_service_1 = require('../../src/service/notification.service');
// Mock uuid to always return the same value for deterministic tests
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));
const mockRepo = {
  save: jest.fn(),
  getById: jest.fn(),
  getAll: jest.fn(),
};
const mockQueue = {
  enqueue: jest.fn(),
};
describe('NotificationService', () => {
  let service;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new notification_service_1.NotificationService(mockRepo, mockQueue);
  });
  it('should create and enqueue a notification', async () => {
    const payload = {
      recipientId: 'user-1234',
      recipient: 'Hermione Granger',
      message: 'Welcome!',
      senderId: 'prof-snape',
    };
    mockRepo.save.mockResolvedValue(undefined);
    mockQueue.enqueue.mockResolvedValue(undefined);
    const result = await service.create(payload);
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: payload.recipientId,
        recipient: payload.recipient,
        message: payload.message,
        senderId: payload.senderId,
        id: 'test-uuid',
        status: 'queued',
      }),
    );
    expect(mockQueue.enqueue).toHaveBeenCalledWith('test-uuid');
    expect(result).toMatchObject({
      recipientId: payload.recipientId,
      recipient: payload.recipient,
      message: payload.message,
      senderId: payload.senderId,
      status: 'queued',
      id: 'test-uuid',
    });
  });
  it('should get a notification by id', async () => {
    const notification = { id: 'abc', recipientId: 'user-1234' };
    mockRepo.getById.mockResolvedValue(notification);
    const result = await service.get('abc');
    expect(mockRepo.getById).toHaveBeenCalledWith('abc');
    expect(result).toBe(notification);
  });
  it('should list notifications', async () => {
    const notifications = [{ id: '1' }, { id: '2' }];
    mockRepo.getAll.mockResolvedValue(notifications);
    const result = await service.list({ recipientId: 'user-1234' });
    expect(mockRepo.getAll).toHaveBeenCalledWith({ recipientId: 'user-1234' });
    expect(result).toBe(notifications);
  });
  it('should deliver a notification', async () => {
    const notification = {
      id: 'abc',
      recipientId: 'user-1234',
      status: 'queued',
      updatedAt: '2020-01-01T00:00:00.000Z', // valid ISO date
    };
    mockRepo.getById.mockResolvedValue(notification);
    mockRepo.save.mockResolvedValue(undefined);
    const result = await service.deliver('abc');
    expect(mockRepo.getById).toHaveBeenCalledWith('abc');
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'abc',
        status: 'delivered',
      }),
    );
    expect(result.status).toBe('delivered');
    expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(
      new Date(notification.updatedAt).getTime(),
    );
  });
});
