import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CompaniesUc } from '../useCase/companies.uc';
import { ICompanyRepository } from '../domain/company.abstract-repository';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly uc: CompaniesUc,
    private readonly repo: ICompanyRepository,
  ) {}

  @Get()
  findAll() {
    return this.repo.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.uc.findBySlug(slug);
  }

  @Post()
  create(@Body('name') name: string) {
    return this.uc.create(name);
  }

  @Put(':slug')
  update(@Param('slug') slug: string, @Body('name') name: string) {
    return this.uc.update(slug, name);
  }

  @Patch(':slug/name')
  updateName(@Param('slug') slug: string, @Body('name') name: string) {
    return this.uc.updateName(slug, name);
  }

  @Delete(':slug')
  delete(@Param('slug') slug: string) {
    return this.uc.delete(slug);
  }
}
