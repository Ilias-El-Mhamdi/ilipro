import type { Client } from '../../../lib/queries';
import { LicenseBadge } from '../../atoms/LicenseBadge';
import { EmptyText } from '../../atoms/EmptyText';
import { initials, scrollAndHighlight } from '../../../lib/utils';

interface Props {
  clients: Client[];
}

export function ProjectAccessSection({ clients }: Props) {
  return (
    <div className="p-4">
      <span className="text-xs text-gray-500 uppercase tracking-wide block mb-3">
        Accès ({clients.length})
      </span>
      {clients.length === 0 ? (
        <EmptyText message="Aucun client" className="text-gray-600 text-sm" />
      ) : (
        <div className="flex flex-col gap-1.5">
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => scrollAndHighlight(c.id)}
              className="w-full flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-gray-800/60 transition-colors cursor-pointer text-left"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials(c.firstName, c.lastName)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs text-gray-300">{c.firstName} {c.lastName}</span>
                <span className="text-xs text-gray-600 ml-1.5">{c.email}</span>
              </div>
              {c.license?.type && <LicenseBadge type={c.license.type} className="shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
