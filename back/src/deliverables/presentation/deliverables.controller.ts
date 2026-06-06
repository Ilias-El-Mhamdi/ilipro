import { Controller, Delete, Get, Param } from '@nestjs/common';
import { DeliverablesUc } from '../useCase/deliverables.uc';

@Controller('deliverables')
export class DeliverablesController {
  constructor(private readonly uc: DeliverablesUc) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.uc.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.uc.delete(id);
  }
}
