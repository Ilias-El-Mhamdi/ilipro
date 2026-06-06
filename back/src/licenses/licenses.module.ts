import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicensesController } from './presentation/licenses.controller';
import { ILicenseRepository } from './domain/license.abstract-repository';
import { TypeOrmLicenseRepository } from './infrastructure/typeorm-license.repository';
import { LicenseModel } from './domain/license.model';
import { LicenseMachineModel } from './domain/license-machine.model';
import { LicenseProjectModel } from './domain/license-project.model';

@Module({
  imports: [TypeOrmModule.forFeature([LicenseModel, LicenseProjectModel, LicenseMachineModel])],
  controllers: [LicensesController],
  providers: [{ provide: ILicenseRepository, useClass: TypeOrmLicenseRepository }],
  exports: [ILicenseRepository],
})
export class LicensesModule {}
