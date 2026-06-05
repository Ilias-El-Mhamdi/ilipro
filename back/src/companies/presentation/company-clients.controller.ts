import { Body, Controller, Delete, Get, Param, Post, Put, Patch } from '@nestjs/common';
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
  async createOrLink(
    @Param('companySlug') companySlug: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
  ) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.clientsService.createOrLink(firstName, lastName, email, company.id);
  }

  @Put(':clientId')
  update(
    @Param('clientId') clientId: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
  ) {
    return this.clientsService.update(clientId, firstName, lastName);
  }

  @Patch(':clientId/link')
  async linkExisting(
    @Param('companySlug') companySlug: string,
    @Param('clientId') clientId: string,
  ) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.clientsService.linkToCompany(clientId, company.id);
  }

  @Delete(':clientId')
  async unlink(
    @Param('companySlug') companySlug: string,
    @Param('clientId') clientId: string,
  ) {
    const company = await this.companiesService.findBySlug(companySlug);
    return this.clientsService.unlinkFromCompany(clientId, company.id);
  }
}
