import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../../core/repos/user/user.entity';
import { IUserReaderRepo } from '../../core/repos/user/user.reader.abstract-repo';
import { IUserWriterRepo } from '../../core/repos/user/user.writer.abstract-repo';
import { UserRepo } from './user/user.repo';

import { CompanyEntity } from '../../core/repos/company/company.entity';
import { ICompanyReaderRepo } from '../../core/repos/company/company.reader.abstract-repo';
import { ICompanyWriterRepo } from '../../core/repos/company/company.writer.abstract-repo';
import { CompanyRepo } from './company/company.repo';

import { ProjectEntity } from '../../core/repos/project/project.entity';
import { IProjectReaderRepo } from '../../core/repos/project/project.reader.abstract-repo';
import { IProjectWriterRepo } from '../../core/repos/project/project.writer.abstract-repo';
import { ProjectRepo } from './project/project.repo';

import { LicenseEntity } from '../../core/repos/license/license.entity';
import { LicenseMachineEntity } from '../../core/repos/license/license-machine.entity';
import { LicenseProjectEntity } from '../../core/repos/license/license-project.entity';
import { ILicenseReaderRepo } from '../../core/repos/license/license.reader.abstract-repo';
import { ILicenseWriterRepo } from '../../core/repos/license/license.writer.abstract-repo';
import { LicenseRepo } from './license/license.repo';

import { UserCompanyEntity } from '../../core/repos/userCompany/user-company.entity';
import { IUserCompanyReaderRepo } from '../../core/repos/userCompany/user-company.reader.abstract-repo';
import { IUserCompanyWriterRepo } from '../../core/repos/userCompany/user-company.writer.abstract-repo';
import { UserCompanyRepo } from './userCompany/user-company.repo';

import { DeliverableEntity } from '../../core/repos/deliverable/deliverable.entity';
import { IDeliverableReaderRepo } from '../../core/repos/deliverable/deliverable.reader.abstract-repo';
import { IDeliverableWriterRepo } from '../../core/repos/deliverable/deliverable.writer.abstract-repo';
import { DeliverableRepo } from './deliverable/deliverable.repo';

import { IStorageRepo } from '../../core/repos/storage/storage.abstract-repo';
import { R2Repo } from './storage/r2.repo';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CompanyEntity,
      ProjectEntity,
      LicenseEntity,
      LicenseMachineEntity,
      LicenseProjectEntity,
      UserCompanyEntity,
      DeliverableEntity,
    ]),
  ],
  providers: [
    UserRepo,
    { provide: IUserReaderRepo, useExisting: UserRepo },
    { provide: IUserWriterRepo, useExisting: UserRepo },

    CompanyRepo,
    { provide: ICompanyReaderRepo, useExisting: CompanyRepo },
    { provide: ICompanyWriterRepo, useExisting: CompanyRepo },

    ProjectRepo,
    { provide: IProjectReaderRepo, useExisting: ProjectRepo },
    { provide: IProjectWriterRepo, useExisting: ProjectRepo },

    LicenseRepo,
    { provide: ILicenseReaderRepo, useExisting: LicenseRepo },
    { provide: ILicenseWriterRepo, useExisting: LicenseRepo },

    UserCompanyRepo,
    { provide: IUserCompanyReaderRepo, useExisting: UserCompanyRepo },
    { provide: IUserCompanyWriterRepo, useExisting: UserCompanyRepo },

    DeliverableRepo,
    { provide: IDeliverableReaderRepo, useExisting: DeliverableRepo },
    { provide: IDeliverableWriterRepo, useExisting: DeliverableRepo },

    R2Repo,
    { provide: IStorageRepo, useExisting: R2Repo },
  ],
  exports: [
    IUserReaderRepo,
    IUserWriterRepo,
    ICompanyReaderRepo,
    ICompanyWriterRepo,
    IProjectReaderRepo,
    IProjectWriterRepo,
    ILicenseReaderRepo,
    ILicenseWriterRepo,
    IUserCompanyReaderRepo,
    IUserCompanyWriterRepo,
    IDeliverableReaderRepo,
    IDeliverableWriterRepo,
    IStorageRepo,
  ],
})
export class RepoModule {}
