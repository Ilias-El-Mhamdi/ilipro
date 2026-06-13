import type { LicenseModel } from './license.entity';

export abstract class ILicenseReaderRepo {
  abstract findByUserId(userId: string): Promise<LicenseModel>;
  abstract findByUserAndCompany(userId: string, companyId: string): Promise<LicenseModel | null>;
  abstract findByStripeSubscriptionId(subscriptionId: string): Promise<LicenseModel | null>;
}
