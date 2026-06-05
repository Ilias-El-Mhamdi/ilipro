import { Module } from '@nestjs/common';
import { StripeController } from './presentation/stripe.controller';
import { ClientsModule } from '../clients/clients.module';
import { LicensesModule } from '../licenses/licenses.module';

@Module({
  imports: [ClientsModule, LicensesModule],
  controllers: [StripeController],
})
export class StripeModule {}
