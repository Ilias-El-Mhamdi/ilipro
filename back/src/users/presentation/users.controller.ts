import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UserRepository } from '../domain/user.repository';

@Controller('users')
export class UsersController {
  constructor(
    private readonly service: UsersService,
    private readonly repo: UserRepository,
  ) {}

  @Get()
  findAll() {
    return this.repo.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
  ) {
    return this.service.create(firstName, lastName, email);
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
