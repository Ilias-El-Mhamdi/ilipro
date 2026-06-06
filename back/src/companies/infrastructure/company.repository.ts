import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ICompanyRepository } from '../domain/company.abstract-repository';
import { CompanyModel } from '../domain/company.model';

@Injectable()
export class CompanyRepository implements ICompanyRepository {
  constructor(
    @InjectRepository(CompanyModel)
    private readonly repo: Repository<CompanyModel>,
  ) {}

  findAll(): Promise<CompanyModel[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findBySlug(slug: string): Promise<CompanyModel | null> {
    return this.repo.findOne({ where: { slug } });
  }

  findById(id: string): Promise<CompanyModel | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Pick<CompanyModel, 'name' | 'slug'>): Promise<CompanyModel> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Pick<CompanyModel, 'name' | 'slug'>): Promise<CompanyModel> {
    await this.repo.update(id, data);
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException(`Company ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
