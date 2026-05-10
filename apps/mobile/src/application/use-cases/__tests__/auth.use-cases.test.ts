import { AuthUseCases } from '../auth.use-cases';

describe('AuthUseCases', () => {
  const mockAuthRepository = {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    isAuthError: jest.fn(),
  };

  const authUseCases = new AuthUseCases(mockAuthRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('calls repository login with credentials', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockAuthRepository.login.mockResolvedValue(mockUser);

      const result = await authUseCases.login('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(mockAuthRepository.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('propagates errors from repository', async () => {
      mockAuthRepository.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authUseCases.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('calls repository register with payload', async () => {
      const mockUser = { id: 'user-2', email: 'new@example.com' };
      const payload = { email: 'new@example.com', password: 'password123', username: 'newuser' };
      mockAuthRepository.register.mockResolvedValue(mockUser);

      const result = await authUseCases.register(payload);

      expect(result).toEqual(mockUser);
      expect(mockAuthRepository.register).toHaveBeenCalledWith(payload);
    });

    it('propagates errors from repository', async () => {
      mockAuthRepository.register.mockRejectedValue(new Error('Email already exists'));

      await expect(
        authUseCases.register({ email: 'existing@example.com', password: 'pass', username: 'user' })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('isAuthError', () => {
    it('delegates to repository', () => {
      mockAuthRepository.isAuthError.mockReturnValue(true);

      const result = authUseCases.isAuthError(new Error('Auth failed'));

      expect(result).toBe(true);
      expect(mockAuthRepository.isAuthError).toHaveBeenCalled();
    });

    it('returns false for non-auth errors', () => {
      mockAuthRepository.isAuthError.mockReturnValue(false);

      const result = authUseCases.isAuthError(new Error('Network error'));

      expect(result).toBe(false);
    });
  });
});
