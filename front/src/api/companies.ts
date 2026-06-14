import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ListCompaniesRequest } from 'platform/contracts/adminDashboard/companies/listCompanies/listCompanies.request';
import { ListCompanyProjectsRequest } from 'platform/contracts/adminDashboard/companyProjects/listCompanyProjects/listCompanyProjects.request';
import { ListCompanyUsersRequest } from 'platform/contracts/adminDashboard/linkUser/listCompanyUsers/listCompanyUsers.request';
import { Company } from 'platform/contracts/shared/company';
import { Project } from 'platform/contracts/shared/project';
import { CompanyUser } from 'platform/contracts/adminDashboard/linkUser/listCompanyUsers/listCompanyUsers.response';

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: () =>
      api
        .get(ListCompaniesRequest.buildUrl())
        .then((r) => Company.fromJsonList(r.data)),
  });
}

export function useCompanyProjects(companySlug: string) {
  return useQuery<Project[]>({
    queryKey: ['companies', companySlug, 'projects'],
    queryFn: () =>
      api
        .get(ListCompanyProjectsRequest.buildUrl(companySlug))
        .then((r) => Project.fromJsonList(r.data)),
  });
}

export function useCompanyUsers(companySlug: string) {
  return useQuery<CompanyUser[]>({
    queryKey: ['companies', companySlug, 'users'],
    queryFn: () =>
      api
        .get(ListCompanyUsersRequest.buildUrl(companySlug))
        .then((r) => CompanyUser.fromJsonList(r.data)),
  });
}
