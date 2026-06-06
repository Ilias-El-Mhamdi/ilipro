import {Link} from 'react-router-dom';
import {useSidebar} from '../../../hooks/useSidebar';
import {SidebarUsers} from './sidebarUsers/SidebarUsers';
import {SidebarCompanyTree} from './sidebarCompanies/SidebarCompanyTree.tsx';
import {SidebarSearch} from "./sidebarSearch/SidebarSearch.tsx";
import {useAuth} from '../../../contexts/AuthContext';
import {toast} from 'sonner';

export function Sidebar() {
    const {
        query, setQuery,
        openCompanies,
        toggleCompany,
        companies,
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
    } = useSidebar();

    const {user, logout} = useAuth();

    async function handleLogout() {
        await logout();
        toast.success('Déconnecté');
        navigate('/login');
    }

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '';

    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
            <div className="p-4 border-b border-gray-800 shrink-0">
                <Link to="/admin/companies" className="text-white font-bold text-xl block mb-1">
                    ilipro
                </Link>
                {user && (
                    <div className="mb-4">
                        <p className="text-gray-500 text-xs truncate">{displayName}</p>
                        <button
                            onClick={() => { navigator.clipboard.writeText(user.email); toast.success('Email copié'); }}
                            className="flex items-center gap-1 text-gray-600 text-xs hover:text-gray-400 transition-colors cursor-pointer group"
                            title="Copier l'email"
                        >
                            <span className="truncate">{user.email}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                        </button>
                    </div>
                )}
                <SidebarSearch
                    query={query}
                    onChange={setQuery}
                    searchResults={searchResults}
                    hasResults={hasResults}
                    companies={companies}
                    companySlugById={companySlugById}
                    onSelect={(path) => {
                        navigate(path);
                        setQuery('');
                    }}
                />
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
                <SidebarUsers
                    users={users}
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

            <div className="p-3 border-t border-gray-800 shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full text-left text-gray-500 text-sm px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-gray-300 transition-colors"
                >
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}
