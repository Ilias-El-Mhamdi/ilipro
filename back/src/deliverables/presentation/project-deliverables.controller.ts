import { Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { DeliverablesUc } from '../useCase/deliverables.uc';
import { IDeliverableRepository } from '../domain/deliverable.abstract-repository';
import { AdminGuard } from '../../auth/guards/admin.guard';
import type { JwtPayload } from '../../auth/domain/jwt-payload';

@Controller('projects/:projectId/deliverables')
export class ProjectDeliverablesController {
  constructor(
    private readonly uc: DeliverablesUc,
    private readonly repo: IDeliverableRepository,
  ) {}

  @Get()
  async findByProject(@Param('projectId') projectId: string, @Req() req: Request) {
    const caller = req['user'] as JwtPayload;
    await this.uc.assertProjectAccess(projectId, caller);
    return this.repo.findByProjectId(projectId);
  }

  @Get(':deliverableId/download')
  async download(@Param('projectId') projectId: string, @Param('deliverableId') deliverableId: string, @Req() req: Request) {
    const caller = req['user'] as JwtPayload;
    await this.uc.assertProjectAccess(projectId, caller);
    const url = await this.uc.getDownloadUrl(deliverableId);
    return { url };
  }

  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(@Param('projectId') projectId: string, @UploadedFile() file: Express.Multer.File) {
    return this.uc.upload(projectId, file);
  }
}
