import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ProjectsService } from '../application/projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  updateProject(
    @Param('id') id: string,
    @Body() body: { name?: string; appUrl?: string | null; docsUrl?: string | null; changelogUrl?: string | null },
  ) {
    return this.service.updateProject(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
