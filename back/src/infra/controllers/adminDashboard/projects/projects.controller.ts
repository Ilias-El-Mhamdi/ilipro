import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IProjectReaderRepo } from '../../../../core/repos/project/project.reader.abstract-repo';
import { IProjectWriterRepo } from '../../../../core/repos/project/project.writer.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly readerRepo: IProjectReaderRepo,
    private readonly writerRepo: IProjectWriterRepo,
  ) {}

  @Get()
  findAll() {
    return this.readerRepo.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.readerRepo.findById(id);
  }

  @Patch(':id')
  updateProject(
    @Param('id') id: string,
    @Body() body: { name?: string; appUrl?: string | null; docsUrl?: string | null; changelogUrl?: string | null },
  ) {
    return this.writerRepo.updateProject(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.writerRepo.delete(id);
  }
}
