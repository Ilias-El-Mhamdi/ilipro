import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { DeliverablesUc } from '../../../../core/flows/deliverables/deliverables.uc';
import { IDeliverableReaderRepo } from '../../../../core/repos/deliverable/deliverable.reader.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';
import { DeliverableMapper } from '../../../mappers/deliverable.mapper';
import { Deliverable } from 'platform/contracts/shared/deliverable';
import { GetDeliverableRequest } from 'platform/contracts/adminDashboard/deliverables/getDeliverable/getDeliverable.request';
import { GetDeliverableDownloadRequest } from 'platform/contracts/adminDashboard/deliverables/getDeliverableDownload/getDeliverableDownload.request';
import { DeleteDeliverableRequest } from 'platform/contracts/adminDashboard/deliverables/deleteDeliverable/deleteDeliverable.request';

@UseGuards(AdminGuard)
@Controller()
export class DeliverablesController {
  constructor(
    private readonly uc: DeliverablesUc,
    private readonly repo: IDeliverableReaderRepo,
  ) {}

  @Get(GetDeliverableRequest.BASE_URL)
  async findById(@Param('id') id: string): Promise<Deliverable> {
    return DeliverableMapper.toResponse(await this.repo.findById(id));
  }

  @Get(GetDeliverableDownloadRequest.BASE_URL)
  async download(@Param('id') id: string): Promise<{ url: string }> {
    const url = await this.uc.getDownloadUrl(id);
    return { url };
  }

  @Delete(DeleteDeliverableRequest.BASE_URL)
  delete(@Param('id') id: string): Promise<void> {
    return this.uc.delete(id);
  }
}
