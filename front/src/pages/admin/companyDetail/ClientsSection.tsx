import type { Client, Project } from '../../../lib/queries';
import { UserCard } from '../../../components/molecules/UserCard';
import { LoadingText } from '../../../components/atoms/LoadingText';
import { EmptyText } from '../../../components/atoms/EmptyText';

interface Props {
  clients: Client[];
  isLoading: boolean;
  projects: Project[];
  companySlug: string;
  companyId: string;
  onDelete: (client: Client) => void;
  onAdd: () => void;
  onLink: () => void;
}

export function ClientsSection({ clients, isLoading, projects, companySlug, companyId, onDelete, onAdd, onLink }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs text-gray-500 uppercase tracking-widest">Utilisateurs</h2>
        <div className="flex items-center gap-3">
          <button onClick={onLink} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">+ Lier</button>
          <button onClick={onAdd} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">+ Ajouter</button>
        </div>
      </div>

      {isLoading ? (
        <LoadingText className="text-gray-600 text-sm" />
      ) : clients.length === 0 ? (
        <EmptyText message="Aucun client pour cette entreprise." className="text-gray-600 text-sm" />
      ) : (
        <div className="grid grid-cols-6 gap-3">
          {clients.map((client) => (
            <div key={client.id} id={`user-${client.id}`} className="rounded-xl transition-shadow duration-300">
              <UserCard
                client={client}
                license={client.license ?? null}
                projects={projects}
                companySlug={companySlug}
                companyId={companyId}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
