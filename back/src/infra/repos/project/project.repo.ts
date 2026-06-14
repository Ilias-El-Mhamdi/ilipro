import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProjectReaderRepo } from '../../../core/repos/project/project.reader.abstract-repo';
import { IProjectWriterRepo } from '../../../core/repos/project/project.writer.abstract-repo';
import { ProjectEntity } from '../../../core/repos/project/project.entity';
import { uniqueSlug } from '../../../core/utils/slug';

@Injectable()
export class ProjectRepo implements IProjectReaderRepo, IProjectWriterRepo {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly repo: Repository<ProjectEntity>,
  ) {}

  findAll(): Promise<ProjectEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findByCompanyId(companyId: string): Promise<ProjectEntity[]> {
    return this.repo.find({ where: { companyId }, order: { createdAt: 'DESC' } });
  }

  findBySlug(companyId: string, slug: string): Promise<ProjectEntity | null> {
    return this.repo.findOne({ where: { companyId, slug } });
  }

  async findById(id: string): Promise<ProjectEntity> {
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
  ): Promise<ProjectEntity> {
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

  async updateProject(id: string, data: Partial<Pick<ProjectEntity, 'name' | 'appUrl' | 'docsUrl' | 'changelogUrl'>>): Promise<ProjectEntity> {
    await this.findById(id);
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.delete(id);
  }
}
