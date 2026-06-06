import { Injectable, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../domain/project.abstract-repository';
import { ICompanyRepository } from '../../companies/domain/company.abstract-repository';

@Injectable()
export class ProjectsUc {
  constructor(
    private readonly repo: IProjectRepository,
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async findBySlug(companySlug: string, projectSlug: string) {
    const company = await this.companyRepo.findBySlug(companySlug);
    const project = await this.repo.findBySlug(company.id, projectSlug);
    if (!project) throw new NotFoundException(`Project "${projectSlug}" not found`);
    return project;
  }
}
