import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UserRepository) {}

  async findById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findBySlug(slug: string) {
    const user = await this.repo.findBySlug(slug);
    if (!user) throw new NotFoundException(`User "${slug}" not found`);
    return user;
  }

  findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  async setStripeCustomerId(id: string, stripeCustomerId: string) {
    return this.repo.setStripeCustomerId(id, stripeCustomerId);
  }

  async create(firstName: string, lastName: string, email: string) {
    const existing = await this.repo.findByEmail(email);
    if (existing) throw new ConflictException(`Email "${email}" already in use`);
    return this.repo.create({ firstName, lastName, email });
  }

  async createOrLink(
    firstName: string,
    lastName: string,
    email: string,
    companyId: string,
  ) {
    let user = await this.repo.findByEmail(email);
    if (!user) {
      user = await this.repo.create({ firstName, lastName, email });
    }
    const alreadyLinked = await this.repo.isLinkedToCompany(user.id, companyId);
    if (!alreadyLinked) {
      await this.repo.linkToCompany(user.id, companyId);
    }
    return user;
  }

  async update(id: string, firstName: string, lastName: string) {
    await this.findById(id);
    return this.repo.update(id, { firstName, lastName });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repo.delete(id);
  }

  async linkToCompany(userId: string, companyId: string) {
    const alreadyLinked = await this.repo.isLinkedToCompany(userId, companyId);
    if (!alreadyLinked) {
      await this.repo.linkToCompany(userId, companyId);
    }
  }

  async unlinkFromCompany(userId: string, companyId: string) {
    return this.repo.unlinkFromCompany(userId, companyId);
  }
}
