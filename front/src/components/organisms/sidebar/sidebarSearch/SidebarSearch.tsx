import type {Company, Project, User} from '../../../../lib/queries.ts';
import {SearchInput} from './SearchInput.tsx';
import {SearchDropdown} from './SearchDropdown.tsx';

interface SearchResults {
    companies: Company[];
    projects: Project[];
    users: User[];
}

interface Props {
    query: string;
    onChange: (q: string) => void;
    searchResults: SearchResults | null;
    hasResults: boolean | null;
    companies: Company[];
    companySlugById: (id: string) => string;
    onSelect: (path: string) => void;
}

export function SidebarSearch({query, onChange, searchResults, hasResults, companies, companySlugById, onSelect}: Props) {
    return (
        <div className="relative">
            <SearchInput value={query} onChange={onChange}/>
            {query && (
                <SearchDropdown
                    searchResults={searchResults}
                    hasResults={hasResults}
                    companies={companies}
                    companySlugById={companySlugById}
                    onSelect={onSelect}
                />
            )}
        </div>
    );
}
