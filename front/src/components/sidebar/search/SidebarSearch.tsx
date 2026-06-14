import type { Company } from 'platform/contracts/shared/company';
import type { Project } from 'platform/contracts/shared/project';
import type { User } from 'platform/contracts/shared/user';
import { SearchInput } from './SearchInput';
import { SearchDropdown } from './SearchDropdown';

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

export function SidebarSearch({
  query,
  onChange,
  searchResults,
  hasResults,
  companies,
  companySlugById,
  onSelect,
}: Props) {
  return (
    <div className="relative">
      <SearchInput value={query} onChange={onChange} />
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
