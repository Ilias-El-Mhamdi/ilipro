import type { Client } from '../../../lib/queries';
import { initials } from '../../../lib/utils';

interface Props {
  client: Client;
  onEditClick: () => void;
  onCopyEmail: () => void;
  copied: boolean;
}

export function UserCardHeader({ client, onEditClick, onCopyEmail, copied }: Props) {
  return (
    <div className="bg-indigo-900/40 border-b border-indigo-800/40 px-3 py-3 flex items-center gap-2.5 shrink-0">
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {initials(client.firstName, client.lastName)}
      </div>
      <div className="min-w-0 flex-1">
        <button onClick={onEditClick} className="group/name flex items-center gap-1.5 cursor-pointer text-left" title="Modifier">
          <p className="text-white font-semibold text-sm truncate leading-tight group-hover/name:text-indigo-300 transition-colors">
            {client.firstName} {client.lastName}
          </p>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0 text-gray-600 group-hover/name:text-indigo-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <div className="flex items-center gap-1 group/email">
          <button onClick={onCopyEmail} className="text-indigo-300 text-xs truncate hover:text-indigo-100 transition-colors cursor-pointer text-left">
            {client.email}
          </button>
          <button onClick={onCopyEmail} className="shrink-0 opacity-0 group-hover/email:opacity-100 transition-opacity cursor-pointer text-indigo-400 hover:text-white" title="Copier l'email">
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
