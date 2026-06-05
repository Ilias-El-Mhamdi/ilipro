import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ClientsService } from '../application/clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
  ) {
    return this.service.update(id, firstName, lastName);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
