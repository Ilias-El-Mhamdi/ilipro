import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { License } from './licenses';
import type { Project } from './projects';

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

export interface CompanyMember {
    id: string;
    firstName: string;
    lastName: string;
    license: License | null;
}

export interface UserCompanySection {
    id: string;
    name: string;
    slug: string;
    license: License | null;
    projects: Project[];
    members: CompanyMember[];
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
