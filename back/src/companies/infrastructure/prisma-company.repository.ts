import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CompanyRepository } from '../domain/company.repository';
import { CompanyEntity } from '../domain/company.entity';
import type { CompanyModel } from '../domain/company.model';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toModel(row: any): CompanyModel {
    return Object.assign(new CompanyEntity(), row).toModel();
  }

  findAll(): Promise<CompanyModel[]> {
    return this.prisma.company
      .findMany({ orderBy: { createdAt: 'desc' } })
      .then((rows) => rows.map(this.toModel.bind(this)));
  }

  findBySlug(slug: string): Promise<CompanyModel | null> {
    return this.prisma.company
      .findUnique({ where: { slug } })
      .then((r) => (r ? this.toModel(r) : null));
  }

  findById(id: string): Promise<CompanyModel | null> {
    return this.prisma.company
      .findUnique({ where: { id } })
      .then((r) => (r ? this.toModel(r) : null));
  }

  create(data: Pick<CompanyModel, 'name' | 'slug'>): Promise<CompanyModel> {
    return this.prisma.company.create({ data }).then((r) => this.toModel(r));
  }

  update(
    id: string,
    data: Pick<CompanyModel, 'name' | 'slug'>,
  ): Promise<CompanyModel> {
    return this.prisma.company
      .update({ where: { id }, data })
      .then((r) => this.toModel(r));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }
}
