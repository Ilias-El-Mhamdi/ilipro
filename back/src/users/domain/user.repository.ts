import type { UserModel } from './user.model';

export abstract class UserRepository {
  abstract findAll(): Promise<UserModel[]>;
  abstract findByCompanyId(companyId: string): Promise<UserModel[]>;
  abstract findById(id: string): Promise<UserModel | null>;
  abstract findBySlug(slug: string): Promise<unknown | null>;
  abstract findByEmail(email: string): Promise<UserModel | null>;
  abstract create(data: Pick<UserModel, 'firstName' | 'lastName' | 'email'>): Promise<UserModel>;
  abstract update(id: string, data: Pick<UserModel, 'firstName' | 'lastName'>): Promise<UserModel>;
  abstract setStripeCustomerId(id: string, stripeCustomerId: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract linkToCompany(userId: string, companyId: string): Promise<void>;
  abstract unlinkFromCompany(userId: string, companyId: string): Promise<void>;
  abstract isLinkedToCompany(userId: string, companyId: string): Promise<boolean>;
}
