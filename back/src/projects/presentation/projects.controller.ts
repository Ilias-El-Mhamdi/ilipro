import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IProjectRepository } from '../domain/project.abstract-repository';
import { AdminGuard } from '../../auth/guards/admin.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly repo: IProjectRepository) {}

  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.repo.findAll();
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.repo.findById(id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  updateProject(
    @Param('id') id: string,
    @Body() body: { name?: string; appUrl?: string | null; docsUrl?: string | null; changelogUrl?: string | null },
  ) {
    return this.repo.updateProject(id, body);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.repo.delete(id);
  }
}
