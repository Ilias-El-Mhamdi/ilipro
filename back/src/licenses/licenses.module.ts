import { Module } from '@nestjs/common';
import { LicensesController } from './presentation/licenses.controller';
import { LicensesService } from './application/licenses.service';
import { LicenseRepository } from './domain/license.repository';
import { PrismaLicenseRepository } from './infrastructure/prisma-license.repository';

@Module({
  controllers: [LicensesController],
  providers: [
    LicensesService,
    { provide: LicenseRepository, useClass: PrismaLicenseRepository },
  ],
  exports: [LicensesService],
})
export class LicensesModule {}
