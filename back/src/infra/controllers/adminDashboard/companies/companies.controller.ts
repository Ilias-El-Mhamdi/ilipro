import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ICompanyReaderRepo } from '../../../../core/repos/company/company.reader.abstract-repo';
import { ICompanyWriterRepo } from '../../../../core/repos/company/company.writer.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly readerRepo: ICompanyReaderRepo,
    private readonly writerRepo: ICompanyWriterRepo,
  ) {}

  @Get()
  findAll() {
    return this.readerRepo.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.readerRepo.findBySlug(slug);
  }

  @Post()
  create(@Body('name') name: string) {
    return this.writerRepo.create(name);
  }

  @Put(':slug')
  update(@Param('slug') slug: string, @Body('name') name: string) {
    return this.writerRepo.update(slug, name);
  }

  @Patch(':slug/name')
  updateName(@Param('slug') slug: string, @Body('name') name: string) {
    return this.writerRepo.updateName(slug, name);
  }

  @Delete(':slug')
  delete(@Param('slug') slug: string) {
    return this.writerRepo.delete(slug);
  }
}
