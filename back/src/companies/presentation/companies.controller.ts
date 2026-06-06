import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CompaniesService } from '../application/companies.service';
import { ICompanyRepository } from '../domain/company.repository';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly service: CompaniesService,
    private readonly repo: ICompanyRepository,
  ) {}

  @Get()
  findAll() {
    return this.repo.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post()
  create(@Body('name') name: string) {
    return this.service.create(name);
  }

  @Put(':slug')
  update(@Param('slug') slug: string, @Body('name') name: string) {
    return this.service.update(slug, name);
  }

  @Patch(':slug/name')
  updateName(@Param('slug') slug: string, @Body('name') name: string) {
    return this.service.updateName(slug, name);
  }

  @Delete(':slug')
  delete(@Param('slug') slug: string) {
    return this.service.delete(slug);
  }
}
