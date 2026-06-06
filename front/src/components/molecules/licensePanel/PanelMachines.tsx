import type { License } from '../../../lib/queries';

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
