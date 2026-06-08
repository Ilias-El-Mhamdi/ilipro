import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Project } from './projects';

export type LicenseType = 'CLASSIC' | 'FREE' | 'ADMIN';
export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface LicenseMachine {
    id: string;
    machineId: string;
    label: string | null;
    activatedAt: string;
    lastSeenAt: string | null;
}

export interface LicenseProject {
    id: string;
    licenseId: string;
    projectId: string;
    project?: Project;
}

export interface License {
    id: string;
    userId: string;
    companyId: string;
    type: LicenseType;
    status: LicenseStatus;
    projectAccess: LicenseProject[];
    machineLock: boolean;
    maxMachines: number;
    machines: LicenseMachine[];
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    priceLabel: string | null;
    currentPeriodEnd: string | null;
    validUntil: string | null;
}

export function useUserLicense(userId: string) {
    return useQuery<License>({
        queryKey: ['users', userId, 'license'],
        queryFn: () => api.get(`/licenses/user/${userId}`).then((r) => r.data),
        retry: false,
    });
}
