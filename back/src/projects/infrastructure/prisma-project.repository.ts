import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectRepository } from '../domain/project.repository';
import { ProjectEntity } from '../domain/project.entity';
import type { ProjectModel } from '../domain/project.model';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toModel(row: any): ProjectModel {
    return Object.assign(new ProjectEntity(), row).toModel();
  }

  findAll(): Promise<ProjectModel[]> {
    return this.prisma.project
      .findMany({ orderBy: { createdAt: 'desc' } })
      .then((rows) => rows.map(this.toModel.bind(this)));
  }

  findByCompanyId(companyId: string): Promise<ProjectModel[]> {
    return this.prisma.project
      .findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } })
      .then((rows) => rows.map(this.toModel.bind(this)));
  }

  findBySlug(companyId: string, slug: string): Promise<ProjectModel | null> {
    return this.prisma.project
      .findUnique({ where: { companyId_slug: { companyId, slug } } })
      .then((r) => (r ? this.toModel(r) : null));
  }

  findById(id: string): Promise<ProjectModel | null> {
    return this.prisma.project
      .findUnique({ where: { id } })
      .then((r) => (r ? this.toModel(r) : null));
  }

  create(data: Omit<ProjectModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectModel> {
    return this.prisma.project
      .create({ data })
      .then((r) => this.toModel(r));
  }

  update(
    id: string,
    data: Partial<Pick<ProjectModel, 'name' | 'appUrl' | 'docsUrl' | 'changelogUrl'>>,
  ): Promise<ProjectModel> {
    return this.prisma.project
      .update({ where: { id }, data })
      .then((r) => this.toModel(r));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }
}
