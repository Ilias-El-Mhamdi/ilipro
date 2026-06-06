import type { UserModel } from './user.model';

export abstract class IUserRepository {
  abstract findAll(): Promise<UserModel[]>;
  abstract findById(id: string): Promise<UserModel>;
  abstract findBySlug(slug: string): Promise<unknown>;
  abstract findByEmail(email: string): Promise<UserModel | null>;
  abstract create(user: UserModel): Promise<UserModel>;
  abstract update(id: string, data: Pick<UserModel, 'firstName' | 'lastName'>): Promise<UserModel>;
  abstract setStripeCustomerId(id: string, stripeCustomerId: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
