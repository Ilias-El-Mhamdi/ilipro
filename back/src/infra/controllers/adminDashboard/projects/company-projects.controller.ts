import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { IProjectReaderRepo } from '../../../../core/repos/project/project.reader.abstract-repo';
import { IProjectWriterRepo } from '../../../../core/repos/project/project.writer.abstract-repo';
import { ICompanyReaderRepo } from '../../../../core/repos/company/company.reader.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';
import { ProjectMapper } from '../../../mappers/project.mapper';
import type { CreateCompanyProjectBody } from 'contracts/adminDashboard/companyProjects/createCompanyProject/createCompanyProject.body';
import { Project } from 'contracts/shared/project';
import { ListCompanyProjectsRequest } from 'contracts/adminDashboard/companyProjects/listCompanyProjects/listCompanyProjects.request';
import { CreateCompanyProjectRequest } from 'contracts/adminDashboard/companyProjects/createCompanyProject/createCompanyProject.request';

class CreateCompanyProjectDto implements CreateCompanyProjectBody {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  appUrl?: string | null;

  @IsOptional()
  @IsString()
  docsUrl?: string | null;

  @IsOptional()
  @IsString()
  changelogUrl?: string | null;
}

@UseGuards(AdminGuard)
@Controller()
export class CompanyProjectsController {
  constructor(
    private readonly projectReaderRepo: IProjectReaderRepo,
    private readonly projectWriterRepo: IProjectWriterRepo,
    private readonly companyRepo: ICompanyReaderRepo,
  ) {}

  @Get(ListCompanyProjectsRequest.BASE_URL)
  async findByCompany(@Param('companySlug') companySlug: string): Promise<Project[]> {
    const company = await this.companyRepo.findBySlug(companySlug);
    return ProjectMapper.toResponseList(await this.projectReaderRepo.findByCompanyId(company.id));
  }

  @Post(CreateCompanyProjectRequest.BASE_URL)
  async create(@Param('companySlug') companySlug: string, @Body() dto: CreateCompanyProjectDto): Promise<Project> {
    const company = await this.companyRepo.findBySlug(companySlug);
    return ProjectMapper.toResponse(await this.projectWriterRepo.create(dto.name, company.id, dto.appUrl, dto.docsUrl, dto.changelogUrl));
  }
}
