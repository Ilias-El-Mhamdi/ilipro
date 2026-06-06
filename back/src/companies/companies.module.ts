import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './presentation/companies.controller';
import { CompaniesUc } from './useCase/companies.uc';
import { ICompanyRepository } from './domain/company.abstract-repository';
import { CompanyRepository } from './infrastructure/company.repository';
import { CompanyModel } from './domain/company.model';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyModel]), forwardRef(() => ProjectsModule)],
  controllers: [CompaniesController],
  providers: [CompaniesUc, { provide: ICompanyRepository, useClass: CompanyRepository }],
  exports: [CompaniesUc, ICompanyRepository],
})
export class CompaniesModule {}
