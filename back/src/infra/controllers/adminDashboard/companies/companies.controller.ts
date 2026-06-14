import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { ICompanyReaderRepo } from '../../../../core/repos/company/company.reader.abstract-repo';
import { ICompanyWriterRepo } from '../../../../core/repos/company/company.writer.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';
import { CompanyMapper } from '../../../mappers/company.mapper';
import type { CreateCompanyBody } from 'contracts/adminDashboard/companies/createCompany/createCompany.body';
import type { UpdateCompanyBody } from 'contracts/adminDashboard/companies/updateCompany/updateCompany.body';
import type { RenameCompanyBody } from 'contracts/adminDashboard/companies/renameCompany/renameCompany.body';
import { Company } from 'contracts/shared/company';
import { ListCompaniesRequest } from 'contracts/adminDashboard/companies/listCompanies/listCompanies.request';
import { GetCompanyRequest } from 'contracts/adminDashboard/companies/getCompany/getCompany.request';
import { CreateCompanyRequest } from 'contracts/adminDashboard/companies/createCompany/createCompany.request';
import { UpdateCompanyRequest } from 'contracts/adminDashboard/companies/updateCompany/updateCompany.request';
import { RenameCompanyRequest } from 'contracts/adminDashboard/companies/renameCompany/renameCompany.request';
import { DeleteCompanyRequest } from 'contracts/adminDashboard/companies/deleteCompany/deleteCompany.request';

class CreateCompanyDto implements CreateCompanyBody {
  @IsString()
  @MinLength(1)
  name: string;
}

class UpdateCompanyDto implements UpdateCompanyBody {
  @IsString()
  @MinLength(1)
  name: string;
}

class RenameCompanyDto implements RenameCompanyBody {
  @IsString()
  @MinLength(1)
  name: string;
}

@UseGuards(AdminGuard)
@Controller()
export class CompaniesController {
  constructor(
    private readonly readerRepo: ICompanyReaderRepo,
    private readonly writerRepo: ICompanyWriterRepo,
  ) {}

  @Get(ListCompaniesRequest.BASE_URL)
  async findAll(): Promise<Company[]> {
    return CompanyMapper.toResponseList(await this.readerRepo.findAll());
  }

  @Get(GetCompanyRequest.BASE_URL)
  async findBySlug(@Param('slug') slug: string): Promise<Company> {
    return CompanyMapper.toResponse(await this.readerRepo.findBySlug(slug));
  }

  @Post(CreateCompanyRequest.BASE_URL)
  async create(@Body() dto: CreateCompanyDto): Promise<Company> {
    return CompanyMapper.toResponse(await this.writerRepo.create(dto.name));
  }

  @Put(UpdateCompanyRequest.BASE_URL)
  async update(@Param('slug') slug: string, @Body() dto: UpdateCompanyDto): Promise<Company> {
    return CompanyMapper.toResponse(await this.writerRepo.update(slug, dto.name));
  }

  @Patch(RenameCompanyRequest.BASE_URL)
  async updateName(@Param('slug') slug: string, @Body() dto: RenameCompanyDto): Promise<Company> {
    return CompanyMapper.toResponse(await this.writerRepo.updateName(slug, dto.name));
  }

  @Delete(DeleteCompanyRequest.BASE_URL)
  delete(@Param('slug') slug: string): Promise<void> {
    return this.writerRepo.delete(slug);
  }
}
