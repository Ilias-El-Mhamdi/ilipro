import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './presentation/companies.controller';
import { CompaniesService } from './application/companies.service';
import { ICompanyRepository } from './domain/company.repository';
import { TypeOrmCompanyRepository } from './infrastructure/typeorm-company.repository';
import { CompanyModel } from './domain/company.model';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyModel]), forwardRef(() => ProjectsModule)],
  controllers: [CompaniesController],
  providers: [
    CompaniesService,
    { provide: ICompanyRepository, useClass: TypeOrmCompanyRepository },
  ],
  exports: [CompaniesService, ICompanyRepository],
})
export class CompaniesModule {}
