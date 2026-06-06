import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './presentation/projects.controller';
import { ProjectsUc } from './useCase/projects.uc';
import { IProjectRepository } from './domain/project.repository';
import { TypeOrmProjectRepository } from './infrastructure/typeorm-project.repository';
import { ProjectModel } from './domain/project.model';
import { CompanyProjectsController } from '../companies/presentation/company-projects.controller';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectModel]), forwardRef(() => CompaniesModule)],
  controllers: [ProjectsController, CompanyProjectsController],
  providers: [
    ProjectsUc,
    { provide: IProjectRepository, useClass: TypeOrmProjectRepository },
  ],
  exports: [ProjectsUc, IProjectRepository],
})
export class ProjectsModule {}
