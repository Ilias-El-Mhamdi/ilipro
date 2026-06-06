import type { Client } from '../../../lib/queries';
import { Button } from '../../../components/atoms/Button';
import { initials } from '../../../lib/utils';

interface Props {
  clients: Client[];
  onNavigate: (slug: string) => void;
  onDelete: (e: React.MouseEvent, client: Client) => void;
}

export function UsersTable({ clients, onNavigate, onDelete }: Props) {
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
          {clients.map((c) => (
            <tr
              key={c.id}
              onClick={() => onNavigate(c.slug)}
              className="border-t border-gray-800 hover:bg-gray-900/50 cursor-pointer"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials(c.firstName, c.lastName)}
                  </div>
                  <span className="text-white font-medium">{c.firstName} {c.lastName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-400">{c.email}</td>
              <td className="px-4 py-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-end">
                  <Button variant="danger" onClick={(e) => onDelete(e, c)}>Supprimer</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
