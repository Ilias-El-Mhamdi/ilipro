import type { License, Project } from '../../lib/queries';
import { expiryDate } from '../../lib/utils';
import { TYPE_BADGE, STATUS_COLOR, STATUS_DOT, STATUS_LABEL } from '../../lib/licenseConstants';

// ─── Panel Général ────────────────────────────────────────────────────────────

export function PanelOverview({ license }: { license: License | null }) {
  if (!license) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-600">
        <span className="text-2xl">—</span>
        <span className="text-xs">Aucune licence</span>
      </div>
    );
  }
  const badge = TYPE_BADGE[license.type];
  const expiry = expiryDate(license);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Licence</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Statut</span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_COLOR[license.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[license.status]}`} />
          {STATUS_LABEL[license.status]}
        </span>
      </div>
      {license.type === 'ADMIN' ? (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Expire le</span>
          <span className="text-xs text-gray-500">Jamais</span>
        </div>
      ) : expiry ? (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Expire le</span>
          <span className="text-xs text-gray-300">{expiry}</span>
        </div>
      ) : null}
      {license.type === 'CLASSIC' && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Prix</span>
          <span className={`text-xs font-semibold ${license.priceLabel ? 'text-white' : 'text-gray-600'}`}>
            {license.priceLabel ?? '—'}
          </span>
        </div>
      )}
      {license.machineLock && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Machines</span>
          <span className="text-xs text-gray-300">🔒 {license.machines.length} / {license.maxMachines}</span>
        </div>
      )}
    </div>
  );
}

// ─── Panel Projets ────────────────────────────────────────────────────────────

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

// ─── Panel Machines ───────────────────────────────────────────────────────────

export function PanelMachines({ license }: { license: License | null }) {
  if (!license) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-600">Aucune licence</div>
    );
  }
  if (!license.machineLock) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-600">
        <span className="text-lg">🌐</span>
        <span className="text-xs">Accès libre — aucun verrouillage machine</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gray-500 mb-1">Machines ({license.machines.length} / {license.maxMachines})</p>
      {license.machines.length === 0 && <p className="text-xs text-gray-600">Aucune machine enregistrée</p>}
      {license.machines.map((m) => (
        <div key={m.id} className="bg-gray-800/60 rounded px-2 py-1.5">
          <p className="text-xs font-mono text-gray-300 truncate">{m.machineId}</p>
          <p className="text-xs text-gray-600 truncate">
            {m.label ? `"${m.label}"` : ''}
            {m.lastSeenAt ? ` · vu ${new Date(m.lastSeenAt).toLocaleDateString('fr-FR')}` : ' · jamais vu'}
          </p>
        </div>
      ))}
    </div>
  );
}
