import type { UserModel } from './user.entity';

export abstract class IUserReaderRepo {
  abstract findById(id: string): Promise<UserModel>;
  abstract findBySlug(slug: string): Promise<UserModel>;
  abstract findByEmail(email: string): Promise<UserModel | null>;
}
