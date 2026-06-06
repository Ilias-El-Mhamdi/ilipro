import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProjectsUc } from '../../projects/useCase/projects.uc';
import { IProjectRepository } from '../../projects/domain/project.abstract-repository';
import { ICompanyRepository } from '../domain/company.abstract-repository';

@Controller('companies/:companySlug/projects')
export class CompanyProjectsController {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly companyRepo: ICompanyRepository,
  ) {}

  @Get()
  async findByCompany(@Param('companySlug') companySlug: string) {
    const company = await this.companyRepo.findBySlug(companySlug);
    return this.projectRepo.findByCompanyId(company.id);
  }

  @Post()
  async create(
    @Param('companySlug') companySlug: string,
    @Body('name') name: string,
    @Body('appUrl') appUrl?: string,
    @Body('docsUrl') docsUrl?: string,
    @Body('changelogUrl') changelogUrl?: string,
  ) {
    const company = await this.companyRepo.findBySlug(companySlug);
    return this.projectRepo.create(name, company.id, appUrl, docsUrl, changelogUrl);
  }
}
