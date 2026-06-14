import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserReaderRepo } from '../../../core/repos/user/user.reader.abstract-repo';
import { IUserWriterRepo } from '../../../core/repos/user/user.writer.abstract-repo';
import { UserEntity } from '../../../core/repos/user/user.entity';
import { toSlug, uniqueSlug } from '../../../core/utils/slug';

function userSlug(firstName: string, lastName: string, email: string): string {
  const base = firstName ? `${firstName}-${lastName || ''}` : email.split('@')[0];
  return toSlug(base);
}

@Injectable()
export class UserRepo implements IUserReaderRepo, IUserWriterRepo {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findBySlug(slug: string): Promise<UserEntity> {
    const user = await this.repo.findOne({ where: { slug } });
    if (!user) throw new NotFoundException(`User "${slug}" not found`);
    return user;
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { email: email.trim().toLowerCase() } });
  }

  findAll(): Promise<UserEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(user: UserEntity): Promise<UserEntity> {
    user.email = user.email.trim().toLowerCase();
    const existing = await this.repo.findOne({ where: { email: user.email } });
    if (existing) throw new ConflictException(`Email "${user.email}" already in use`);
    const base = userSlug(user.firstName || '', user.lastName || '', user.email);
    const slug = await uniqueSlug(base, (s) => this.repo.findOne({ where: { slug: s } }).then(Boolean));
    return this.repo.save(this.repo.create({ ...user, slug }));
  }

  async update(id: string, data: Pick<UserEntity, 'firstName' | 'lastName'>): Promise<UserEntity> {
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
