import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './presentation/projects.controller';
import { ProjectsService } from './application/projects.service';
import { IProjectRepository } from './domain/project.repository';
import { TypeOrmProjectRepository } from './infrastructure/typeorm-project.repository';
import { ProjectModel } from './domain/project.model';
import { CompanyProjectsController } from '../companies/presentation/company-projects.controller';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectModel]), forwardRef(() => CompaniesModule)],
  controllers: [ProjectsController, CompanyProjectsController],
  providers: [
    ProjectsService,
    { provide: IProjectRepository, useClass: TypeOrmProjectRepository },
  ],
  exports: [ProjectsService, IProjectRepository],
})
export class ProjectsModule {}
