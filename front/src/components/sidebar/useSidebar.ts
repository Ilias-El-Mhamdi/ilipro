import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCompanies } from '../../api/companies';
import { useProjects } from '../../api/projects';
import { useUsers } from '../../api/users';

export function useSidebar() {
  const [query, setQuery] = useState('');
  // Companies dépliées par défaut : on ne mémorise que celles repliées explicitement.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useProjects();
  const { data: users = [] } = useUsers();

  const openCompanies = useMemo(
    () => new Set(companies.filter((c) => !collapsed.has(c.id)).map((c) => c.id)),
    [companies, collapsed],
  );

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
      users: users.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      ),
    };
  }, [query, companies, projects, users]);

  const hasResults =
    searchResults &&
    (searchResults.companies.length > 0 ||
      searchResults.projects.length > 0 ||
      searchResults.users.length > 0);

  function companySlugById(id: string) {
    return companies.find((c) => c.id === id)?.slug ?? id;
  }

  function toggleCompany(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const activeCompanySlug = location.pathname.match(
    /\/admin\/companies\/([^/]+)/,
  )?.[1];
  const activeProjectHash = location.hash;
  const isUsersActive = location.pathname.startsWith('/admin/users');
  const isCompaniesActive = location.pathname.startsWith('/admin/companies');

  return {
    query,
    setQuery,
    openCompanies,
    toggleCompany,
    companies,
    projects,
    users,
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
