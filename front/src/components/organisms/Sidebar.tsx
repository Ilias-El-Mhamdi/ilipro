import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCompanies, useProjects, useClients } from '../../lib/queries';

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3 h-3 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function Sidebar() {
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

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 shrink-0">
        <Link to="/admin/companies" className="text-white font-bold text-xl block mb-4">
          ilipro
        </Link>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {query && (
          <div className="mt-2 bg-gray-800 border border-gray-700 rounded-md overflow-hidden max-h-64 overflow-y-auto">
            {!hasResults ? (
              <p className="text-gray-500 text-xs px-3 py-2">Aucun résultat</p>
            ) : (
              <>
                {searchResults.companies.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs px-3 pt-2 pb-1 uppercase tracking-wide">Entreprises</p>
                    {searchResults.companies.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { navigate(`/admin/companies/${c.slug}`); setQuery(''); }}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.projects.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs px-3 pt-2 pb-1 uppercase tracking-wide">Projets</p>
                    {searchResults.projects.map((p) => {
                      const companyName = companies.find((c) => c.id === p.companyId)?.name ?? '';
                      return (
                        <button
                          key={p.id}
                          onClick={() => { navigate(`/admin/companies/${companySlugById(p.companyId)}`); setQuery(''); }}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer flex items-center gap-1.5 min-w-0"
                        >
                          <span className="shrink-0">{p.name}</span>
                          <span className="text-gray-500 truncate">— {companyName}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {searchResults.clients.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs px-3 pt-2 pb-1 uppercase tracking-wide">Utilisateurs</p>
                    {searchResults.clients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { navigate(`/admin/users/${c.slug}`); setQuery(''); }}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
                      >
                        {c.firstName} {c.lastName}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {/* Utilisateurs section */}
        <Link
          to="/admin/users"
          className={`text-xs uppercase tracking-wide px-2 mb-2 block transition-colors ${
            isUsersActive ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Utilisateurs
        </Link>
        <div className="mb-4">
          {clients.length === 0 ? (
            <p className="text-gray-600 text-xs px-2">Aucun utilisateur</p>
          ) : (
            clients.slice(0, 5).map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/admin/users/${c.slug}`)}
                className={`w-full text-left py-1.5 px-2 text-sm truncate rounded-md cursor-pointer transition-colors ${
                  location.pathname === `/admin/users/${c.slug}`
                    ? 'text-white bg-indigo-900/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {c.firstName} {c.lastName}
              </button>
            ))
          )}
          {clients.length > 5 && (
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full text-left py-1 px-2 text-xs text-gray-600 hover:text-gray-400 cursor-pointer"
            >
              + {clients.length - 5} autres
            </button>
          )}
        </div>

        {/* Entreprises section */}
        <Link
          to="/admin/companies"
          className={`text-xs uppercase tracking-wide px-2 mb-2 block transition-colors ${
            isCompaniesActive ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Entreprises
        </Link>
        {companies.length === 0 && (
          <p className="text-gray-600 text-xs px-2">Aucune entreprise</p>
        )}
        {companies.map((company) => {
          const companyProjects = projectsByCompany.get(company.id) ?? [];
          const isOpen = openCompanies.has(company.id);
          const isActive = activeCompanySlug === company.slug;

          return (
            <div key={company.id}>
              <div className={`flex items-center gap-1 rounded-md group ${isActive ? 'bg-indigo-900/40' : ''}`}>
                <button
                  onClick={() => toggleCompany(company.id)}
                  className="p-1 text-gray-500 hover:text-gray-300 cursor-pointer"
                >
                  {companyProjects.length > 0
                    ? <ChevronIcon open={isOpen} />
                    : <span className="w-3 h-3 block" />
                  }
                </button>
                <button
                  onClick={() => navigate(`/admin/companies/${company.slug}`)}
                  className={`flex-1 text-left py-1.5 text-sm truncate cursor-pointer ${isActive ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
                >
                  {company.name}
                </button>
              </div>

              {isOpen && companyProjects.map((project) => {
                const isProjectActive = isActive && activeProjectHash === `#project-${project.slug}`;
                return (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/admin/companies/${company.slug}#project-${project.slug}`)}
                    className={`ml-6 w-full text-left py-1 px-2 text-sm transition-colors truncate block cursor-pointer ${
                      isProjectActive ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {project.name}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
