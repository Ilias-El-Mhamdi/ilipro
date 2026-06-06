import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CompaniesModule } from './companies/companies.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { DeliverablesModule } from './deliverables/deliverables.module';
import { StorageModule } from './storage/storage.module';
import { LicensesModule } from './licenses/licenses.module';
import { StripeModule } from './stripe/stripe.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CompaniesModule,
    ProjectsModule,
    UsersModule,
    DeliverablesModule,
    StorageModule,
    LicensesModule,
    StripeModule,
    AuthModule,
  ],
})
export class AppModule {}
