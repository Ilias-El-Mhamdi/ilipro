import type { Client } from './client.entity';

export abstract class ClientRepository {
  abstract findAll(): Promise<Client[]>;
  abstract findByCompanyId(companyId: string): Promise<Client[]>;
  abstract findById(id: string): Promise<Client | null>;
  abstract findByEmail(email: string): Promise<Client | null>;
  abstract create(name: string, email: string, companyId: string): Promise<Client>;
  abstract update(id: string, name: string, email: string): Promise<Client>;
  abstract setStripeCustomerId(id: string, stripeCustomerId: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
