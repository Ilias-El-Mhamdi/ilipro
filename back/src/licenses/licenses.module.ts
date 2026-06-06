import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicensesController } from './presentation/licenses.controller';
import { LicensesUc } from './useCase/licenses.uc';
import { ILicenseRepository } from './domain/license.repository';
import { TypeOrmLicenseRepository } from './infrastructure/typeorm-license.repository';
import { LicenseModel, LicenseProjectModel, LicenseMachineModel } from './domain/license.model';

@Module({
  imports: [TypeOrmModule.forFeature([LicenseModel, LicenseProjectModel, LicenseMachineModel])],
  controllers: [LicensesController],
  providers: [
    LicensesUc,
    { provide: ILicenseRepository, useClass: TypeOrmLicenseRepository },
  ],
  exports: [LicensesUc],
})
export class LicensesModule {}
