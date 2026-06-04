import { Body, Controller, Delete, Get, Param } from '@nestjs/common';
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

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
