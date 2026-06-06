import { Link } from 'react-router-dom';
import { useSidebar } from '../../../hooks/useSidebar';
import { SidebarSearch } from './SidebarSearch';
import { SidebarUsers } from './SidebarUsers';
import { SidebarCompanyTree } from './SidebarCompanyTree';

export function Sidebar() {
  const {
    query, setQuery,
    openCompanies,
    toggleCompany,
    companies,
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
  } = useSidebar();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 shrink-0">
        <Link to="/admin/companies" className="text-white font-bold text-xl block mb-4">
          ilipro
        </Link>
        <SidebarSearch
          query={query}
          onChange={setQuery}
          searchResults={searchResults}
          hasResults={hasResults}
          companies={companies}
          companySlugById={companySlugById}
          onSelect={(path) => { navigate(path); setQuery(''); }}
        />
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <SidebarUsers
          clients={clients}
          isUsersActive={isUsersActive}
          activePath={location.pathname}
          navigate={navigate}
        />
        <SidebarCompanyTree
          companies={companies}
          projectsByCompany={projectsByCompany}
          openCompanies={openCompanies}
          toggleCompany={toggleCompany}
          activeCompanySlug={activeCompanySlug}
          activeProjectHash={activeProjectHash}
          isCompaniesActive={isCompaniesActive}
          navigate={navigate}
        />
      </nav>
    </aside>
  );
}
