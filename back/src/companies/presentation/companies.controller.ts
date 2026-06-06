import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ICompanyRepository } from '../domain/company.abstract-repository';
import { AdminGuard } from '../../auth/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly repo: ICompanyRepository) {}

  @Get()
  findAll() {
    return this.repo.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.repo.findBySlug(slug);
  }

  @Post()
  create(@Body('name') name: string) {
    return this.repo.create(name);
  }

  @Put(':slug')
  update(@Param('slug') slug: string, @Body('name') name: string) {
    return this.repo.update(slug, name);
  }

  @Patch(':slug/name')
  updateName(@Param('slug') slug: string, @Body('name') name: string) {
    return this.repo.updateName(slug, name);
  }

  @Delete(':slug')
  delete(@Param('slug') slug: string) {
    return this.repo.delete(slug);
  }
}
