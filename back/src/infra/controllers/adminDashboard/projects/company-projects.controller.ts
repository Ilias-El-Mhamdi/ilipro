import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IProjectReaderRepo } from '../../../../core/repos/project/project.reader.abstract-repo';
import { IProjectWriterRepo } from '../../../../core/repos/project/project.writer.abstract-repo';
import { ICompanyReaderRepo } from '../../../../core/repos/company/company.reader.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('companies/:companySlug/projects')
export class CompanyProjectsController {
  constructor(
    private readonly projectReaderRepo: IProjectReaderRepo,
    private readonly projectWriterRepo: IProjectWriterRepo,
    private readonly companyRepo: ICompanyReaderRepo,
  ) {}

  @Get()
  async findByCompany(@Param('companySlug') companySlug: string) {
    const company = await this.companyRepo.findBySlug(companySlug);
    return this.projectReaderRepo.findByCompanyId(company.id);
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
    return this.projectWriterRepo.create(name, company.id, appUrl, docsUrl, changelogUrl);
  }
}
