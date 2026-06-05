import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ClientsService } from '../../clients/application/clients.service';
import { CompaniesService } from '../application/companies.service';

@Controller('companies/:companySlug/clients')
export class CompanyClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Get()
  async findByCompany(@Param('companySlug') companySlug: string) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.clientsService.findByCompanyId(company.id);
  }

  @Post()
  async create(
    @Param('companySlug') companySlug: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
  ) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.clientsService.create(firstName, lastName, email, company.id);
  }

  @Put(':clientId')
  update(
    @Param('clientId') clientId: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
  ) {
    return this.clientsService.update(clientId, firstName, lastName);
  }

  @Delete(':clientId')
  delete(@Param('clientId') clientId: string) {
    return this.clientsService.delete(clientId);
  }
}
