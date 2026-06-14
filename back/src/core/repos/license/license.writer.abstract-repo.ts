import type { LicenseEntity, LicenseType, LicenseStatus } from './license.entity';

export interface CreateLicenseInput {
  userId: string;
  companyId: string;
  type: LicenseType;
  status: LicenseStatus;
  projectIds?: string[];
  machineLock?: boolean;
  maxMachines?: number;
  validUntil?: Date;
  stripeSubscriptionId?: string;
  stripeProductId?: string;
  priceLabel?: string;
  currentPeriodEnd?: Date;
}

export interface UpdateLicenseInput {
  type?: LicenseType;
  status?: LicenseStatus;
  projectIds?: string[];
  machineLock?: boolean;
  maxMachines?: number;
  validUntil?: Date | null;
  stripeSubscriptionId?: string | null;
  stripeProductId?: string | null;
  priceLabel?: string | null;
  currentPeriodEnd?: Date | null;
}

export abstract class ILicenseWriterRepo {
  abstract create(input: CreateLicenseInput): Promise<LicenseEntity>;
  abstract update(id: string, input: UpdateLicenseInput): Promise<LicenseEntity>;
  abstract delete(id: string): Promise<void>;
  abstract removeMachine(licenseId: string, machineId: string): Promise<void>;
  abstract activate(licenseKey: string, machineId: string, label?: string): Promise<{ valid: true }>;
}
