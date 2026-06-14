import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { IPaymentReadRepo, StripeCustomerData } from '../../../core/repos/payment/paymentRead.abstract-repo';

@Injectable()
export class StripeRepo implements IPaymentReadRepo {
  private _stripe: InstanceType<typeof Stripe> | null = null;

  private get stripe(): InstanceType<typeof Stripe> {
    if (!this._stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
      this._stripe = new Stripe(key, { apiVersion: '2026-05-27.dahlia' });
    }
    return this._stripe;
  }

  async getCustomer(customerId: string): Promise<StripeCustomerData> {
    const raw = await this.stripe.customers.retrieve(customerId);
    const customer = raw as unknown as { email: string | null; name: string | null };
    return { email: customer.email, name: customer.name };
  }

  async createPortalSession(stripeCustomerId: string): Promise<{ url: string }> {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { url: `https://billing.stripe.com/dev-placeholder?customer=${stripeCustomerId}` };
    }
    const session = await this.stripe.billingPortal.sessions.create({ customer: stripeCustomerId });
    return { url: session.url };
  }
}
