import { Controller, Delete, Get, Param } from '@nestjs/common';
import { DeliverablesService } from '../application/deliverables.service';

@Controller('deliverables')
export class DeliverablesController {
  constructor(private readonly service: DeliverablesService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
