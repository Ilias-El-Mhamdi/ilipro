import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../domain/client.repository';

@Injectable()
export class ClientsService {
  constructor(private readonly repo: ClientRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  findByCompanyId(companyId: string) {
    return this.repo.findByCompanyId(companyId);
  }

  findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  async findById(id: string) {
    const client = await this.repo.findById(id);
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  create(name: string, email: string, companyId: string) {
    return this.repo.create(name, email, companyId);
  }

  async update(id: string, name: string, email: string) {
    await this.findById(id);
    return this.repo.update(id, name, email);
  }

  async setStripeCustomerId(id: string, stripeCustomerId: string) {
    await this.findById(id);
    return this.repo.setStripeCustomerId(id, stripeCustomerId);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repo.delete(id);
  }
}
