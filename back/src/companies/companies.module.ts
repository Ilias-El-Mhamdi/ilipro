import { Module, forwardRef } from '@nestjs/common';
import { CompaniesController } from './presentation/companies.controller';
import { CompaniesService } from './application/companies.service';
import { CompanyRepository } from './domain/company.repository';
import { PrismaCompanyRepository } from './infrastructure/prisma-company.repository';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [forwardRef(() => ProjectsModule)],
  controllers: [CompaniesController],
  providers: [
    CompaniesService,
    { provide: CompanyRepository, useClass: PrismaCompanyRepository },
  ],
  exports: [CompaniesService],
})
export class CompaniesModule {}
