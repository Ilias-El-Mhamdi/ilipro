import { Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { DeliverablesUc } from '../../../../core/flows/deliverables/deliverables.uc';
import { IDeliverableReaderRepo } from '../../../../core/repos/deliverable/deliverable.reader.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';
import { DeliverableMapper } from '../../../mappers/deliverable.mapper';
import type { JwtPayload } from '../../../../core/flows/jwt/jwtPayload';
import { Deliverable } from 'platform/contracts/shared/deliverable';
import { ListProjectDeliverablesRequest } from 'platform/contracts/adminDashboard/projectDeliverables/listProjectDeliverables/listProjectDeliverables.request';
import { GetProjectDeliverableDownloadRequest } from 'platform/contracts/adminDashboard/projectDeliverables/getProjectDeliverableDownload/getProjectDeliverableDownload.request';
import { UploadProjectDeliverableRequest } from 'platform/contracts/adminDashboard/projectDeliverables/uploadProjectDeliverable/uploadProjectDeliverable.request';

@Controller()
export class ProjectDeliverablesController {
  constructor(
    private readonly uc: DeliverablesUc,
    private readonly repo: IDeliverableReaderRepo,
  ) {}

  @Get(ListProjectDeliverablesRequest.BASE_URL)
  async findByProject(@Param('projectId') projectId: string, @Req() req: Request): Promise<Deliverable[]> {
    const caller = req['user'] as JwtPayload;
    await this.uc.assertProjectAccess(projectId, caller);
    return DeliverableMapper.toResponseList(await this.repo.findByProjectId(projectId));
  }

  @Get(GetProjectDeliverableDownloadRequest.BASE_URL)
  async download(
    @Param('projectId') projectId: string,
    @Param('deliverableId') deliverableId: string,
    @Req() req: Request,
  ): Promise<{ url: string }> {
    const caller = req['user'] as JwtPayload;
    await this.uc.assertProjectAccess(projectId, caller);
    const url = await this.uc.getDownloadUrl(deliverableId);
    return { url };
  }

  @UseGuards(AdminGuard)
  @Post(UploadProjectDeliverableRequest.BASE_URL)
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Param('projectId') projectId: string, @UploadedFile() file: Express.Multer.File): Promise<Deliverable> {
    return DeliverableMapper.toResponse(await this.uc.upload(projectId, file));
  }
}
