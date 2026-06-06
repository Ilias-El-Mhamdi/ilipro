import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useCompanies, useCompanyProjects, useCompanyClients, useClients } from '../lib/queries';
import { useRenameCompany } from './companyDetail/useRenameCompany';
import { useManageProjects } from './companyDetail/useManageProjects';
import { useManageClients } from './companyDetail/useManageClients';
import { useLinkClient } from './companyDetail/useLinkClient';

export function useCompanyDetail() {
  const { companySlug } = useParams<{ companySlug: string }>();
  const { hash } = useLocation();

  const { data: companies = [] } = useCompanies();
  const { data: projects = [], isLoading: projectsLoading } = useCompanyProjects(companySlug!);
  const { data: clients = [], isLoading: clientsLoading } = useCompanyClients(companySlug!);
  const { data: allClients = [] } = useClients();

  const company = companies.find((c) => c.slug === companySlug);

  useEffect(() => {
    if (!hash || projectsLoading) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, projectsLoading, projects]);

  const rename = useRenameCompany(companySlug!);
  const manageProjects = useManageProjects(companySlug!);
  const manageClients = useManageClients(companySlug!);
  const linkClient = useLinkClient(companySlug!, clients, allClients);

  return {
    companySlug: companySlug!,
    company,
    projects,
    projectsLoading,
    clients,
    clientsLoading,
    rename,
    manageProjects,
    manageClients,
    linkClient,
  };
}
