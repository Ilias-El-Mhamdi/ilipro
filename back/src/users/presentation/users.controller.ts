import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { IUserRepository } from '../domain/user.abtract-repository';
import { UserModel } from '../domain/user.model';

@Controller('users')
export class UsersController {
  constructor(private readonly repo: IUserRepository) {}

  @Get()
  findAll() {
    return this.repo.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.repo.findBySlug(slug);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.repo.findById(id);
  }

  @Post()
  create(@Body('firstName') firstName: string, @Body('lastName') lastName: string, @Body('email') email: string) {
    return this.repo.create(new UserModel(email, firstName, lastName));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('firstName') firstName: string, @Body('lastName') lastName: string) {
    return this.repo.update(id, { firstName, lastName });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.repo.delete(id);
  }
}
