import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Project } from './projects';
import type { User } from './users';

export interface Company {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
}

export function useCompanies() {
    return useQuery<Company[]>({
        queryKey: ['companies'],
        queryFn: () => api.get('/companies').then((r) => r.data),
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
