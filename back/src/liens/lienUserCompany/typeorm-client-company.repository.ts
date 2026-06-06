import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IClientCompanyRepository } from './client-company.repository';
import { ClientCompanyEntity } from './client-company.entity';
import { UserModel } from '../../users/domain/user.model';

@Injectable()
export class TypeOrmClientCompanyRepository implements IClientCompanyRepository {
  constructor(
    @InjectRepository(ClientCompanyEntity)
    private readonly repo: Repository<ClientCompanyEntity>,
    @InjectRepository(UserModel)
    private readonly userRepo: Repository<UserModel>,
  ) {}

  async findUsersByCompanyId(companyId: string): Promise<UserModel[]> {
    const links = await this.repo.find({ where: { companyId } });
    if (!links.length) return [];
    const ids = links.map((l) => l.clientId);
    return this.userRepo.createQueryBuilder('u').where('u.id IN (:...ids)', { ids }).orderBy('u.createdAt', 'DESC').getMany();
  }

  async link(userId: string, companyId: string): Promise<void> {
    await this.repo.save(this.repo.create({ clientId: userId, companyId }));
  }

  async unlink(userId: string, companyId: string): Promise<void> {
    await this.repo.delete({ clientId: userId, companyId });
  }

  async isLinked(userId: string, companyId: string): Promise<boolean> {
    const row = await this.repo.findOne({ where: { clientId: userId, companyId } });
    return row !== null;
  }
}
