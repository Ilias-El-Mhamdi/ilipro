import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeliverablesService } from '../../deliverables/application/deliverables.service';

@Controller('projects/:projectId/deliverables')
export class ProjectDeliverablesController {
  constructor(private readonly service: DeliverablesService) {}

  @Get()
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProjectId(projectId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.upload(projectId, file);
  }
}
