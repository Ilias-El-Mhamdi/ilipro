import { Injectable, NotFoundException } from '@nestjs/common';
import { IProjectReaderRepo } from '../../repos/project/project.reader.abstract-repo';
import { ICompanyReaderRepo } from '../../repos/company/company.reader.abstract-repo';

@Injectable()
export class ProjectsUc {
  constructor(
    private readonly repo: IProjectReaderRepo,
    private readonly companyRepo: ICompanyReaderRepo,
  ) {}

  async findBySlug(companySlug: string, projectSlug: string) {
    const company = await this.companyRepo.findBySlug(companySlug);
    const project = await this.repo.findBySlug(company.id, projectSlug);
    if (!project) throw new NotFoundException(`Project "${projectSlug}" not found`);
    return project;
  }
}
