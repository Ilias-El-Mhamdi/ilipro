import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../../contexts/AuthContext';
import { useUserSidebar } from '../../../../hooks/useUserSidebar';
import { VersionBadge } from '../../../atoms/VersionBadge';
import type { UserCompanySection } from '../../../../lib/queries';

export function UserSidebar() {
  const { user, logout } = useAuth();
  const { companies, openCompanies, toggleCompany, scrollToProject } = useUserSidebar();
  const navigate = useNavigate();

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '';

  async function handleLogout() {
    await logout();
    toast.success('Déconnecté');
    navigate('/login');
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 shrink-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-white font-bold text-xl">ilipro</span>
          <VersionBadge />
        </div>
        {user && (
          <div className="mt-1">
            <p className="text-gray-400 text-sm font-medium truncate">{displayName}</p>
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
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <p className="text-xs uppercase tracking-wide px-2 mb-2 text-gray-500">Mes entreprises</p>
        {companies.length === 0 && (
          <p className="text-gray-600 text-xs px-2">Aucune entreprise</p>
        )}
        {companies.map((company) => (
          <CompanyEntry
            key={company.id}
            company={company}
            isOpen={openCompanies.has(company.id)}
            onToggle={() => toggleCompany(company.id)}
            onScrollToProject={scrollToProject}
          />
        ))}
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

function CompanyEntry({
  company,
  isOpen,
  onToggle,
  onScrollToProject,
}: {
  company: UserCompanySection;
  isOpen: boolean;
  onToggle: () => void;
  onScrollToProject: (id: string) => void;
}) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-gray-800 transition-colors group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3 h-3 text-gray-500 transition-transform shrink-0 ${isOpen ? 'rotate-90' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-sm text-gray-300 truncate">{company.name}</span>
      </button>

      {isOpen && company.projects.length > 0 && (
        <div className="ml-5 mt-0.5">
          {company.projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onScrollToProject(project.id)}
              className="w-full text-left text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded-md hover:bg-gray-800 transition-colors truncate block"
            >
              {project.name}
            </button>
          ))}
        </div>
      )}

      {isOpen && company.projects.length === 0 && (
        <p className="ml-5 text-xs text-gray-700 px-2 py-1">Aucun projet</p>
      )}
    </div>
  );
}
