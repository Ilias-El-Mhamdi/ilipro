import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import { LinkUserUc } from '../../../../core/flows/linkUser/linkUser.uc';
import { IUserWriterRepo } from '../../../../core/repos/user/user.writer.abstract-repo';
import { IUserCompanyReaderRepo } from '../../../../core/repos/userCompany/userCompany.reader.abstract-repo';
import { IUserCompanyWriterRepo } from '../../../../core/repos/userCompany/userCompany.writer.abstract-repo';
import { ICompanyReaderRepo } from '../../../../core/repos/company/company.reader.abstract-repo';
import { ILicenseReaderRepo } from '../../../../core/repos/license/license.reader.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';
import { UserMapper } from '../../../mappers/user.mapper';
import type { CreateCompanyUserBody } from 'platform/contracts/adminDashboard/linkUser/createCompanyUser/createCompanyUser.body';
import type { UpdateCompanyUserBody } from 'platform/contracts/adminDashboard/linkUser/updateCompanyUser/updateCompanyUser.body';
import { User } from 'platform/contracts/shared/user';
import { CompanyUser } from 'platform/contracts/adminDashboard/linkUser/listCompanyUsers/listCompanyUsers.response';
import { ListCompanyUsersRequest } from 'platform/contracts/adminDashboard/linkUser/listCompanyUsers/listCompanyUsers.request';
import { CreateCompanyUserRequest } from 'platform/contracts/adminDashboard/linkUser/createCompanyUser/createCompanyUser.request';
import { UpdateCompanyUserRequest } from 'platform/contracts/adminDashboard/linkUser/updateCompanyUser/updateCompanyUser.request';
import { LinkUserRequest } from 'platform/contracts/adminDashboard/linkUser/linkUser/linkUser.request';
import { UnlinkUserRequest } from 'platform/contracts/adminDashboard/linkUser/unlinkUser/unlinkUser.request';

class CreateCompanyUserDto implements CreateCompanyUserBody {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;
}

class UpdateCompanyUserDto implements UpdateCompanyUserBody {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}

@UseGuards(AdminGuard)
@Controller()
export class LinkUserController {
  constructor(
    private readonly linkUserUc: LinkUserUc,
    @Inject(IUserWriterRepo) private readonly userRepo: IUserWriterRepo,
    @Inject(IUserCompanyReaderRepo) private readonly userCompanyReaderRepo: IUserCompanyReaderRepo,
    @Inject(IUserCompanyWriterRepo) private readonly userCompanyWriterRepo: IUserCompanyWriterRepo,
    @Inject(ICompanyReaderRepo) private readonly companyRepo: ICompanyReaderRepo,
    @Inject(ILicenseReaderRepo) private readonly licenseRepo: ILicenseReaderRepo,
  ) {}

  @Get(ListCompanyUsersRequest.BASE_URL)
  async findByCompany(@Param('companySlug') companySlug: string): Promise<CompanyUser[]> {
    const company = await this.companyRepo.findBySlug(companySlug);
    const users = await this.userCompanyReaderRepo.findUsersByCompanyId(company.id);

    return Promise.all(
      users.map(async (user) => {
        const license = await this.licenseRepo.findByUserAndCompany(user.id, company.id);
        return UserMapper.toCompanyUser(user, license ?? null);
      }),
    );
  }

  @Post(CreateCompanyUserRequest.BASE_URL)
  async createOrLink(@Param('companySlug') companySlug: string, @Body() dto: CreateCompanyUserDto): Promise<User> {
    const company = await this.companyRepo.findBySlug(companySlug);
    return UserMapper.toResponse(await this.linkUserUc.createOrLink(dto.firstName, dto.lastName, dto.email, company.id));
  }

  @Put(UpdateCompanyUserRequest.BASE_URL)
  async update(@Param('userId') userId: string, @Body() dto: UpdateCompanyUserDto): Promise<User> {
    return UserMapper.toResponse(
      await this.userRepo.update(userId, {
        firstName: dto.firstName,
        lastName: dto.lastName,
      }),
    );
  }

  @Patch(LinkUserRequest.BASE_URL)
  async linkExisting(@Param('companySlug') companySlug: string, @Param('userId') userId: string): Promise<void> {
    const company = await this.companyRepo.findBySlug(companySlug);
    await this.linkUserUc.linkToCompany(userId, company.id);
  }

  @Delete(UnlinkUserRequest.BASE_URL)
  async unlink(@Param('companySlug') companySlug: string, @Param('userId') userId: string): Promise<void> {
    const company = await this.companyRepo.findBySlug(companySlug);
    await this.userCompanyWriterRepo.unlink(userId, company.id);
  }
}
