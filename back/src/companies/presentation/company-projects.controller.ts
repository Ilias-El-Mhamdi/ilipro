import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProjectsService } from '../../projects/application/projects.service';
import { CompaniesService } from '../application/companies.service';

@Controller('companies/:companySlug/projects')
export class CompanyProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Get()
  async findByCompany(@Param('companySlug') companySlug: string) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.projectsService.findByCompanyId(company.id);
  }

  @Post()
  async create(@Param('companySlug') companySlug: string, @Body('name') name: string) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.projectsService.create(name, company.id);
  }
}
