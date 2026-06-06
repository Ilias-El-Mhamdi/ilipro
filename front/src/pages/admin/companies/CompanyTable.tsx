import type { Company } from '../../../lib/queries';
import { Button } from '../../../components/atoms/Button';

interface Props {
  companies: Company[];
  onNavigate: (slug: string) => void;
  onEdit: (e: React.MouseEvent, company: Company) => void;
  onDelete: (e: React.MouseEvent, slug: string) => void;
}

export function CompanyTable({ companies, onNavigate, onEdit, onDelete }: Props) {
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-900 text-gray-400">
          <tr>
            <th className="text-left px-4 py-3">Nom</th>
            <th className="text-left px-4 py-3">Créée le</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr
              key={c.id}
              onClick={() => onNavigate(c.slug)}
              className="border-t border-gray-800 hover:bg-gray-900/50 cursor-pointer"
            >
              <td className="px-4 py-3 text-white font-medium">{c.name}</td>
              <td className="px-4 py-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={(e) => onEdit(e, c)}>Éditer</Button>
                  <Button variant="danger" onClick={(e) => onDelete(e, c.slug)}>Supprimer</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
