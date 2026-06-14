import type { UserEntity } from './user.entity';

export abstract class IUserReaderRepo {
  abstract findById(id: string): Promise<UserEntity>;
  abstract findBySlug(slug: string): Promise<UserEntity>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
}
