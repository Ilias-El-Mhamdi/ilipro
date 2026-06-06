import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeliverablesUc } from '../../deliverables/useCase/deliverables.uc';
import { IDeliverableRepository } from '../../deliverables/domain/deliverable.repository';

@Controller('projects/:projectId/deliverables')
export class ProjectDeliverablesController {
  constructor(
    private readonly uc: DeliverablesUc,
    private readonly repo: IDeliverableRepository,
  ) {}

  @Get()
  findByProject(@Param('projectId') projectId: string) {
    return this.repo.findByProjectId(projectId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uc.upload(projectId, file);
  }
}
