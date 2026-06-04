import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectRepository } from '../domain/project.repository';
import type { Project } from '../domain/project.entity';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Project[]> {
    return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findByCompanyId(companyId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findBySlug(companyId: string, slug: string): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { companyId_slug: { companyId, slug } },
    });
  }

  findById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({ where: { id } });
  }

  create(name: string, slug: string, companyId: string): Promise<Project> {
    return this.prisma.project.create({ data: { name, slug, companyId } });
  }

  update(id: string, name: string, slug: string): Promise<Project> {
    return this.prisma.project.update({ where: { id }, data: { name, slug } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }
}
