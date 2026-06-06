import { Controller, ForbiddenException, Get, Inject, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { DeliverablesUc } from '../useCase/deliverables.uc';
import { IDeliverableRepository } from '../domain/deliverable.abstract-repository';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { IProjectRepository } from '../../projects/domain/project.abstract-repository';
import { IUserCompanyRepository } from '../../liens/lienUserCompany/domain/user-company.abstract-repository';
import type { JwtPayload } from '../../auth/domain/jwt-payload';

@Controller('projects/:projectId/deliverables')
export class ProjectDeliverablesController {
  constructor(
    private readonly uc: DeliverablesUc,
    private readonly repo: IDeliverableRepository,
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
    @Inject(IUserCompanyRepository) private readonly userCompanyRepo: IUserCompanyRepository,
  ) {}

  @Get()
  async findByProject(@Param('projectId') projectId: string, @Req() req: Request) {
    const caller = req['user'] as JwtPayload;

    if (!caller.isAdmin) {
      const project = await this.projectRepo.findById(projectId);
      const companyIds = await this.userCompanyRepo.findCompanyIdsByUserId(caller.sub);
      if (!companyIds.includes(project.companyId)) throw new ForbiddenException();
    }

    return this.repo.findByProjectId(projectId);
  }

  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(@Param('projectId') projectId: string, @UploadedFile() file: Express.Multer.File) {
    return this.uc.upload(projectId, file);
  }
}
