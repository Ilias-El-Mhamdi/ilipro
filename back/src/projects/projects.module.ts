import { Module, forwardRef } from '@nestjs/common';
import { ProjectsController } from './presentation/projects.controller';
import { ProjectsService } from './application/projects.service';
import { ProjectRepository } from './domain/project.repository';
import { PrismaProjectRepository } from './infrastructure/prisma-project.repository';
import { CompanyProjectsController } from '../companies/presentation/company-projects.controller';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [forwardRef(() => CompaniesModule)],
  controllers: [ProjectsController, CompanyProjectsController],
  providers: [
    ProjectsService,
    { provide: ProjectRepository, useClass: PrismaProjectRepository },
  ],
  exports: [ProjectsService, ProjectRepository],
})
export class ProjectsModule {}
