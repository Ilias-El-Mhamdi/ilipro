import type { LicenseType, Project } from '../../../lib/queries';

interface Props {
  type: LicenseType;
  projects: Project[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function LicenseProjectSelector({ type, projects, selectedIds, onToggle }: Props) {
  if (type === 'ADMIN') {
    return <p className="text-xs text-gray-500 italic">Accès total — tous les projets, sans expiration.</p>;
  }
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Projets autorisés</p>
      <div className="flex flex-col gap-1">
        {projects.map((p) => (
          <label key={p.id} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedIds.includes(p.id)}
              onChange={() => onToggle(p.id)}
              className="accent-indigo-500"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{p.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
