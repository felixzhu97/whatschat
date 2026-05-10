import { MessageUseCases } from '../message.use-cases';

describe('MessageUseCases', () => {
  const mockMessageRepository = {
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    getMessageById: jest.fn(),
    deleteMessage: jest.fn(),
  };

  const messageUseCases = new MessageUseCases(mockMessageRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMessages', () => {
    it('returns messages from repository', async () => {
      const mockMessages = [
        { id: '1', content: 'Hello' },
        { id: '2', content: 'World' },
      ];
      mockMessageRepository.getMessages.mockResolvedValue(mockMessages);

      const result = await messageUseCases.getMessages('chat-1');

      expect(result).toEqual(mockMessages);
      expect(mockMessageRepository.getMessages).toHaveBeenCalledWith('chat-1');
    });

    it('propagates errors from repository', async () => {
      mockMessageRepository.getMessages.mockRejectedValue(new Error('Failed to fetch'));

      await expect(messageUseCases.getMessages('chat-1')).rejects.toThrow('Failed to fetch');
    });
  });

  describe('sendMessage', () => {
    it('sends message with text type by default', async () => {
      const mockSentMessage = { id: '3', content: 'New message' };
      mockMessageRepository.sendMessage.mockResolvedValue(mockSentMessage);

      const result = await messageUseCases.sendMessage('chat-1', 'New message');

      expect(result).toEqual(mockSentMessage);
      expect(mockMessageRepository.sendMessage).toHaveBeenCalledWith('chat-1', 'New message', undefined);
    });

    it('sends message with specified type', async () => {
      const mockSentMessage = { id: '4', content: 'Image URL' };
      mockMessageRepository.sendMessage.mockResolvedValue(mockSentMessage);

      const result = await messageUseCases.sendMessage('chat-1', 'Image URL', 'IMAGE');

      expect(result).toEqual(mockSentMessage);
      expect(mockMessageRepository.sendMessage).toHaveBeenCalledWith('chat-1', 'Image URL', 'IMAGE');
    });

    it('propagates errors from repository', async () => {
      mockMessageRepository.sendMessage.mockRejectedValue(new Error('Failed to send'));

      await expect(
        messageUseCases.sendMessage('chat-1', 'Test')
      ).rejects.toThrow('Failed to send');
    });
  });
});
