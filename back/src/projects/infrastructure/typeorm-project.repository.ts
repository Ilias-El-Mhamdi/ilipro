import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IProjectRepository } from '../domain/project.repository';
import { ProjectModel } from '../domain/project.model';

@Injectable()
export class TypeOrmProjectRepository implements IProjectRepository {
  constructor(
    @InjectRepository(ProjectModel)
    private readonly repo: Repository<ProjectModel>,
  ) {}

  findAll(): Promise<ProjectModel[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findByCompanyId(companyId: string): Promise<ProjectModel[]> {
    return this.repo.find({ where: { companyId }, order: { createdAt: 'DESC' } });
  }

  findBySlug(companyId: string, slug: string): Promise<ProjectModel | null> {
    return this.repo.findOne({ where: { companyId, slug } });
  }

  findById(id: string): Promise<ProjectModel | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Omit<ProjectModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectModel> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<Pick<ProjectModel, 'name' | 'appUrl' | 'docsUrl' | 'changelogUrl'>>,
  ): Promise<ProjectModel> {
    await this.repo.update(id, data);
    return this.repo.findOneOrFail({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
