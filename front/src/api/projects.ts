import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ListProjectsRequest } from 'platform/contracts/adminDashboard/projects/listProjects/listProjects.request';
import { ListProjectDeliverablesRequest } from 'platform/contracts/adminDashboard/projectDeliverables/listProjectDeliverables/listProjectDeliverables.request';
import { Project } from 'platform/contracts/shared/project';
import { Deliverable } from 'platform/contracts/shared/deliverable';

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () =>
      api
        .get(ListProjectsRequest.buildUrl())
        .then((r) => Project.fromJsonList(r.data)),
  });
}

export function useProjectDeliverables(projectId: string) {
  return useQuery<Deliverable[]>({
    queryKey: ['projects', projectId, 'deliverables'],
    queryFn: () =>
      api
        .get(ListProjectDeliverablesRequest.buildUrl(projectId))
        .then((r) => Deliverable.fromJsonList(r.data)),
  });
}
