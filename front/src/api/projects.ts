import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

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

export interface Deliverable {
    id: string;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    projectId: string;
    createdAt: string;
}

export function useProjects() {
    return useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: () => api.get('/projects').then((r) => r.data),
    });
}

export function useProjectDeliverables(projectId: string) {
    return useQuery<Deliverable[]>({
        queryKey: ['projects', projectId, 'deliverables'],
        queryFn: () => api.get(`/projects/${projectId}/deliverables`).then((r) => r.data),
    });
}
