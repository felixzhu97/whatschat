import { ChatUseCases } from '../chat.use-cases';

describe('ChatUseCases', () => {
  const mockChatRepository = {
    getChats: jest.fn(),
    getChatById: jest.fn(),
    createChat: jest.fn(),
    updateChat: jest.fn(),
    deleteChat: jest.fn(),
  };

  const chatUseCases = new ChatUseCases(mockChatRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChats', () => {
    it('returns chats from repository', async () => {
      const mockChats = [
        { id: '1', name: 'Chat 1' },
        { id: '2', name: 'Chat 2' },
      ];
      mockChatRepository.getChats.mockResolvedValue(mockChats);

      const result = await chatUseCases.getChats();

      expect(result).toEqual(mockChats);
      expect(mockChatRepository.getChats).toHaveBeenCalledTimes(1);
    });

    it('propagates errors from repository', async () => {
      mockChatRepository.getChats.mockRejectedValue(new Error('Failed to fetch'));

      await expect(chatUseCases.getChats()).rejects.toThrow('Failed to fetch');
    });
  });

  describe('getChatById', () => {
    it('returns chat by id from repository', async () => {
      const mockChat = { id: 'chat-1', name: 'Test Chat' };
      mockChatRepository.getChatById.mockResolvedValue(mockChat);

      const result = await chatUseCases.getChatById('chat-1');

      expect(result).toEqual(mockChat);
      expect(mockChatRepository.getChatById).toHaveBeenCalledWith('chat-1');
    });

    it('propagates errors from repository', async () => {
      mockChatRepository.getChatById.mockRejectedValue(new Error('Chat not found'));

      await expect(chatUseCases.getChatById('nonexistent')).rejects.toThrow('Chat not found');
    });
  });
});
