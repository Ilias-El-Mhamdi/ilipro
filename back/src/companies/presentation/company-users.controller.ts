import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Patch } from '@nestjs/common';
import { LinkUserUc } from '../../liens/lienUserCompany/useCase/linkUser.uc';
import { IUserRepository } from '../../users/domain/user.abtract-repository';
import { IUserCompanyRepository } from '../../liens/lienUserCompany/domain/user-company.abstract-repository';
import { ICompanyRepository } from '../domain/company.abstract-repository';

@Controller('companies/:companySlug/users')
export class CompanyUsersController {
  constructor(
    private readonly linkUserUc: LinkUserUc,
    @Inject(IUserRepository) private readonly userRepo: IUserRepository,
    @Inject(IUserCompanyRepository) private readonly userCompanyRepo: IUserCompanyRepository,
    @Inject(ICompanyRepository) private readonly companyRepo: ICompanyRepository,
  ) {}

  @Get()
  async findByCompany(@Param('companySlug') companySlug: string) {
    const company = await this.companyRepo.findBySlug(companySlug);
    return this.userCompanyRepo.findUsersByCompanyId(company.id);
  }

  @Post()
  async createOrLink(
    @Param('companySlug') companySlug: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
  ) {
    const company = await this.companyRepo.findBySlug(companySlug);
    return this.linkUserUc.createOrLink(firstName, lastName, email, company.id);
  }

  @Put(':userId')
  update(@Param('userId') userId: string, @Body('firstName') firstName: string, @Body('lastName') lastName: string) {
    return this.userRepo.update(userId, { firstName, lastName });
  }

  @Patch(':userId/link')
  async linkExisting(@Param('companySlug') companySlug: string, @Param('userId') userId: string) {
    const company = await this.companyRepo.findBySlug(companySlug);
    return this.linkUserUc.linkToCompany(userId, company.id);
  }

  @Delete(':userId')
  async unlink(@Param('companySlug') companySlug: string, @Param('userId') userId: string) {
    const company = await this.companyRepo.findBySlug(companySlug);
    return this.userCompanyRepo.unlink(userId, company.id);
  }
}
