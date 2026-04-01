import { User } from "../../domain/entities/user.entity";

export function mapUnknownToUser(data: unknown): User {
  return User.create(data as Parameters<typeof User.create>[0]);
}
