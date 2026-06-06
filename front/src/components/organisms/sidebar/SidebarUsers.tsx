import { Link } from 'react-router-dom';
import type { Client } from '../../../lib/queries';

interface Props {
  clients: Client[];
  isUsersActive: boolean;
  activePath: string;
  navigate: (to: string) => void;
}

export function SidebarUsers({ clients, isUsersActive, activePath, navigate }: Props) {
  return (
    <div className="mb-4">
      <Link
        to="/admin/users"
        className={`text-xs uppercase tracking-wide px-2 mb-2 block transition-colors ${
          isUsersActive ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        Utilisateurs
      </Link>

      {clients.length === 0 ? (
        <p className="text-gray-600 text-xs px-2">Aucun utilisateur</p>
      ) : (
        clients.slice(0, 5).map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/admin/users/${c.slug}`)}
            className={`w-full text-left py-1.5 px-2 text-sm truncate rounded-md cursor-pointer transition-colors ${
              activePath === `/admin/users/${c.slug}`
                ? 'text-white bg-indigo-900/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {c.firstName} {c.lastName}
          </button>
        ))
      )}
      {clients.length > 5 && (
        <button
          onClick={() => navigate('/admin/users')}
          className="w-full text-left py-1 px-2 text-xs text-gray-600 hover:text-gray-400 cursor-pointer"
        >
          + {clients.length - 5} autres
        </button>
      )}
    </div>
  );
}
