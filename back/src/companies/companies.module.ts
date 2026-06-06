import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './presentation/companies.controller';
import { ICompanyRepository } from './domain/company.abstract-repository';
import { CompanyRepository } from './infrastructure/company.repository';
import { CompanyModel } from './domain/company.model';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyModel]), forwardRef(() => ProjectsModule)],
  controllers: [CompaniesController],
  providers: [{ provide: ICompanyRepository, useClass: CompanyRepository }],
  exports: [ICompanyRepository],
})
export class CompaniesModule {}
