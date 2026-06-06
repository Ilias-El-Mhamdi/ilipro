export type LicenseType = 'CLASSIC' | 'FREE' | 'ADMIN';
export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export class LicenseMachineModel {
  id: string;
  licenseId: string;
  machineId: string;
  label: string | null;
  activatedAt: Date;
  lastSeenAt: Date | null;
}

export class LicenseProjectModel {
  id: string;
  licenseId: string;
  projectId: string;
}

export class LicenseModel {
  id: string;
  clientId: string;
  companyId: string;
  type: LicenseType;
  status: LicenseStatus;
  projectAccess: LicenseProjectModel[];
  machineLock: boolean;
  maxMachines: number;
  machines: LicenseMachineModel[];
  stripeSubscriptionId: string | null;
  stripeProductId: string | null;
  priceLabel: string | null;
  currentPeriodEnd: Date | null;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
