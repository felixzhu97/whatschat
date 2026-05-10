import { UserRepositoryAdapter } from '../user-repository.adapter';

describe('UserRepositoryAdapter', () => {
  let adapter: UserRepositoryAdapter;

  beforeEach(() => {
    adapter = new UserRepositoryAdapter();
  });

  describe('getCurrentUser', () => {
    it('should return null (not implemented)', async () => {
      const result = await adapter.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return null for any userId (not implemented)', async () => {
      const result = await adapter.getUserById('user-123');

      expect(result).toBeNull();
    });

    it('should return null regardless of userId value', async () => {
      const result1 = await adapter.getUserById('any-user-id');
      const result2 = await adapter.getUserById('another-user');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should throw error (not implemented)', async () => {
      await expect(
        adapter.updateUser('user-1', { name: 'New Name' })
      ).rejects.toThrow('Not implemented');
    });

    it('should throw error with any update parameters', async () => {
      await expect(
        adapter.updateUser('user-1', {
          username: 'newusername',
          name: 'New Name',
          avatar: 'new-avatar.jpg',
        })
      ).rejects.toThrow('Not implemented');
    });
  });
});
