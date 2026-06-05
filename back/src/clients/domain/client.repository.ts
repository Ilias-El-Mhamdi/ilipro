import type { Client } from './client.entity';

export abstract class ClientRepository {
  abstract findAll(): Promise<Client[]>;
  abstract findByCompanyId(companyId: string): Promise<Client[]>;
  abstract findById(id: string): Promise<Client | null>;
  abstract findBySlug(slug: string): Promise<unknown | null>;
  abstract findByEmail(email: string): Promise<Client | null>;
  abstract create(firstName: string, lastName: string, email: string): Promise<Client>;
  abstract update(id: string, firstName: string, lastName: string): Promise<Client>;
  abstract setStripeCustomerId(id: string, stripeCustomerId: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract linkToCompany(clientId: string, companyId: string): Promise<void>;
  abstract unlinkFromCompany(clientId: string, companyId: string): Promise<void>;
  abstract isLinkedToCompany(clientId: string, companyId: string): Promise<boolean>;
}
