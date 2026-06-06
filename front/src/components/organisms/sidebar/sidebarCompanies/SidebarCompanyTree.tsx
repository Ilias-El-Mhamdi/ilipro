import {Link} from 'react-router-dom';
import type {Company, Project} from '../../../../lib/queries.ts';
import {CompanyRow} from './CompanyRow.tsx';

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

            {companies.map((company) => (
                <CompanyRow
                    key={company.id}
                    company={company}
                    projects={projectsByCompany.get(company.id) ?? []}
                    isOpen={openCompanies.has(company.id)}
                    isActive={activeCompanySlug === company.slug}
                    activeProjectHash={activeProjectHash}
                    onToggle={() => toggleCompany(company.id)}
                    onNavigate={navigate}
                />
            ))}
        </div>
    );
}
