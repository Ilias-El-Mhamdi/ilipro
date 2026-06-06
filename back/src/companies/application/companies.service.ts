import { Injectable, NotFoundException } from '@nestjs/common';
import { ICompanyRepository } from '../domain/company.repository';
import { uniqueSlug } from '../../common/slug.helper';

@Injectable()
export class CompaniesService {
  constructor(private readonly repo: ICompanyRepository) {}

  async findBySlug(slug: string) {
    const company = await this.repo.findBySlug(slug);
    if (!company) throw new NotFoundException(`Company "${slug}" not found`);
    return company;
  }

  async findById(id: string) {
    const company = await this.repo.findById(id);
    if (!company) throw new NotFoundException(`Company ${id} not found`);
    return company;
  }

  async create(name: string) {
    const slug = await uniqueSlug(name, (s) =>
      this.repo.findBySlug(s).then((c) => c !== null),
    );
    return this.repo.create({ name, slug });
  }

  async update(slug: string, name: string) {
    const company = await this.findBySlug(slug);
    const newSlug = await uniqueSlug(name, (s) =>
      s !== slug
        ? this.repo.findBySlug(s).then((c) => c !== null)
        : Promise.resolve(false),
    );
    return this.repo.update(company.id, { name, slug: newSlug });
  }

  async updateName(slug: string, name: string) {
    const company = await this.findBySlug(slug);
    return this.repo.update(company.id, { name, slug: company.slug });
  }

  async delete(slug: string) {
    const company = await this.findBySlug(slug);
    return this.repo.delete(company.id);
  }
}
