import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import { IUserWriterRepo } from '../../../../core/repos/user/user.writer.abstract-repo';
import { UserEntity } from '../../../../core/repos/user/user.entity';
import { AdminGuard } from '../../../../infra/guards/admin.guard';
import { UserMapper } from '../../../mappers/user.mapper';
import type { CreateUserBody } from 'contracts/adminDashboard/users/createUser/createUser.body';
import type { UpdateUserBody } from 'contracts/adminDashboard/users/updateUser/updateUser.body';
import { User } from 'contracts/shared/user';
import { ListUsersRequest } from 'contracts/adminDashboard/users/listUsers/listUsers.request';
import { GetUserRequest } from 'contracts/adminDashboard/users/getUser/getUser.request';
import { CreateUserRequest } from 'contracts/adminDashboard/users/createUser/createUser.request';
import { UpdateUserRequest } from 'contracts/adminDashboard/users/updateUser/updateUser.request';
import { DeleteUserRequest } from 'contracts/adminDashboard/users/deleteUser/deleteUser.request';

class CreateUserDto implements CreateUserBody {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;
}

class UpdateUserDto implements UpdateUserBody {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}

@UseGuards(AdminGuard)
@Controller()
export class UsersController {
  constructor(private readonly repo: IUserWriterRepo) {}

  @Get(ListUsersRequest.BASE_URL)
  async findAll(): Promise<User[]> {
    return UserMapper.toResponseList(await this.repo.findAll());
  }

  @Get(GetUserRequest.BASE_URL)
  async findById(@Param('id') id: string): Promise<User> {
    return UserMapper.toResponse(await this.repo.findById(id));
  }

  @Post(CreateUserRequest.BASE_URL)
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return UserMapper.toResponse(await this.repo.create(new UserEntity(dto.email, dto.firstName, dto.lastName)));
  }

  @Patch(UpdateUserRequest.BASE_URL)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<User> {
    return UserMapper.toResponse(await this.repo.update(id, { firstName: dto.firstName, lastName: dto.lastName }));
  }

  @Delete(DeleteUserRequest.BASE_URL)
  delete(@Param('id') id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
