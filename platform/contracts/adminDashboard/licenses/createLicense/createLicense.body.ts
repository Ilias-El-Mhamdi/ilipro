import type { LicenseType, LicenseStatus } from "../../../shared/license";

export interface CreateLicenseBody {
  userId: string;
  companyId: string;
  type: LicenseType;
  status?: LicenseStatus;
  projectIds?: string[];
  machineLock?: boolean;
  maxMachines?: number;
  validUntil?: string;
  priceLabel?: string;
}
