import type { AuthRegisterPayload, IAuthRepository } from '@/src/domain/ports/auth.repository.port';

export class AuthUseCases {
  constructor(private readonly authRepository: IAuthRepository) {}

  login(email: string, password: string) {
    return this.authRepository.login(email, password);
  }

  register(payload: AuthRegisterPayload) {
    return this.authRepository.register(payload);
  }

  isAuthError(error: unknown) {
    return this.authRepository.isAuthError(error);
  }
}
