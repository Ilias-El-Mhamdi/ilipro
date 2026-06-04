import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ClientsService } from '../../clients/application/clients.service';

@Controller('projects/:projectId/clients')
export class ProjectClientsController {
  constructor(private readonly service: ClientsService) {}

  @Get()
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProjectId(projectId);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body('name') name: string,
    @Body('email') email: string,
  ) {
    return this.service.create(name, email, projectId);
  }
}
