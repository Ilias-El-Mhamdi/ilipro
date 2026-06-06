import type { LicenseMachine } from '../../../lib/queries';

interface Props {
  machineLock: boolean;
  onToggle: () => void;
  maxMachines: number;
  onMaxMachinesChange: (n: number) => void;
  machines: LicenseMachine[];
  onRemoveMachine: (machineId: string) => void;
  removePending: boolean;
}

export function MachineLockSection({ machineLock, onToggle, maxMachines, onMaxMachinesChange, machines, onRemoveMachine, removePending }: Props) {
  return (
    <div className="border-t border-gray-800 pt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Machine Lock</p>
        <button
          onClick={onToggle}
          className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${machineLock ? 'bg-indigo-600' : 'bg-gray-700'}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${machineLock ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {machineLock && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1">PCs autorisés</p>
          <input
            type="number"
            min={1}
            value={maxMachines}
            onChange={(e) => onMaxMachinesChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white w-24 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {machines.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">
            Machines enregistrées ({machines.length}/{machineLock ? maxMachines : '∞'})
          </p>
          <div className="flex flex-col gap-1">
            {machines.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded px-3 py-2">
                <div>
                  <span className="text-xs font-mono text-gray-300">{m.machineId}</span>
                  {m.label && <span className="ml-2 text-xs text-gray-500">"{m.label}"</span>}
                  {m.lastSeenAt && (
                    <span className="ml-2 text-xs text-gray-600">
                      · vu {new Date(m.lastSeenAt).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveMachine(m.machineId)}
                  disabled={removePending}
                  className="text-gray-600 hover:text-red-400 text-xs transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
