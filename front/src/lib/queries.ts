import { useQuery } from '@tanstack/react-query';
import { api } from './api';

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
}

export type LicenseType = 'CLASSIC' | 'FREE' | 'ADMIN';
export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface License {
  id: string;
  clientId: string;
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

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  stripeCustomerId: string | null;
  license?: License | null;
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

export function useClients() {
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients').then((r) => r.data),
  });
}

export function useCompanyProjects(companySlug: string) {
  return useQuery<Project[]>({
    queryKey: ['companies', companySlug, 'projects'],
    queryFn: () => api.get(`/companies/${companySlug}/projects`).then((r) => r.data),
  });
}

export function useCompanyClients(companySlug: string) {
  return useQuery<Client[]>({
    queryKey: ['companies', companySlug, 'clients'],
    queryFn: () => api.get(`/companies/${companySlug}/clients`).then((r) => r.data),
  });
}

export function useClientLicense(clientId: string) {
  return useQuery<License>({
    queryKey: ['clients', clientId, 'license'],
    queryFn: () => api.get(`/licenses/client/${clientId}`).then((r) => r.data),
    retry: false,
  });
}

export function useProjectDeliverables(projectId: string) {
  return useQuery<Deliverable[]>({
    queryKey: ['projects', projectId, 'deliverables'],
    queryFn: () => api.get(`/projects/${projectId}/deliverables`).then((r) => r.data),
  });
}
