import type { License, Project } from '../../../lib/queries';

export function PanelProjects({ license, projects }: { license: License | null; projects: Project[] }) {
  if (!license) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-600">Aucune licence</div>
    );
  }
  if (license.type === 'ADMIN') {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-gray-500 mb-1">Projets autorisés</p>
        {projects.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <span className="text-green-400 text-xs">✓</span>
            <span className="text-xs text-gray-300">{p.name}</span>
            <span className="ml-auto text-xs text-gray-600">admin</span>
          </div>
        ))}
        {projects.length === 0 && <p className="text-xs text-gray-600">Aucun projet dans cette entreprise</p>}
      </div>
    );
  }
  const grantedIds = new Set(license.projectAccess.map((a) => a.projectId));
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gray-500 mb-1">Projets autorisés</p>
      {projects.length === 0 && <p className="text-xs text-gray-600">Aucun projet dans cette entreprise</p>}
      {projects.map((p) => {
        const granted = grantedIds.has(p.id);
        return (
          <div key={p.id} className="flex items-center gap-2">
            <span className={`text-xs ${granted ? 'text-green-400' : 'text-gray-700'}`}>{granted ? '✓' : '✗'}</span>
            <span className={`text-xs ${granted ? 'text-gray-300' : 'text-gray-600'}`}>{p.name}</span>
          </div>
        );
      })}
    </div>
  );
}
