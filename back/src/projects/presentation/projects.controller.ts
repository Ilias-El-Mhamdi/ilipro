import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { IProjectRepository } from '../domain/project.abstract-repository';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly repo: IProjectRepository) {}

  @Get()
  findAll() {
    return this.repo.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.repo.findById(id);
  }

  @Patch(':id')
  updateProject(
    @Param('id') id: string,
    @Body() body: { name?: string; appUrl?: string | null; docsUrl?: string | null; changelogUrl?: string | null },
  ) {
    return this.repo.updateProject(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.repo.delete(id);
  }
}
