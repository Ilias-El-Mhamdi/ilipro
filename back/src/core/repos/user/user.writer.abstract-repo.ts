import type { UserEntity } from './user.entity';

export abstract class IUserWriterRepo {
  abstract findAll(): Promise<UserEntity[]>;
  abstract findById(id: string): Promise<UserEntity>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract update(id: string, data: Pick<UserEntity, 'firstName' | 'lastName'>): Promise<UserEntity>;
  abstract setStripeCustomerId(id: string, stripeCustomerId: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
