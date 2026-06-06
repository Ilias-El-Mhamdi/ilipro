import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserCompanyRepository } from '../domain/user-company.abstract-repository';
import { UserCompanyEntity } from '../domain/user-company.entity';
import { UserModel } from '../../../users/domain/user.model';

@Injectable()
export class UserCompanyRepository implements IUserCompanyRepository {
  constructor(
    @InjectRepository(UserCompanyEntity)
    private readonly repo: Repository<UserCompanyEntity>,
    @InjectRepository(UserModel)
    private readonly userRepo: Repository<UserModel>,
  ) {}

  async findUsersByCompanyId(companyId: string): Promise<UserModel[]> {
    const links = await this.repo.find({ where: { companyId } });
    if (!links.length) return [];
    const ids = links.map((l) => l.userId);
    return this.userRepo.createQueryBuilder('u').where('u.id IN (:...ids)', { ids }).orderBy('u.createdAt', 'DESC').getMany();
  }

  async link(userId: string, companyId: string): Promise<void> {
    await this.repo.save(this.repo.create({ userId, companyId }));
  }

  async unlink(userId: string, companyId: string): Promise<void> {
    await this.repo.delete({ userId, companyId });
  }

  async isLinked(userId: string, companyId: string): Promise<boolean> {
    const row = await this.repo.findOne({ where: { userId, companyId } });
    return row !== null;
  }
}
