import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../domain/project.repository';
import { CompaniesService } from '../../companies/application/companies.service';
import { uniqueSlug } from '../../common/slug.helper';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly companiesService: CompaniesService,
  ) {}

  findAll() {
    return this.repo.findAll();
  }

  findByCompanyId(companyId: string) {
    return this.repo.findByCompanyId(companyId);
  }

  async findBySlug(companySlug: string, projectSlug: string) {
    const company = await this.companiesService.findBySlug(companySlug);
    const project = await this.repo.findBySlug(company.id, projectSlug);
    if (!project) throw new NotFoundException(`Project "${projectSlug}" not found`);
    return project;
  }

  async findById(id: string) {
    const project = await this.repo.findById(id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async create(name: string, companyId: string) {
    const slug = await uniqueSlug(name, (s) =>
      this.repo.findBySlug(companyId, s).then((p) => p !== null),
    );
    return this.repo.create(name, slug, companyId);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repo.delete(id);
  }
}
