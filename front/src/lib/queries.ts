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
  companyId: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  projectId: string;
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

export function useProjectClients(projectId: string) {
  return useQuery<Client[]>({
    queryKey: ['projects', projectId, 'clients'],
    queryFn: () => api.get(`/projects/${projectId}/clients`).then((r) => r.data),
  });
}

export function useProjectDeliverables(projectId: string) {
  return useQuery<Deliverable[]>({
    queryKey: ['projects', projectId, 'deliverables'],
    queryFn: () => api.get(`/projects/${projectId}/deliverables`).then((r) => r.data),
  });
}
