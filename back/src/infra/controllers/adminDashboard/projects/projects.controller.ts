import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { IProjectReaderRepo } from '../../../../core/repos/project/project.reader.abstract-repo';
import { IProjectWriterRepo } from '../../../../core/repos/project/project.writer.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';
import { ProjectMapper } from '../../../mappers/project.mapper';
import type { UpdateProjectBody } from 'contracts/adminDashboard/projects/updateProject/updateProject.body';
import { Project } from 'contracts/shared/project';
import { ListProjectsRequest } from 'contracts/adminDashboard/projects/listProjects/listProjects.request';
import { GetProjectRequest } from 'contracts/adminDashboard/projects/getProject/getProject.request';
import { UpdateProjectRequest } from 'contracts/adminDashboard/projects/updateProject/updateProject.request';
import { DeleteProjectRequest } from 'contracts/adminDashboard/projects/deleteProject/deleteProject.request';

class UpdateProjectDto implements UpdateProjectBody {
  @IsOptional()
  @IsString()
  name?: string;

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
export class ProjectsController {
  constructor(
    private readonly readerRepo: IProjectReaderRepo,
    private readonly writerRepo: IProjectWriterRepo,
  ) {}

  @Get(ListProjectsRequest.BASE_URL)
  async findAll(): Promise<Project[]> {
    return ProjectMapper.toResponseList(await this.readerRepo.findAll());
  }

  @Get(GetProjectRequest.BASE_URL)
  async findById(@Param('id') id: string): Promise<Project> {
    return ProjectMapper.toResponse(await this.readerRepo.findById(id));
  }

  @Patch(UpdateProjectRequest.BASE_URL)
  async updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto): Promise<Project> {
    return ProjectMapper.toResponse(await this.writerRepo.updateProject(id, dto));
  }

  @Delete(DeleteProjectRequest.BASE_URL)
  delete(@Param('id') id: string): Promise<void> {
    return this.writerRepo.delete(id);
  }
}
