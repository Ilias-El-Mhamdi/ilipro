import type {Company, Project, User} from '../../../../lib/queries.ts';
import {SearchResultSection} from './SearchResultSection.tsx';

interface SearchResults {
    companies: Company[];
    projects: Project[];
    users: User[];
}

interface Props {
    searchResults: SearchResults | null;
    hasResults: boolean | null;
    companies: Company[];
    companySlugById: (id: string) => string;
    onSelect: (path: string) => void;
}

export function SearchDropdown({searchResults, hasResults, companies, companySlugById, onSelect}: Props) {
    return (
        <div className="mt-2 bg-gray-800 border border-gray-700 rounded-md overflow-hidden max-h-64 overflow-y-auto">
            {!hasResults ? (
                <p className="text-gray-500 text-xs px-3 py-2">Aucun résultat</p>
            ) : (
                <>
                    {searchResults!.companies.length > 0 && (
                        <SearchResultSection label="Entreprises">
                            {searchResults!.companies.map((c) => (
                                <CompanyResultItem key={c.id} company={c} onSelect={onSelect}/>
                            ))}
                        </SearchResultSection>
                    )}
                    {searchResults!.projects.length > 0 && (
                        <SearchResultSection label="Projets">
                            {searchResults!.projects.map((p) => (
                                <ProjectResultItem
                                    key={p.id}
                                    project={p}
                                    companyName={companies.find((c) => c.id === p.companyId)?.name ?? ''}
                                    companySlug={companySlugById(p.companyId)}
                                    onSelect={onSelect}
                                />
                            ))}
                        </SearchResultSection>
                    )}
                    {searchResults!.users.length > 0 && (
                        <SearchResultSection label="Utilisateurs">
                            {searchResults!.users.map((u) => (
                                <UserResultItem key={u.id} user={u} onSelect={onSelect}/>
                            ))}
                        </SearchResultSection>
                    )}
                </>
            )}
        </div>
    );
}

function CompanyResultItem({company, onSelect}: { company: Company; onSelect: (path: string) => void }) {
    return (
        <button
            onClick={() => onSelect(`/admin/companies/${company.slug}`)}
            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
        >
            {company.name}
        </button>
    );
}

function ProjectResultItem({project, companyName, companySlug, onSelect}: {
    project: Project;
    companyName: string;
    companySlug: string;
    onSelect: (path: string) => void;
}) {
    return (
        <button
            onClick={() => onSelect(`/admin/companies/${companySlug}`)}
            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer flex items-center gap-1.5 min-w-0"
        >
            <span className="shrink-0">{project.name}</span>
            <span className="text-gray-500 truncate">— {companyName}</span>
        </button>
    );
}

function UserResultItem({user, onSelect}: { user: User; onSelect: (path: string) => void }) {
    return (
        <button
            onClick={() => onSelect(`/admin/users/${user.slug}`)}
            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
        >
            {user.firstName} {user.lastName}
        </button>
    );
}
