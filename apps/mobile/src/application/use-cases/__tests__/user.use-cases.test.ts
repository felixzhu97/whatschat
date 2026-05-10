import { UserUseCases } from '../user.use-cases';

describe('UserUseCases', () => {
  const mockUserRepository = {
    getCurrentUser: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
  };

  const userUseCases = new UserUseCases(mockUserRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('returns user from repository', async () => {
      const mockUser = { id: 'user-1', username: 'testuser', email: 'test@example.com' };
      mockUserRepository.getCurrentUser.mockResolvedValue(mockUser);

      const result = await userUseCases.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('propagates errors from repository', async () => {
      mockUserRepository.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));

      await expect(userUseCases.getCurrentUser()).rejects.toThrow('Not authenticated');
    });

    it('returns null when no user is logged in', async () => {
      mockUserRepository.getCurrentUser.mockResolvedValue(null);

      const result = await userUseCases.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('returns user by id from repository', async () => {
      const mockUser = { id: 'user-2', username: 'otheruser', email: 'other@example.com' };
      mockUserRepository.getUserById.mockResolvedValue(mockUser);

      const result = await userUseCases.getUserById('user-2');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('user-2');
    });

    it('propagates errors from repository', async () => {
      mockUserRepository.getUserById.mockRejectedValue(new Error('User not found'));

      await expect(userUseCases.getUserById('nonexistent')).rejects.toThrow('User not found');
    });

    it('returns null when user does not exist', async () => {
      mockUserRepository.getUserById.mockResolvedValue(null);

      const result = await userUseCases.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('updates user with partial updates', async () => {
      const mockUpdatedUser = { id: 'user-1', username: 'testuser', email: 'test@example.com', name: 'New Name' };
      mockUserRepository.updateUser.mockResolvedValue(mockUpdatedUser);

      const result = await userUseCases.updateUser('user-1', { name: 'New Name' });

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith('user-1', { name: 'New Name' });
    });

    it('propagates errors from repository', async () => {
      mockUserRepository.updateUser.mockRejectedValue(new Error('Update failed'));

      await expect(
        userUseCases.updateUser('user-1', { name: 'New Name' })
      ).rejects.toThrow('Update failed');
    });

    it('passes multiple update fields', async () => {
      const mockUpdatedUser = { id: 'user-1', username: 'newusername', name: 'New Name', avatar: 'new-avatar.jpg' };
      mockUserRepository.updateUser.mockResolvedValue(mockUpdatedUser);

      const result = await userUseCases.updateUser('user-1', {
        username: 'newusername',
        name: 'New Name',
        avatar: 'new-avatar.jpg',
      });

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith('user-1', {
        username: 'newusername',
        name: 'New Name',
        avatar: 'new-avatar.jpg',
      });
    });
  });
});
