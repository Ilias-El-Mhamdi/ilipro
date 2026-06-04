import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CompanyRepository } from '../domain/company.repository';
import { Company } from '../domain/company.entity';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Company[]> {
    return this.prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findBySlug(slug: string): Promise<Company | null> {
    return this.prisma.company.findUnique({ where: { slug } });
  }

  findById(id: string): Promise<Company | null> {
    return this.prisma.company.findUnique({ where: { id } });
  }

  create(name: string, slug: string): Promise<Company> {
    return this.prisma.company.create({ data: { name, slug } });
  }

  update(id: string, name: string, slug: string): Promise<Company> {
    return this.prisma.company.update({ where: { id }, data: { name, slug } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }
}
