import { Body, Controller, Delete, Get, Param, Post, Put, Patch } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { UserRepository } from '../../users/domain/user.repository';
import { CompaniesService } from '../application/companies.service';

@Controller('companies/:companySlug/users')
export class CompanyUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRepo: UserRepository,
    private readonly companiesService: CompaniesService,
  ) {}

  @Get()
  async findByCompany(@Param('companySlug') companySlug: string) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.userRepo.findByCompanyId(company.id);
  }

  @Post()
  async createOrLink(
    @Param('companySlug') companySlug: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
  ) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.usersService.createOrLink(firstName, lastName, email, company.id);
  }

  @Put(':userId')
  update(
    @Param('userId') userId: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
  ) {
    return this.usersService.update(userId, firstName, lastName);
  }

  @Patch(':userId/link')
  async linkExisting(
    @Param('companySlug') companySlug: string,
    @Param('userId') userId: string,
  ) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.usersService.linkToCompany(userId, company.id);
  }

  @Delete(':userId')
  async unlink(
    @Param('companySlug') companySlug: string,
    @Param('userId') userId: string,
  ) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.usersService.unlinkFromCompany(userId, company.id);
  }
}
