import { BadRequestException, Controller, Get, Inject, Req } from '@nestjs/common';
import type { Request } from 'express';
import { IPaymentReadRepo } from '../../../core/repos/payment/paymentRead.abstract-repo';
import { IUserReaderRepo } from '../../../core/repos/user/user.reader.abstract-repo';
import type { JwtPayload } from '../../../core/flows/jwt/jwt-payload';

@Controller('stripe')
export class BillingPortalController {
  constructor(
    @Inject(IPaymentReadRepo) private readonly paymentReadRepo: IPaymentReadRepo,
    @Inject(IUserReaderRepo) private readonly userReader: IUserReaderRepo,
  ) {}

  @Get('billing-portal')
  async getBillingPortal(@Req() req: Request) {
    const caller = req['user'] as JwtPayload;
    const user = await this.userReader.findById(caller.sub);
    if (!user.stripeCustomerId) throw new BadRequestException('User has no Stripe customer ID');
    return this.paymentReadRepo.createPortalSession(user.stripeCustomerId);
  }
}
