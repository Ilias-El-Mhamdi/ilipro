import { Module } from '@nestjs/common';
import { StripeController } from './presentation/stripe.controller';
import { UsersModule } from '../users/users.module';
import { LicensesModule } from '../licenses/licenses.module';

@Module({
  imports: [UsersModule, LicensesModule],
  controllers: [StripeController],
})
export class StripeModule {}
