import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

  async create(firstName: string, lastName: string, email: string, companyId: string) {
    const existing = await this.repo.findByEmail(email);
    if (existing) throw new ConflictException(`Email "${email}" already in use`);
    return this.repo.create(firstName, lastName, email, companyId);
  }

  async update(id: string, firstName: string, lastName: string) {
    await this.findById(id);
    return this.repo.update(id, firstName, lastName);
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
