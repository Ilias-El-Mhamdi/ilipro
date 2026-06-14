import { BadRequestException, Body, Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import Stripe = require('stripe');
import { Public } from '../../decorators/public.decorator';
import { StripeUc } from '../../../core/flows/payment/stripe.uc';
import type { SimulateSubscriptionDto } from '../../../core/flows/payment/stripe.uc';
import type { StripeWebhookEvent } from '../../../core/repos/payment/paymentRead.abstract-repo';

@Controller('stripe')
export class StripeController {
  constructor(private readonly uc: StripeUc) {}

  @Public()
  @Post('webhook')
  async handleWebhook(@Req() req: Request & { rawBody?: Buffer }, @Headers('stripe-signature') sig: string) {
    let event: StripeWebhookEvent;
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2026-05-27.dahlia' });
      event = stripe.webhooks.constructEvent(req.rawBody!, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }
    await this.uc.processEvent(event);
    return { received: true };
  }

  @Public()
  @Post('dev/simulate')
  simulateSubscription(@Body() dto: SimulateSubscriptionDto) {
    return this.uc.simulateSubscription(dto);
  }
}
