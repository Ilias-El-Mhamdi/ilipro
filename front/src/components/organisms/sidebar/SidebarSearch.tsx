import type { Company, Project, Client } from '../../../lib/queries';

interface SearchResults {
  companies: Company[];
  projects: Project[];
  clients: Client[];
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
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher..."
        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      />
      {query && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
        >
          ✕
        </button>
      )}

      {query && (
        <div className="mt-2 bg-gray-800 border border-gray-700 rounded-md overflow-hidden max-h-64 overflow-y-auto">
          {!hasResults ? (
            <p className="text-gray-500 text-xs px-3 py-2">Aucun résultat</p>
          ) : (
            <>
              {searchResults!.companies.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs px-3 pt-2 pb-1 uppercase tracking-wide">Entreprises</p>
                  {searchResults!.companies.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onSelect(`/admin/companies/${c.slug}`)}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
              {searchResults!.projects.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs px-3 pt-2 pb-1 uppercase tracking-wide">Projets</p>
                  {searchResults!.projects.map((p) => {
                    const companyName = companies.find((c) => c.id === p.companyId)?.name ?? '';
                    return (
                      <button
                        key={p.id}
                        onClick={() => onSelect(`/admin/companies/${companySlugById(p.companyId)}`)}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer flex items-center gap-1.5 min-w-0"
                      >
                        <span className="shrink-0">{p.name}</span>
                        <span className="text-gray-500 truncate">— {companyName}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {searchResults!.clients.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs px-3 pt-2 pb-1 uppercase tracking-wide">Utilisateurs</p>
                  {searchResults!.clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onSelect(`/admin/users/${c.slug}`)}
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
  );
}
