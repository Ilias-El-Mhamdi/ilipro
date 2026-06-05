import { BadRequestException, Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import Stripe = require('stripe');
import { ClientsService } from '../../clients/application/clients.service';
import { LicensesService } from '../../licenses/application/licenses.service';

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_end: number;
  items: { data: Array<{ price: { product: string } }> };
  metadata: Record<string, string>;
}

interface StripeCustomer {
  id: string;
  email: string | null;
  name: string | null;
}

interface StripeInvoice {
  subscription: string | null;
}

interface StripeWebhookEvent {
  type: string;
  data: { object: unknown };
}

interface SimulateSubscriptionDto {
  /** Email du client (match existant ou création) */
  email: string;
  name?: string;
  companyId: string;
  /** Optionnel : date de fin en ISO string, défaut = +1 an */
  currentPeriodEnd?: string;
  /** Optionnel : faux product ID */
  stripeProductId?: string;
}

@Controller('stripe')
export class StripeController {
  private _stripe: InstanceType<typeof Stripe> | null = null;

  constructor(
    private readonly clientsService: ClientsService,
    private readonly licensesService: LicensesService,
  ) {}

  private get stripe(): InstanceType<typeof Stripe> {
    if (!this._stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
      this._stripe = new Stripe(key, { apiVersion: '2026-05-27.dahlia' });
    }
    return this._stripe;
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') sig: string,
  ) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
    let event: StripeWebhookEvent;

    try {
      event = this.stripe.webhooks.constructEvent(req.rawBody!, sig, secret) as StripeWebhookEvent;
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    await this.processEvent(event);
    return { received: true };
  }

  @Post('billing-portal')
  async createBillingPortal(@Body('clientId') clientId: string) {
    const client = await this.clientsService.findById(clientId);
    if (!client.stripeCustomerId) {
      throw new BadRequestException('Client has no Stripe customer ID');
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return { url: `https://billing.stripe.com/dev-placeholder?customer=${client.stripeCustomerId}` };
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: client.stripeCustomerId,
    });

    return { url: session.url };
  }

  /**
   * Dev-only — simule un webhook customer.subscription.created sans Stripe réel.
   * Crée ou met à jour le client et génère une licence CLASSIC.
   */
  @Post('dev/simulate')
  async simulateSubscription(@Body() dto: SimulateSubscriptionDto) {
    const fakeSubscriptionId = `sub_fake_${Date.now()}`;
    const fakeCustomerId = `cus_fake_${Date.now()}`;
    const periodEnd = dto.currentPeriodEnd
      ? new Date(dto.currentPeriodEnd)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    let client = await this.clientsService.findByEmail(dto.email);
    if (!client) {
      client = await this.clientsService.create(
        dto.name ?? dto.email,
        '',
        dto.email,
        dto.companyId,
      );
    }

    await this.clientsService.setStripeCustomerId(client.id, fakeCustomerId);

    const existing = await this.licensesService.findByClientIdOrNull(client.id);
    let license;

    if (existing) {
      license = await this.licensesService.update(existing.id, {
        status: 'ACTIVE',
        stripeSubscriptionId: fakeSubscriptionId,
        stripeProductId: dto.stripeProductId ?? 'prod_fake',
        currentPeriodEnd: periodEnd,
      });
    } else {
      license = await this.licensesService.create({
        clientId: client.id,
        type: 'CLASSIC',
        status: 'ACTIVE',
        stripeSubscriptionId: fakeSubscriptionId,
        stripeProductId: dto.stripeProductId ?? 'prod_fake',
        currentPeriodEnd: periodEnd,
      });
    }

    return { client, license, simulated: true };
  }

  private async processEvent(event: StripeWebhookEvent) {
    const obj = event.data.object;
    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(obj as StripeSubscription);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(obj as StripeSubscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(obj as StripeSubscription);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(obj as StripeInvoice);
        break;
    }
  }

  private async handleSubscriptionCreated(subscription: StripeSubscription) {
    const customerId = subscription.customer;
    const raw = await this.stripe.customers.retrieve(customerId);
    const customer = raw as unknown as StripeCustomer;

    let client = await this.clientsService.findByEmail(customer.email ?? '');
    if (!client) {
      const companyId = subscription.metadata?.companyId;
      if (!companyId) return;
      client = await this.clientsService.create(
        customer.name ?? customer.email ?? 'Unknown',
        '',
        customer.email ?? '',
        companyId,
      );
    }

    await this.clientsService.setStripeCustomerId(client.id, customerId);

    const item = subscription.items.data[0];
    const existing = await this.licensesService.findByClientIdOrNull(client.id);

    if (existing) {
      await this.licensesService.update(existing.id, {
        status: 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        stripeProductId: item?.price.product,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    } else {
      await this.licensesService.create({
        clientId: client.id,
        type: 'CLASSIC',
        status: 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        stripeProductId: item?.price.product,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    }
  }

  private async handleSubscriptionUpdated(subscription: StripeSubscription) {
    const license = await this.licensesService.findByStripeSubscriptionId(subscription.id);
    if (!license) return;

    const status = subscription.status === 'active' ? 'ACTIVE' : 'EXPIRED';
    await this.licensesService.update(license.id, {
      status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }

  private async handleSubscriptionDeleted(subscription: StripeSubscription) {
    const license = await this.licensesService.findByStripeSubscriptionId(subscription.id);
    if (!license) return;
    await this.licensesService.update(license.id, { status: 'CANCELLED' });
  }

  private async handlePaymentFailed(invoice: StripeInvoice) {
    if (!invoice.subscription) return;
    const license = await this.licensesService.findByStripeSubscriptionId(invoice.subscription);
    if (!license) return;
    await this.licensesService.update(license.id, { status: 'EXPIRED' });
  }
}
