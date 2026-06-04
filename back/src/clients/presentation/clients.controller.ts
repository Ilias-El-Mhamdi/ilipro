import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('email') email: string,
  ) {
    return this.service.update(id, name, email);
  }
}
