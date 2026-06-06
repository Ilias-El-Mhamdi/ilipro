import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ProjectsUc } from '../useCase/projects.uc';
import { IProjectRepository } from '../domain/project.repository';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly uc: ProjectsUc,
    private readonly repo: IProjectRepository,
  ) {}

  @Get()
  findAll() {
    return this.repo.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.uc.findById(id);
  }

  @Patch(':id')
  updateProject(
    @Param('id') id: string,
    @Body() body: { name?: string; appUrl?: string | null; docsUrl?: string | null; changelogUrl?: string | null },
  ) {
    return this.uc.updateProject(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.uc.delete(id);
  }
}
