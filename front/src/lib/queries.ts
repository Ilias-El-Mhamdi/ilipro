import {useQuery} from '@tanstack/react-query';
import {api} from './api';

export interface Company {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
}

export interface Project {
    id: string;
    name: string;
    slug: string;
    appUrl: string | null;
    docsUrl: string | null;
    changelogUrl: string | null;
    companyId: string;
    createdAt: string;
}

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

export type LicenseType = 'CLASSIC' | 'FREE' | 'ADMIN';
export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

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

export interface User {
    id: string;
    slug: string;
    firstName: string;
    lastName: string;
    email: string;
    stripeCustomerId: string | null;
    license?: License | null;
    createdAt: string;
}

export interface UserCompanySection {
    id: string;
    name: string;
    slug: string;
    license: License | null;
    projects: Project[];
}

export interface UserDetail {
    id: string;
    slug: string;
    firstName: string;
    lastName: string;
    email: string;
    stripeCustomerId: string | null;
    companies: UserCompanySection[];
    createdAt: string;
}

export interface Deliverable {
    id: string;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    projectId: string;
    createdAt: string;
}

export function useCompanies() {
    return useQuery<Company[]>({
        queryKey: ['companies'],
        queryFn: () => api.get('/companies').then((r) => r.data),
    });
}

export function useProjects() {
    return useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: () => api.get('/projects').then((r) => r.data),
    });
}

export function useUsers() {
    return useQuery<User[]>({
        queryKey: ['users'],
        queryFn: () => api.get('/users').then((r) => r.data),
    });
}

export function useUser(id: string) {
    return useQuery<User>({
        queryKey: ['users', id],
        queryFn: () => api.get(`/users/${id}`).then((r) => r.data),
        enabled: !!id,
    });
}

export function useUserBySlug(slug: string) {
    return useQuery<UserDetail>({
        queryKey: ['users', 'slug', slug],
        queryFn: () => api.get(`/users/slug/${slug}`).then((r) => r.data),
        enabled: !!slug,
    });
}

export function useCompanyProjects(companySlug: string) {
    return useQuery<Project[]>({
        queryKey: ['companies', companySlug, 'projects'],
        queryFn: () => api.get(`/companies/${companySlug}/projects`).then((r) => r.data),
    });
}

export function useCompanyUsers(companySlug: string) {
    return useQuery<User[]>({
        queryKey: ['companies', companySlug, 'users'],
        queryFn: () => api.get(`/companies/${companySlug}/users`).then((r) => r.data),
    });
}

export function useUserLicense(userId: string) {
    return useQuery<License>({
        queryKey: ['users', userId, 'license'],
        queryFn: () => api.get(`/licenses/user/${userId}`).then((r) => r.data),
        retry: false,
    });
}

export function useProjectDeliverables(projectId: string) {
    return useQuery<Deliverable[]>({
        queryKey: ['projects', projectId, 'deliverables'],
        queryFn: () => api.get(`/projects/${projectId}/deliverables`).then((r) => r.data),
    });
}


export function useBackVersion() {
    return useQuery<{ version: string }>({
        queryKey: ['version'],
        queryFn: () => api.get('/version').then((r) => r.data),
        staleTime: Infinity,
    });
}
