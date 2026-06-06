import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
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

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.uc.delete(id);
  }
}
