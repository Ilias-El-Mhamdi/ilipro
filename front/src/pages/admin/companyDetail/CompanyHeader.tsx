import { useCompanies } from '../../../lib/queries';
import { useRenameCompany } from './useRenameCompany';

interface Props {
  companySlug: string;
}

export function CompanyHeader({ companySlug }: Props) {
  const { data: companies = [] } = useCompanies();
  const company = companies.find((c) => c.slug === companySlug);
  const rename = useRenameCompany(companySlug);

  return (
    <div className="flex items-center justify-between mb-8">
      {rename.editing ? (
        <form
          onSubmit={(e) => { e.preventDefault(); if (rename.draft.trim()) rename.mutation.mutate(rename.draft.trim()); }}
          className="flex items-center gap-2"
        >
          <input
            autoFocus
            value={rename.draft}
            onChange={(e) => rename.setDraft(e.target.value)}
            onBlur={() => rename.setEditing(false)}
            onKeyDown={(e) => e.key === 'Escape' && rename.setEditing(false)}
            className="text-2xl font-bold bg-transparent border-b border-indigo-500 outline-none text-white"
          />
        </form>
      ) : (
        <button
          className="group flex items-center gap-2 cursor-pointer"
          onClick={() => { rename.setDraft(company?.name ?? ''); rename.setEditing(true); }}
          title="Cliquer pour renommer"
        >
          <h1 className="text-2xl font-bold group-hover:text-indigo-300 transition-colors">
            {company?.name ?? '...'}
          </h1>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      )}
    </div>
  );
}
