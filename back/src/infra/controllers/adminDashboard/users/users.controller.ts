import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IUserWriterRepo } from '../../../../core/repos/user/user.writer.abstract-repo';
import { UserModel } from '../../../../core/repos/user/user.entity';
import { AdminGuard } from '../../../../infra/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly repo: IUserWriterRepo) {}

  @Get()
  findAll() {
    return this.repo.findAll();
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
