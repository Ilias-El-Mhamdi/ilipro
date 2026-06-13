export interface StripeWebhookEvent {
  type: string;
  data: { object: unknown };
}

export interface StripeCustomerData {
  email: string | null;
  name: string | null;
}

export abstract class IPaymentReadRepo {
  abstract getCustomer(customerId: string): Promise<StripeCustomerData>;
  abstract createPortalSession(stripeCustomerId: string): Promise<{ url: string }>;
}
