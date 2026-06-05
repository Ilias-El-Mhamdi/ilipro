import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { ProjectsModule } from './projects/projects.module';
import { ClientsModule } from './clients/clients.module';
import { DeliverablesModule } from './deliverables/deliverables.module';
import { StorageModule } from './storage/storage.module';
import { LicensesModule } from './licenses/licenses.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CompaniesModule,
    ProjectsModule,
    ClientsModule,
    DeliverablesModule,
    StorageModule,
    LicensesModule,
    StripeModule,
  ],
})
export class AppModule {}
