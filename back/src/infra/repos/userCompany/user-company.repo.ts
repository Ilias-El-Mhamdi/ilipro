import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserCompanyReaderRepo } from '../../../core/repos/userCompany/user-company.reader.abstract-repo';
import { IUserCompanyWriterRepo } from '../../../core/repos/userCompany/user-company.writer.abstract-repo';
import { UserCompanyEntity } from '../../../core/repos/userCompany/user-company.entity';
import { UserEntity } from '../../../core/repos/user/user.entity';

@Injectable()
export class UserCompanyRepo implements IUserCompanyReaderRepo, IUserCompanyWriterRepo {
  constructor(
    @InjectRepository(UserCompanyEntity)
    private readonly repo: Repository<UserCompanyEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findUsersByCompanyId(companyId: string): Promise<UserEntity[]> {
    const links = await this.repo.find({ where: { companyId } });
    if (!links.length) return [];
    const ids = links.map((l) => l.userId);
    return this.userRepo.createQueryBuilder('u').where('u.id IN (:...ids)', { ids }).orderBy('u.createdAt', 'DESC').getMany();
  }

  async findCompanyIdsByUserId(userId: string): Promise<string[]> {
    const links = await this.repo.find({ where: { userId } });
    return links.map((l) => l.companyId);
  }

  async isLinked(userId: string, companyId: string): Promise<boolean> {
    const row = await this.repo.findOne({ where: { userId, companyId } });
    return row !== null;
  }

  async link(userId: string, companyId: string): Promise<void> {
    await this.repo.save(this.repo.create({ userId, companyId }));
  }

  async unlink(userId: string, companyId: string): Promise<void> {
    await this.repo.delete({ userId, companyId });
  }
}
