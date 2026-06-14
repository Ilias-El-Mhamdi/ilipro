import type { LicenseEntity } from './license.entity';

export abstract class ILicenseReaderRepo {
  abstract findByUserId(userId: string): Promise<LicenseEntity>;
  abstract findByUserAndCompany(userId: string, companyId: string): Promise<LicenseEntity | null>;
  abstract findByStripeSubscriptionId(subscriptionId: string): Promise<LicenseEntity | null>;
}
