import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCompanies, useProjects, useClients } from '../lib/queries';

export function useSidebar() {
  const [query, setQuery] = useState('');
  const [openCompanies, setOpenCompanies] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();

  useEffect(() => {
    if (companies.length > 0)
      setOpenCompanies(new Set(companies.map((c) => c.id)));
  }, [companies]);

  const projectsByCompany = useMemo(() => {
    const map = new Map<string, typeof projects>();
    for (const p of projects) {
      if (!map.has(p.companyId)) map.set(p.companyId, []);
      map.get(p.companyId)!.push(p);
    }
    return map;
  }, [projects]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return {
      companies: companies.filter((c) => c.name.toLowerCase().includes(q)),
      projects: projects.filter((p) => p.name.toLowerCase().includes(q)),
      clients: clients.filter((c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      ),
    };
  }, [query, companies, projects, clients]);

  const hasResults =
    searchResults &&
    (searchResults.companies.length > 0 ||
      searchResults.projects.length > 0 ||
      searchResults.clients.length > 0);

  function companySlugById(id: string) {
    return companies.find((c) => c.id === id)?.slug ?? id;
  }

  function toggleCompany(id: string) {
    setOpenCompanies((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const activeCompanySlug = location.pathname.match(/\/admin\/companies\/([^/]+)/)?.[1];
  const activeProjectHash = location.hash;
  const isUsersActive = location.pathname.startsWith('/admin/users');
  const isCompaniesActive = location.pathname.startsWith('/admin/companies');

  return {
    query, setQuery,
    openCompanies,
    toggleCompany,
    companies,
    projects,
    clients,
    projectsByCompany,
    searchResults,
    hasResults,
    companySlugById,
    navigate,
    location,
    activeCompanySlug,
    activeProjectHash,
    isUsersActive,
    isCompaniesActive,
  };
}
