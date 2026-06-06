import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserRepository } from '../domain/user.abtract-repository';
import { UserModel } from '../domain/user.model';

function toSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserModel)
    private readonly repo: Repository<UserModel>,
  ) {}

  findAll(): Promise<UserModel[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<UserModel> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findBySlug(slug: string): Promise<unknown> {
    const user = await this.repo.findOne({ where: { slug } });
    if (!user) throw new NotFoundException(`User "${slug}" not found`);
    return user;
  }

  findByEmail(email: string): Promise<UserModel | null> {
    return this.repo.findOne({ where: { email } });
  }

  async create(user: UserModel): Promise<UserModel> {
    const existing = await this.repo.findOne({ where: { email: user.email } });
    if (existing) throw new ConflictException(`Email "${user.email}" already in use`);
    const base = toSlug(user.firstName || user.email.split('@')[0], user.lastName || '');
    let slug = base;
    let i = 2;
    while (await this.repo.findOne({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    return this.repo.save(this.repo.create({ ...user, slug }));
  }

  async update(id: string, data: Pick<UserModel, 'firstName' | 'lastName'>): Promise<UserModel> {
    await this.findById(id);
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async setStripeCustomerId(id: string, stripeCustomerId: string): Promise<void> {
    await this.repo.update(id, { stripeCustomerId });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.delete(id);
  }
}
