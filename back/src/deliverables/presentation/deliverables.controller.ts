import { Controller, Delete, Get, Param, Redirect, UseGuards } from '@nestjs/common';
import { DeliverablesUc } from '../useCase/deliverables.uc';
import { IDeliverableRepository } from '../domain/deliverable.abstract-repository';
import { AdminGuard } from '../../auth/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('deliverables')
export class DeliverablesController {
  constructor(
    private readonly uc: DeliverablesUc,
    private readonly repo: IDeliverableRepository,
  ) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.repo.findById(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string) {
    const url = await this.uc.getDownloadUrl(id);
    return { url };
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.uc.delete(id);
  }
}
