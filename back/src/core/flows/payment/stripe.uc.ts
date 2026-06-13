import { Inject, Injectable } from '@nestjs/common';
import { LinkUserUc } from '../linkUser/linkUser.uc';
import { IUserWriterRepo } from '../../repos/user/user.writer.abstract-repo';
import { ILicenseWriterRepo } from '../../repos/license/license.writer.abstract-repo';
import { ILicenseReaderRepo } from '../../repos/license/license.reader.abstract-repo';
import { IPaymentReadRepo, StripeWebhookEvent } from '../../repos/payment/paymentRead.abstract-repo';
import { UserModel } from '../../repos/user/user.entity';

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_end: number;
  items: { data: Array<{ price: { product: string } }> };
  metadata: Record<string, string>;
}

interface StripeInvoice {
  subscription: string | null;
}

export interface SimulateSubscriptionDto {
  email: string;
  name?: string;
  companyId: string;
  currentPeriodEnd?: string;
  stripeProductId?: string;
}

@Injectable()
export class StripeUc {
  constructor(
    private readonly linkUserUc: LinkUserUc,
    @Inject(IUserWriterRepo) private readonly userRepo: IUserWriterRepo,
    @Inject(ILicenseWriterRepo) private readonly licenseWriterRepo: ILicenseWriterRepo,
    @Inject(ILicenseReaderRepo) private readonly licenseReaderRepo: ILicenseReaderRepo,
    @Inject(IPaymentReadRepo) private readonly paymentReadRepo: IPaymentReadRepo,
  ) {}

  async processEvent(event: StripeWebhookEvent): Promise<void> {
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

  async simulateSubscription(dto: SimulateSubscriptionDto) {
    const fakeSubscriptionId = `sub_fake_${Date.now()}`;
    const fakeCustomerId = `cus_fake_${Date.now()}`;
    const periodEnd = dto.currentPeriodEnd ? new Date(dto.currentPeriodEnd) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    let user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      if (dto.companyId) {
        user = await this.linkUserUc.createOrLink(dto.name ?? dto.email, '', dto.email, dto.companyId);
      } else {
        user = await this.userRepo.create(new UserModel(dto.email, dto.name ?? dto.email));
      }
    }

    await this.userRepo.setStripeCustomerId(user.id, fakeCustomerId);

    const existing = dto.companyId ? await this.licenseReaderRepo.findByUserAndCompany(user.id, dto.companyId) : null;
    let license;

    if (existing) {
      license = await this.licenseWriterRepo.update(existing.id, {
        status: 'ACTIVE',
        stripeSubscriptionId: fakeSubscriptionId,
        stripeProductId: dto.stripeProductId ?? 'prod_fake',
        currentPeriodEnd: periodEnd,
      });
    } else {
      license = await this.licenseWriterRepo.create({
        userId: user.id,
        companyId: dto.companyId,
        type: 'CLASSIC',
        status: 'ACTIVE',
        stripeSubscriptionId: fakeSubscriptionId,
        stripeProductId: dto.stripeProductId ?? 'prod_fake',
        currentPeriodEnd: periodEnd,
      });
    }

    return { user, license, simulated: true };
  }

  private async handleSubscriptionCreated(subscription: StripeSubscription) {
    const customer = await this.paymentReadRepo.getCustomer(subscription.customer);

    let user = await this.userRepo.findByEmail(customer.email ?? '');
    if (!user) {
      const companyId = subscription.metadata?.companyId;
      if (!companyId) return;
      user = await this.linkUserUc.createOrLink(customer.name ?? customer.email ?? 'Unknown', '', customer.email ?? '', companyId);
    }

    await this.userRepo.setStripeCustomerId(user.id, subscription.customer);

    const companyId = subscription.metadata?.companyId;
    if (!companyId) return;

    const item = subscription.items.data[0];
    const existing = await this.licenseReaderRepo.findByUserAndCompany(user.id, companyId);

    if (existing) {
      await this.licenseWriterRepo.update(existing.id, {
        status: 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        stripeProductId: item?.price.product,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    } else {
      await this.licenseWriterRepo.create({
        userId: user.id,
        companyId,
        type: 'CLASSIC',
        status: 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        stripeProductId: item?.price.product,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    }
  }

  private async handleSubscriptionUpdated(subscription: StripeSubscription) {
    const license = await this.licenseReaderRepo.findByStripeSubscriptionId(subscription.id);
    if (!license) return;
    await this.licenseWriterRepo.update(license.id, {
      status: subscription.status === 'active' ? 'ACTIVE' : 'EXPIRED',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }

  private async handleSubscriptionDeleted(subscription: StripeSubscription) {
    const license = await this.licenseReaderRepo.findByStripeSubscriptionId(subscription.id);
    if (!license) return;
    await this.licenseWriterRepo.update(license.id, { status: 'CANCELLED' });
  }

  private async handlePaymentFailed(invoice: StripeInvoice) {
    if (!invoice.subscription) return;
    const license = await this.licenseReaderRepo.findByStripeSubscriptionId(invoice.subscription);
    if (!license) return;
    await this.licenseWriterRepo.update(license.id, { status: 'EXPIRED' });
  }
}
