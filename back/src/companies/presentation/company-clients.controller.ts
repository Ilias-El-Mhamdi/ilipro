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
    @Body('name') name: string,
    @Body('email') email: string,
  ) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.clientsService.create(name, email, company.id);
  }

  @Put(':clientId')
  update(
    @Param('clientId') clientId: string,
    @Body('name') name: string,
    @Body('email') email: string,
  ) {
    return this.clientsService.update(clientId, name, email);
  }

  @Delete(':clientId')
  delete(@Param('clientId') clientId: string) {
    return this.clientsService.delete(clientId);
  }
}
