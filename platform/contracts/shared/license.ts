import { z } from "zod";

export const LicenseTypeSchema = z.enum(["CLASSIC", "FREE", "ADMIN"]);
export type LicenseType = z.infer<typeof LicenseTypeSchema>;

export const LicenseStatusSchema = z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]);
export type LicenseStatus = z.infer<typeof LicenseStatusSchema>;

export class LicenseMachine {
  static readonly schema = z.object({
    id: z.string(),
    machineId: z.string(),
    label: z.string().nullable(),
    activatedAt: z.string(),
    lastSeenAt: z.string().nullable(),
  });

  declare id: string;
  declare machineId: string;
  declare label: string | null;
  declare activatedAt: string;
  declare lastSeenAt: string | null;

  static fromJson(json: unknown): LicenseMachine {
    return Object.assign(new LicenseMachine(), LicenseMachine.schema.parse(json));
  }

  static fromJsonList(json: unknown): LicenseMachine[] {
    return z
      .array(LicenseMachine.schema)
      .parse(json)
      .map((m) => Object.assign(new LicenseMachine(), m));
  }
}

export class LicenseProject {
  static readonly schema = z.object({
    id: z.string(),
    licenseId: z.string(),
    projectId: z.string(),
  });

  declare id: string;
  declare licenseId: string;
  declare projectId: string;

  static fromJson(json: unknown): LicenseProject {
    return Object.assign(new LicenseProject(), LicenseProject.schema.parse(json));
  }

  static fromJsonList(json: unknown): LicenseProject[] {
    return z
      .array(LicenseProject.schema)
      .parse(json)
      .map((p) => Object.assign(new LicenseProject(), p));
  }
}

export class License {
  static readonly schema = z.object({
    id: z.string(),
    userId: z.string(),
    companyId: z.string(),
    type: LicenseTypeSchema,
    status: LicenseStatusSchema,
    projectAccess: z.array(LicenseProject.schema),
    machineLock: z.boolean(),
    maxMachines: z.number(),
    machines: z.array(LicenseMachine.schema),
    stripeSubscriptionId: z.string().nullable(),
    stripeProductId: z.string().nullable(),
    priceLabel: z.string().nullable(),
    currentPeriodEnd: z.string().nullable(),
    validUntil: z.string().nullable(),
  });

  declare id: string;
  declare userId: string;
  declare companyId: string;
  declare type: LicenseType;
  declare status: LicenseStatus;
  declare projectAccess: LicenseProject[];
  declare machineLock: boolean;
  declare maxMachines: number;
  declare machines: LicenseMachine[];
  declare stripeSubscriptionId: string | null;
  declare stripeProductId: string | null;
  declare priceLabel: string | null;
  declare currentPeriodEnd: string | null;
  declare validUntil: string | null;

  static fromJson(json: unknown): License {
    return Object.assign(new License(), License.schema.parse(json));
  }
}
