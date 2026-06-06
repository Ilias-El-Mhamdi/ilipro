import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IProjectRepository } from '../domain/project.abstract-repository';
import { ProjectModel } from '../domain/project.model';
import { uniqueSlug } from '../../common/slug.helper';

@Injectable()
export class ProjectRepository implements IProjectRepository {
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

  async findById(id: string): Promise<ProjectModel> {
    const project = await this.repo.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async create(
    name: string,
    companyId: string,
    appUrl?: string | null,
    docsUrl?: string | null,
    changelogUrl?: string | null,
  ): Promise<ProjectModel> {
    const slug = await uniqueSlug(name, (s) => this.repo.findOne({ where: { companyId, slug: s } }).then(Boolean));
    return this.repo.save(
      this.repo.create({
        name,
        slug,
        companyId,
        appUrl: appUrl ?? null,
        docsUrl: docsUrl ?? null,
        changelogUrl: changelogUrl ?? null,
      }),
    );
  }

  async updateProject(id: string, data: Partial<Pick<ProjectModel, 'name' | 'appUrl' | 'docsUrl' | 'changelogUrl'>>): Promise<ProjectModel> {
    await this.findById(id);
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.delete(id);
  }
}
