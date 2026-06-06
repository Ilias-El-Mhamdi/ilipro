import type { User } from '../../../lib/queries';
import { Button } from '../../../components/atoms/Button';
import { initials } from '../../../lib/utils';

interface Props {
  users: User[];
  onNavigate: (slug: string) => void;
  onDelete: (e: React.MouseEvent, user: User) => void;
}

export function UsersTable({ users, onNavigate, onDelete }: Props) {
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-900 text-gray-400">
          <tr>
            <th className="text-left px-4 py-3">Utilisateur</th>
            <th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">Créé le</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              onClick={() => onNavigate(u.slug)}
              className="border-t border-gray-800 hover:bg-gray-900/50 cursor-pointer"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials(u.firstName, u.lastName)}
                  </div>
                  <span className="text-white font-medium">{u.firstName} {u.lastName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-400">{u.email}</td>
              <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-end">
                  <Button variant="danger" onClick={(e) => onDelete(e, u)}>Supprimer</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
