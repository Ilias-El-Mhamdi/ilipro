import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { DeliverablesUc } from '../../../../core/flows/deliverables/deliverables.uc';
import { IDeliverableReaderRepo } from '../../../../core/repos/deliverable/deliverable.reader.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('deliverables')
export class DeliverablesController {
  constructor(
    private readonly uc: DeliverablesUc,
    private readonly repo: IDeliverableReaderRepo,
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
