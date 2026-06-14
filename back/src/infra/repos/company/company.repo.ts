import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICompanyReaderRepo } from '../../../core/repos/company/company.reader.abstract-repo';
import { ICompanyWriterRepo } from '../../../core/repos/company/company.writer.abstract-repo';
import { CompanyEntity } from '../../../core/repos/company/company.entity';
import { uniqueSlug } from '../../../core/utils/slug';

@Injectable()
export class CompanyRepo implements ICompanyReaderRepo, ICompanyWriterRepo {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly repo: Repository<CompanyEntity>,
  ) {}

  findAll(): Promise<CompanyEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findBySlug(slug: string): Promise<CompanyEntity> {
    const company = await this.repo.findOne({ where: { slug } });
    if (!company) throw new NotFoundException(`Company "${slug}" not found`);
    return company;
  }

  async findById(id: string): Promise<CompanyEntity> {
    const company = await this.repo.findOne({ where: { id } });
    if (!company) throw new NotFoundException(`Company ${id} not found`);
    return company;
  }

  async create(name: string): Promise<CompanyEntity> {
    const slug = await uniqueSlug(name, (s) => this.repo.findOne({ where: { slug: s } }).then(Boolean));
    return this.repo.save(this.repo.create({ name, slug }));
  }

  async update(slug: string, name: string): Promise<CompanyEntity> {
    const company = await this.findBySlug(slug);
    const newSlug = await uniqueSlug(name, (s) => (s !== slug ? this.repo.findOne({ where: { slug: s } }).then(Boolean) : Promise.resolve(false)));
    await this.repo.update(company.id, { name, slug: newSlug });
    return this.findById(company.id);
  }

  async updateName(slug: string, name: string): Promise<CompanyEntity> {
    const company = await this.findBySlug(slug);
    await this.repo.update(company.id, { name });
    return this.findById(company.id);
  }

  async delete(slug: string): Promise<void> {
    const company = await this.findBySlug(slug);
    await this.repo.delete(company.id);
  }
}
