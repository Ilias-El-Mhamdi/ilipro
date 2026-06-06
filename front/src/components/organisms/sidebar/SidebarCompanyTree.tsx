import { Link } from 'react-router-dom';
import type { Company, Project } from '../../../lib/queries';

interface Props {
  companies: Company[];
  projectsByCompany: Map<string, Project[]>;
  openCompanies: Set<string>;
  toggleCompany: (id: string) => void;
  activeCompanySlug: string | undefined;
  activeProjectHash: string;
  isCompaniesActive: boolean;
  navigate: (to: string) => void;
}

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

export function SidebarCompanyTree({
  companies,
  projectsByCompany,
  openCompanies,
  toggleCompany,
  activeCompanySlug,
  activeProjectHash,
  isCompaniesActive,
  navigate,
}: Props) {
  return (
    <div>
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
                className={`flex-1 text-left py-1.5 text-sm truncate cursor-pointer ${
                  isActive ? 'text-white font-medium' : 'text-gray-300 hover:text-white'
                }`}
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
    </div>
  );
}
